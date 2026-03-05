"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { usersApi, chaptersApi, type CalendarChapter } from "@/lib/api";
import {
  ArrowLeft, ChevronLeft, ChevronRight, CalendarDays,
  Loader2, X, Circle, Clock, EyeOff,
} from "lucide-react";

/* ─── Helpers ───────────────────────────────────────── */

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatMonth(d: Date) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

function abbreviate(title: string, maxLen = 6) {
  return title.length > maxLen ? title.slice(0, maxLen) + "…" : title;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/* ─── Main Page ─────────────────────────────────────── */

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();

  const [chapters, setChapters] = useState<CalendarChapter[]>([]);
  const [novels, setNovels] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [filterNovelId, setFilterNovelId] = useState<string>("all");
  const [editingChapter, setEditingChapter] = useState<CalendarChapter | null>(null);
  const [saving, setSaving] = useState(false);

  // Popover form state
  const [scheduleMode, setScheduleMode] = useState<"private" | "public" | "scheduled">("private");
  const [scheduleDate, setScheduleDate] = useState("");

  // Fetch calendar data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await usersApi.calendar();
      setChapters(res.data);
      setNovels(res.novels);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) fetchData();
  }, [authLoading, user, fetchData]);

  // Filtered chapters
  const filtered = useMemo(
    () => filterNovelId === "all" ? chapters : chapters.filter((c) => c.novel_id === filterNovelId),
    [chapters, filterNovelId]
  );

  // Map chapters to date keys
  const dateMap = useMemo(() => {
    const map = new Map<string, CalendarChapter[]>();
    for (const ch of filtered) {
      let d: string | null = null;
      if (ch.is_public && !ch.scheduled_at) {
        d = dateKey(new Date(ch.updated_at));
      } else if (!ch.is_public && ch.scheduled_at) {
        d = dateKey(new Date(ch.scheduled_at));
      }
      if (d) {
        if (!map.has(d)) map.set(d, []);
        map.get(d)!.push(ch);
      }
    }
    return map;
  }, [filtered]);

  // Unassigned drafts
  const unassigned = useMemo(
    () => filtered.filter((ch) => !ch.is_public && !ch.scheduled_at),
    [filtered]
  );

  // Month navigation
  const prevMonth = () => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  const goToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  // Open popover for a chapter
  const openEditor = (ch: CalendarChapter) => {
    setEditingChapter(ch);
    if (ch.is_public) {
      setScheduleMode("public");
      setScheduleDate("");
    } else if (ch.scheduled_at) {
      setScheduleMode("scheduled");
      // Convert to datetime-local format
      const d = new Date(ch.scheduled_at);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      setScheduleDate(local.toISOString().slice(0, 16));
    } else {
      setScheduleMode("private");
      setScheduleDate("");
    }
  };

  // Save schedule
  const saveSchedule = async () => {
    if (!editingChapter) return;
    setSaving(true);
    try {
      let is_public = false;
      let scheduled_at: string | null = null;

      if (scheduleMode === "public") {
        is_public = true;
      } else if (scheduleMode === "scheduled") {
        if (!scheduleDate) return;
        scheduled_at = new Date(scheduleDate).toISOString();
      }

      await chaptersApi.updateSchedule(editingChapter.novel_id, editingChapter.id, {
        is_public,
        scheduled_at,
      });

      // Update local state
      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === editingChapter.id ? { ...ch, is_public, scheduled_at, updated_at: is_public ? new Date().toISOString() : ch.updated_at } : ch
        )
      );
      setEditingChapter(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // Calendar grid
  const { firstDay, daysInMonth } = getMonthDays(currentMonth.getFullYear(), currentMonth.getMonth());
  const todayKey = dateKey(new Date());

  if (authLoading || (!user && !authLoading)) {
    return (
      <>
        <Header />
        <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#C5BDB2" }} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors"
          style={{ color: "#8A8478" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          연재 관리로 돌아가기
        </Link>

        {/* Title */}
        <h1
          className="text-xl font-semibold mb-6"
          style={{ fontFamily: "'Cormorant', Georgia, serif", color: "#2C2A25" }}
        >
          연재 달력
        </h1>

        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Novel filter */}
          <select
            value={filterNovelId}
            onChange={(e) => setFilterNovelId(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-sm outline-none transition-colors"
            style={{
              border: "1px solid #E8E2D9",
              backgroundColor: "#FDFBF7",
              color: "#2C2A25",
            }}
          >
            <option value="all">전체 소설</option>
            {novels.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>

          {/* Month nav */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-sm transition-colors hover:bg-[#F5F0E8]"
              style={{ color: "#8A8478" }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span
              className="text-sm font-medium min-w-[100px] text-center"
              style={{ color: "#2C2A25" }}
            >
              {formatMonth(currentMonth)}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-sm transition-colors hover:bg-[#F5F0E8]"
              style={{ color: "#8A8478" }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={goToday}
            className="text-xs px-3 py-1.5 rounded-sm transition-colors"
            style={{
              border: "1px solid #E8E2D9",
              backgroundColor: "#FDFBF7",
              color: "#8A8478",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#D44B20";
              e.currentTarget.style.color = "#D44B20";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E8E2D9";
              e.currentTarget.style.color = "#8A8478";
            }}
          >
            오늘
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#C5BDB2" }} />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-sm" style={{ color: "#D44B20" }}>{error}</p>
            <button onClick={fetchData} className="text-xs mt-2 underline" style={{ color: "#8A8478" }}>
              다시 시도
            </button>
          </div>
        ) : (
          <>
            {/* Calendar grid */}
            <div
              className="rounded-sm overflow-hidden mb-8"
              style={{ border: "1px solid #E8E2D9" }}
            >
              {/* Weekday header */}
              <div
                className="grid grid-cols-7"
                style={{ backgroundColor: "#F5F0E8", borderBottom: "1px solid #E8E2D9" }}
              >
                {WEEKDAYS.map((d, i) => (
                  <div
                    key={d}
                    className="text-center text-[11px] font-medium py-2"
                    style={{ color: i === 0 ? "#C05040" : i === 6 ? "#3A6FA0" : "#8A8478" }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7" style={{ backgroundColor: "#FDFBF7" }}>
                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="min-h-[80px] sm:min-h-[96px]"
                    style={{ borderBottom: "1px solid #F0EBE3", borderRight: "1px solid #F0EBE3" }}
                  />
                ))}

                {/* Actual days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dKey = dateKey(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                  const dayChapters = dateMap.get(dKey) ?? [];
                  const isToday = dKey === todayKey;
                  const dayOfWeek = (firstDay + i) % 7;

                  return (
                    <div
                      key={day}
                      className="min-h-[80px] sm:min-h-[96px] p-1 relative"
                      style={{
                        borderBottom: "1px solid #F0EBE3",
                        borderRight: "1px solid #F0EBE3",
                        backgroundColor: isToday ? "rgba(212,75,32,0.03)" : undefined,
                      }}
                    >
                      {/* Day number */}
                      <span
                        className={`text-[11px] font-medium leading-none ${isToday ? "inline-flex items-center justify-center w-5 h-5 rounded-full" : ""}`}
                        style={{
                          color: isToday
                            ? "#fff"
                            : dayOfWeek === 0
                            ? "#C05040"
                            : dayOfWeek === 6
                            ? "#3A6FA0"
                            : "#8A8478",
                          backgroundColor: isToday ? "#D44B20" : undefined,
                        }}
                      >
                        {day}
                      </span>

                      {/* Chapter chips */}
                      <div className="mt-0.5 flex flex-col gap-0.5">
                        {dayChapters.slice(0, 3).map((ch) => (
                          <button
                            key={ch.id}
                            onClick={() => openEditor(ch)}
                            className="w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded-sm truncate transition-opacity hover:opacity-80"
                            style={{
                              backgroundColor: ch.is_public ? "rgba(45,122,58,0.1)" : "rgba(217,119,6,0.1)",
                              color: ch.is_public ? "#2D7A3A" : "#D97706",
                            }}
                            title={`${ch.novel_title} ${ch.number}화 — ${ch.title}`}
                          >
                            {abbreviate(ch.novel_title)} {ch.number}화
                          </button>
                        ))}
                        {dayChapters.length > 3 && (
                          <span className="text-[10px] px-1" style={{ color: "#C5BDB2" }}>
                            +{dayChapters.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unassigned drafts */}
            <div className="mb-8">
              <h2
                className="text-sm font-medium mb-3 flex items-center gap-2"
                style={{ color: "#2C2A25" }}
              >
                <EyeOff className="h-3.5 w-3.5" style={{ color: "#C5BDB2" }} />
                미배정 원고
                <span className="text-[11px] font-normal" style={{ color: "#C5BDB2" }}>
                  (비공개 & 예약 없음)
                </span>
              </h2>

              {unassigned.length === 0 ? (
                <p className="text-xs py-6 text-center" style={{ color: "#C5BDB2" }}>
                  모든 원고가 배정되었습니다
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {unassigned.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => openEditor(ch)}
                      className="text-xs px-3 py-2 rounded-sm transition-all"
                      style={{
                        border: "1px solid #E8E2D9",
                        backgroundColor: "#FDFBF7",
                        color: "#6B6560",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#D97706";
                        e.currentTarget.style.color = "#D97706";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#E8E2D9";
                        e.currentTarget.style.color = "#6B6560";
                      }}
                    >
                      {abbreviate(ch.novel_title)} {ch.number}화
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px]" style={{ color: "#8A8478" }}>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#2D7A3A" }} />
                공개
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#D97706" }} />
                예약
              </span>
            </div>
          </>
        )}
      </main>

      {/* Schedule Popover (overlay) */}
      {editingChapter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          onClick={() => setEditingChapter(null)}
        >
          <div
            className="w-full max-w-sm mx-4 rounded-sm shadow-lg"
            style={{ backgroundColor: "#FDFBF7", border: "1px solid #E8E2D9" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid #E8E2D9" }}
            >
              <div>
                <p className="text-xs" style={{ color: "#8A8478" }}>
                  {editingChapter.novel_title}
                </p>
                <p className="text-sm font-medium" style={{ color: "#2C2A25" }}>
                  {editingChapter.number}화 — {editingChapter.title}
                </p>
              </div>
              <button
                onClick={() => setEditingChapter(null)}
                className="p-1 rounded-sm hover:bg-[#F5F0E8] transition-colors"
              >
                <X className="h-4 w-4" style={{ color: "#8A8478" }} />
              </button>
            </div>

            {/* Options */}
            <div className="px-4 py-4 space-y-2">
              {/* Private */}
              <label
                className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer transition-colors"
                style={{
                  border: `1px solid ${scheduleMode === "private" ? "#D44B20" : "#E8E2D9"}`,
                  backgroundColor: scheduleMode === "private" ? "rgba(212,75,32,0.03)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="schedule"
                  checked={scheduleMode === "private"}
                  onChange={() => setScheduleMode("private")}
                  className="sr-only"
                />
                <EyeOff className="h-4 w-4 shrink-0" style={{ color: scheduleMode === "private" ? "#D44B20" : "#C5BDB2" }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: "#2C2A25" }}>비공개</p>
                  <p className="text-[11px]" style={{ color: "#8A8478" }}>독자에게 보이지 않습니다</p>
                </div>
              </label>

              {/* Public now */}
              <label
                className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer transition-colors"
                style={{
                  border: `1px solid ${scheduleMode === "public" ? "#2D7A3A" : "#E8E2D9"}`,
                  backgroundColor: scheduleMode === "public" ? "rgba(45,122,58,0.03)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="schedule"
                  checked={scheduleMode === "public"}
                  onChange={() => setScheduleMode("public")}
                  className="sr-only"
                />
                <Circle className="h-4 w-4 shrink-0" style={{ color: scheduleMode === "public" ? "#2D7A3A" : "#C5BDB2" }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: "#2C2A25" }}>즉시 공개</p>
                  <p className="text-[11px]" style={{ color: "#8A8478" }}>지금 바로 공개합니다</p>
                </div>
              </label>

              {/* Scheduled */}
              <label
                className="flex items-start gap-3 px-3 py-2.5 rounded-sm cursor-pointer transition-colors"
                style={{
                  border: `1px solid ${scheduleMode === "scheduled" ? "#D97706" : "#E8E2D9"}`,
                  backgroundColor: scheduleMode === "scheduled" ? "rgba(217,119,6,0.03)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="schedule"
                  checked={scheduleMode === "scheduled"}
                  onChange={() => setScheduleMode("scheduled")}
                  className="sr-only"
                />
                <Clock className="h-4 w-4 shrink-0 mt-0.5" style={{ color: scheduleMode === "scheduled" ? "#D97706" : "#C5BDB2" }} />
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: "#2C2A25" }}>예약 공개</p>
                  <p className="text-[11px] mb-2" style={{ color: "#8A8478" }}>지정된 시간에 자동 공개됩니다</p>
                  {scheduleMode === "scheduled" && (
                    <input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 rounded-sm outline-none"
                      style={{
                        border: "1px solid #E8E2D9",
                        backgroundColor: "#fff",
                        color: "#2C2A25",
                      }}
                      min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                    />
                  )}
                </div>
              </label>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-2 px-4 py-3"
              style={{ borderTop: "1px solid #E8E2D9" }}
            >
              <button
                onClick={() => setEditingChapter(null)}
                className="text-xs px-4 py-1.5 rounded-sm transition-colors"
                style={{ color: "#8A8478" }}
              >
                취소
              </button>
              <button
                onClick={saveSchedule}
                disabled={saving || (scheduleMode === "scheduled" && !scheduleDate)}
                className="text-xs px-4 py-1.5 rounded-sm transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "#D44B20",
                  color: "#fff",
                }}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#B83D18"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#D44B20"; }}
              >
                {saving ? "저장 중…" : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

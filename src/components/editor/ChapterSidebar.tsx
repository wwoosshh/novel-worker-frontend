"use client";

import { Plus, ArrowLeft, BookOpen, Trash2, Settings } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chapter } from "@/lib/api";

interface ChapterSidebarProps {
  novelId: string;
  novelTitle: string;
  chapters: Chapter[];
  activeChapterId: string | null;
  onSelect: (chapter: Chapter) => void;
  onCreate: () => void;
  onDelete: (chapter: Chapter) => void;
  onBack: () => void;
  creating: boolean;
}

export function ChapterSidebar({
  novelId,
  novelTitle,
  chapters,
  activeChapterId,
  onSelect,
  onCreate,
  onDelete,
  onBack,
  creating,
}: ChapterSidebarProps) {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#FDFBF7" }}>
      {/* Back + title */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs mb-3 transition-colors"
          style={{ color: "#8A8478" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          연재 관리
        </button>
        <h2
          className="text-sm font-semibold truncate"
          style={{ fontFamily: "'Noto Serif KR', serif", color: "#1A1814" }}
        >
          {novelTitle}
        </h2>
      </div>

      <div className="mx-3 h-px my-2" style={{ backgroundColor: "#E8E2D9" }} />

      {/* New chapter + settings */}
      <div className="px-3 mb-2 flex gap-1.5">
        <button
          onClick={onCreate}
          disabled={creating}
          className="flex items-center gap-1.5 flex-1 h-8 px-2.5 text-xs font-medium rounded-sm transition-all"
          style={{
            backgroundColor: "rgba(212,75,32,0.06)",
            border: "1px solid rgba(212,75,32,0.15)",
            color: "#D44B20",
            opacity: creating ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.06)";
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          {creating ? "생성 중..." : "새 화 추가"}
        </button>
        <Link
          href={`/studio/${novelId}/settings`}
          className="flex items-center justify-center h-8 w-8 shrink-0 rounded-sm transition-all"
          style={{
            border: "1px solid #E8E2D9",
            color: "#8A8478",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#D4C9B8";
            e.currentTarget.style.color = "#6B6560";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#E8E2D9";
            e.currentTarget.style.color = "#8A8478";
          }}
          title="소설 설정"
        >
          <Settings className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Chapter list */}
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4 space-y-0.5">
          {chapters.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <BookOpen className="h-5 w-5 mb-2" style={{ color: "#C5BDB2" }} />
              <p className="text-[11px]" style={{ color: "#8A8478" }}>
                아직 작성한 화가 없습니다
              </p>
            </div>
          )}
          {chapters.map((ch) => {
            const isActive = ch.id === activeChapterId;
            return (
              <div
                key={ch.id}
                className="group flex items-center rounded-sm transition-all"
                style={{
                  backgroundColor: isActive ? "rgba(212,75,32,0.08)" : "transparent",
                  borderLeft: isActive ? "2px solid #D44B20" : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "#F5F1EB";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <button
                  onClick={() => onSelect(ch)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left px-2.5 py-2"
                >
                  <span
                    className="text-[10px] font-medium shrink-0 w-5 text-center"
                    style={{ color: isActive ? "#D44B20" : "#8A8478" }}
                  >
                    {ch.number}
                  </span>
                  <span
                    className="text-xs truncate"
                    style={{ color: isActive ? "#1A1814" : "#6B6560" }}
                  >
                    {ch.title || "제목 없음"}
                  </span>
                  {ch.is_public && (
                    <span
                      className="shrink-0 ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "#2D7A3A" }}
                      title="공개"
                    />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(ch);
                  }}
                  className="hidden group-hover:flex items-center justify-center h-6 w-6 mr-1.5 shrink-0 rounded-sm transition-colors"
                  style={{ color: "#C5BDB2" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#C5BDB2")}
                  title="삭제"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

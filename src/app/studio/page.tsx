"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Plus,
  ChevronRight,
  BookOpen,
  Eye,
  Clock,
  MoreHorizontal,
  PenLine,
  Archive,
  Settings,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Mock data ─────────────────────────────────────── */
const MOCK_USER = {
  id: "u1",
  display_name: "김철수",
  username: "cheolsu",
};

const MOCK_NOVELS = [
  {
    id: "n1",
    title: "검제가 되어버린 나",
    genre: "판타지",
    status: "ongoing" as const,
    chapter_count: 124,
    view_count: 2847391,
    subscriber_count: 18420,
    updated_at: "2026-03-02T14:30:00Z",
    last_chapter_title: "124화. 심연의 끝에서",
  },
  {
    id: "n2",
    title: "회귀한 마법사의 탑",
    genre: "판타지",
    status: "hiatus" as const,
    chapter_count: 67,
    view_count: 985234,
    subscriber_count: 6201,
    updated_at: "2026-01-15T10:00:00Z",
    last_chapter_title: "67화. 잊혀진 기억",
  },
  {
    id: "n3",
    title: "어둠 속의 빛",
    genre: "로맨스",
    status: "completed" as const,
    chapter_count: 200,
    view_count: 1543200,
    subscriber_count: 9830,
    updated_at: "2025-11-20T09:00:00Z",
    last_chapter_title: "200화. 에필로그",
  },
];

const STATUS_CONFIG = {
  ongoing:   { label: "연재중", color: "#58A064", bg: "rgba(88,160,100,0.1)",  border: "rgba(88,160,100,0.2)" },
  hiatus:    { label: "휴재",   color: "#C0954A", bg: "rgba(192,149,74,0.1)",  border: "rgba(192,149,74,0.2)" },
  completed: { label: "완결",   color: "#6B9FD4", bg: "rgba(107,159,212,0.1)", border: "rgba(107,159,212,0.2)" },
};

/* ─── Novel Row ─────────────────────────────────────── */
function NovelRow({ novel }: { novel: (typeof MOCK_NOVELS)[0] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = STATUS_CONFIG[novel.status];

  const updatedDate = new Date(novel.updated_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="group relative flex items-center gap-4 px-5 py-4 rounded-sm transition-all"
      style={{
        backgroundColor: "#0C0A08",
        border: "1px solid #302B22",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "#3C362C")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "#302B22")
      }
    >
      {/* Cover placeholder */}
      <div
        className="shrink-0 w-10 h-[54px] rounded-sm overflow-hidden"
        style={{
          background: "linear-gradient(150deg, #1a1210 0%, #2c1f16 100%)",
          border: "1px solid #302B22",
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen className="h-4 w-4" style={{ color: "#302B22" }} />
        </div>
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3
            className="text-sm font-medium truncate"
            style={{
              fontFamily: "'Noto Serif KR', serif",
              color: "#EDE8DC",
            }}
          >
            {novel.title}
          </h3>
          <span
            className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-sm font-medium"
            style={{
              color: status.color,
              backgroundColor: status.bg,
              border: `1px solid ${status.border}`,
            }}
          >
            {status.label}
          </span>
          <span
            className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-sm"
            style={{
              color: "#5A544A",
              backgroundColor: "#141210",
              border: "1px solid #302B22",
            }}
          >
            {novel.genre}
          </span>
        </div>

        <p className="text-[11px] truncate" style={{ color: "#5A544A" }}>
          {novel.last_chapter_title}
        </p>

        {/* Stats row (mobile hidden except on larger screens) */}
        <div className="hidden sm:flex items-center gap-4 mt-1.5">
          {[
            {
              icon: <BookOpen className="h-3 w-3" />,
              value: `${novel.chapter_count}화`,
            },
            {
              icon: <Eye className="h-3 w-3" />,
              value: novel.view_count.toLocaleString(),
            },
            {
              icon: <TrendingUp className="h-3 w-3" />,
              value: `구독 ${novel.subscriber_count.toLocaleString()}`,
            },
            {
              icon: <Clock className="h-3 w-3" />,
              value: updatedDate,
            },
          ].map(({ icon, value }) => (
            <div
              key={value}
              className="flex items-center gap-1 text-[10px]"
              style={{ color: "#5A544A" }}
            >
              {icon}
              {value}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/studio/${novel.id}`}
          className="hidden sm:flex items-center gap-1.5 h-7 px-3 text-xs rounded-sm font-medium transition-all"
          style={{
            backgroundColor: "rgba(191,151,66,0.1)",
            border: "1px solid rgba(191,151,66,0.2)",
            color: "#BF9742",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(191,151,66,0.18)";
            e.currentTarget.style.borderColor = "rgba(191,151,66,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(191,151,66,0.1)";
            e.currentTarget.style.borderColor = "rgba(191,151,66,0.2)";
          }}
        >
          <PenLine className="h-3 w-3" />
          작업하기
        </Link>

        {/* More menu */}
        <div className="relative">
          <button
            className="flex items-center justify-center h-7 w-7 rounded-sm transition-colors"
            style={{
              border: "1px solid #302B22",
              color: "#5A544A",
            }}
            onClick={() => setMenuOpen(!menuOpen)}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#9E9688")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#5A544A")}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-36 rounded-sm overflow-hidden z-20"
              style={{
                backgroundColor: "#1C1914",
                border: "1px solid #302B22",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              {[
                { icon: <PenLine className="h-3.5 w-3.5" />, label: "작업하기", href: `/studio/${novel.id}` },
                { icon: <Settings className="h-3.5 w-3.5" />, label: "소설 설정", href: `/studio/${novel.id}/settings` },
                { icon: <Archive className="h-3.5 w-3.5" />, label: "보관하기", href: "#" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs transition-colors"
                  style={{ color: "#9E9688" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#262218";
                    e.currentTarget.style.color = "#EDE8DC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#9E9688";
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  <span style={{ color: "#5A544A" }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function StudioPage() {
  const totalViews = MOCK_NOVELS.reduce((s, n) => s + n.view_count, 0);
  const totalSubs = MOCK_NOVELS.reduce((s, n) => s + n.subscriber_count, 0);

  return (
    <>
      <Header user={MOCK_USER} />
      <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1
              className="text-xl font-bold mb-1"
              style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                color: "#EDE8DC",
              }}
            >
              연재 관리
            </h1>
            <p className="text-xs" style={{ color: "#5A544A" }}>
              {MOCK_USER.display_name} 작가님의 작업 공간
            </p>
          </div>
          <Link
            href="/studio/new"
            className="flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-sm transition-colors shrink-0"
            style={{ backgroundColor: "#BF9742", color: "#0C0A08" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#D4AF5F")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#BF9742")
            }
          >
            <Plus className="h-4 w-4" />
            새 소설
          </Link>
        </div>

        {/* Summary stats */}
        <div
          className="grid grid-cols-3 rounded-sm overflow-hidden mb-8"
          style={{ border: "1px solid #302B22" }}
        >
          {[
            { label: "내 소설", value: `${MOCK_NOVELS.length}편` },
            { label: "총 조회수", value: totalViews.toLocaleString() },
            { label: "총 구독자", value: totalSubs.toLocaleString() },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-4 gap-1"
              style={{
                backgroundColor: "#141210",
                borderRight: i < 2 ? "1px solid #302B22" : undefined,
              }}
            >
              <span
                className="text-base font-bold"
                style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  color: "#BF9742",
                }}
              >
                {stat.value}
              </span>
              <span className="text-[10px]" style={{ color: "#5A544A" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Section label */}
        <div className="flex items-center gap-2 mb-3">
          <p
            className="text-[9px] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "#5A544A" }}
          >
            내 소설 목록
          </p>
          <div className="flex-1 h-px" style={{ backgroundColor: "#1C1914" }} />
        </div>

        {/* Novel list */}
        {MOCK_NOVELS.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-sm"
            style={{ border: "2px dashed #302B22" }}
          >
            <p
              className="text-base font-medium mb-2"
              style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                color: "#5A544A",
              }}
            >
              아직 작성한 소설이 없습니다
            </p>
            <p className="text-xs mb-6" style={{ color: "#5A544A" }}>
              첫 번째 이야기를 시작해 보세요
            </p>
            <Link
              href="/studio/new"
              className="flex items-center gap-1.5 h-9 px-5 text-sm font-medium rounded-sm transition-colors"
              style={{ backgroundColor: "#BF9742", color: "#0C0A08" }}
            >
              <Plus className="h-4 w-4" />
              새 소설 만들기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {MOCK_NOVELS.map((novel) => (
              <NovelRow key={novel.id} novel={novel} />
            ))}
          </div>
        )}

        {/* Quick links */}
        <div
          className="mt-8 grid grid-cols-2 gap-2 rounded-sm overflow-hidden"
          style={{ border: "1px solid #302B22" }}
        >
          {[
            { label: "공지사항 관리", desc: "독자에게 전달할 공지를 작성합니다", href: "/studio/notices" },
            { label: "연재 달력", desc: "업로드 일정을 관리합니다", href: "/studio/calendar" },
          ].map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between px-4 py-3 transition-colors"
              style={{
                backgroundColor: "#141210",
                borderRight: i === 0 ? "1px solid #302B22" : undefined,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#1C1914")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#141210")
              }
            >
              <div>
                <p className="text-xs font-medium" style={{ color: "#EDE8DC" }}>
                  {item.label}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "#5A544A" }}>
                  {item.desc}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "#5A544A" }} />
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

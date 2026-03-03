"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { noticesApi, type Notice } from "@/lib/api";
import { ArrowLeft, Loader2, Megaphone } from "lucide-react";

export default function NoticeReaderPage() {
  const params = useParams();
  const novelId = params.id as string;
  const noticeId = params.noticeId as string;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    noticesApi
      .get(novelId, noticeId)
      .then((res) => setNotice(res.data))
      .catch((err) => console.error("Failed to load notice:", err))
      .finally(() => setLoading(false));
  }, [novelId, noticeId]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FDFBF7" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#D44B20" }} />
          <p className="text-xs" style={{ color: "#8A8478" }}>불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "#FDFBF7" }}
      >
        <p className="text-sm" style={{ color: "#8A8478" }}>
          공지사항을 찾을 수 없습니다.
        </p>
        <Link
          href={`/novel/${novelId}`}
          className="text-xs underline"
          style={{ color: "#D44B20" }}
        >
          소설 페이지로 돌아가기
        </Link>
      </div>
    );
  }

  const novelTitle = notice.novel_title ?? "소설";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FDFBF7" }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          borderColor: "#E8E2D9",
          backgroundColor: "rgba(253,251,247,0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-[720px] mx-auto px-4 flex items-center justify-between h-12">
          <Link
            href={`/novel/${novelId}`}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: "#8A8478" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span
              className="truncate max-w-[140px] sm:max-w-[240px]"
              style={{ fontFamily: "'Noto Serif KR', serif" }}
            >
              {novelTitle}
            </span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#D44B20" }}>
            <Megaphone className="h-3.5 w-3.5" />
            공지사항
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6">
          {/* Notice header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="h-4 w-4" style={{ color: "#D44B20" }} />
              <span className="text-[10px] font-medium" style={{ color: "#D44B20" }}>공지사항</span>
            </div>
            <h1
              className="text-xl sm:text-2xl font-bold mb-3"
              style={{ fontFamily: "'Cormorant', 'Noto Serif KR', Georgia, serif", color: "#1A1814" }}
            >
              {notice.title}
            </h1>
            <p className="text-xs" style={{ color: "#8A8478" }}>
              {new Date(notice.created_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px mb-8" style={{ backgroundColor: "#E8E2D9" }} />

          {/* Notice body */}
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ fontFamily: "'Noto Serif KR', serif", color: "#1A1814" }}
          >
            {notice.content}
          </div>
        </div>
      </main>

      {/* Bottom nav — only "목록" button, no prev/next */}
      <nav
        className="sticky bottom-0 border-t"
        style={{
          borderColor: "#E8E2D9",
          backgroundColor: "rgba(253,251,247,0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-[720px] mx-auto px-4 flex items-center justify-center h-12">
          <Link
            href={`/novel/${novelId}`}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: "#6B6560" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B6560")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            소설 페이지로 돌아가기
          </Link>
        </div>
      </nav>
    </div>
  );
}

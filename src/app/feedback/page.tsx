"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { feedbackApi, type FeedbackPost } from "@/lib/api";
import { MessageSquare, ChevronLeft, ChevronRight, PenLine, Loader2, Clock, User } from "lucide-react";

const PER_PAGE = 15;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function FeedbackListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await feedbackApi.list({ limit: PER_PAGE, offset: (p - 1) * PER_PAGE });
      setPosts(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const goPage = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  // Generate page numbers with ellipsis
  const pageNumbers: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (page > 3) pageNumbers.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pageNumbers.push(i);
    }
    if (page < totalPages - 2) pageNumbers.push("...");
    pageNumbers.push(totalPages);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FDFBF7" }}>
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <div
          className="border-b"
          style={{ borderColor: "#E8E2D9" }}
        >
          <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{
                    fontFamily: "'Cormorant', Georgia, serif",
                    color: "#1A1814",
                    lineHeight: 1.2,
                  }}
                >
                  Development <span style={{ color: "#D44B20" }}>Feedback</span>
                </h1>
                <p
                  className="mt-2 text-sm leading-relaxed max-w-md"
                  style={{ color: "#6B6560", fontFamily: "'Noto Serif KR', serif" }}
                >
                  노벨워커의 개발 방향과 기능에 대한 의견을 공유해주세요.
                  <br />
                  여러분의 피드백이 더 나은 서비스를 만듭니다.
                </p>
              </div>

              {user && (
                <Link
                  href="/feedback/new"
                  className="shrink-0 flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-md transition-all"
                  style={{
                    backgroundColor: "#D44B20",
                    color: "#FFFFFF",
                    boxShadow: "0 1px 3px rgba(212,75,32,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#B8401A";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(212,75,32,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#D44B20";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(212,75,32,0.2)";
                  }}
                >
                  <PenLine className="h-3.5 w-3.5" />
                  글쓰기
                </Link>
              )}
            </div>

            {/* Stats bar */}
            <div
              className="mt-6 flex items-center gap-4 text-xs"
              style={{ color: "#8A8478" }}
            >
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {total}개의 게시글
              </span>
              <span style={{ color: "#E8E2D9" }}>|</span>
              <span>
                {page} / {totalPages} 페이지
              </span>
            </div>
          </div>
        </div>

        {/* Post list */}
        <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                className="h-5 w-5 animate-spin"
                style={{ color: "#D44B20" }}
              />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <MessageSquare className="h-8 w-8" style={{ color: "#E8E2D9" }} />
              <p className="text-sm" style={{ color: "#8A8478" }}>
                아직 게시글이 없습니다
              </p>
              {user && (
                <Link
                  href="/feedback/new"
                  className="mt-2 text-sm font-medium transition-colors"
                  style={{ color: "#D44B20" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#B8401A")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#D44B20")}
                >
                  첫 번째 글을 작성해보세요
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#E8E2D9" }}>
              {posts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/feedback/${post.id}`}
                  className="block group"
                  style={{
                    borderColor: "#E8E2D9",
                    animation: `fadeUp 0.35s ease-out ${i * 0.03}s both`,
                  }}
                >
                  <div
                    className="flex items-start gap-4 py-4 px-3 -mx-3 rounded-md transition-colors"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* Number */}
                    <span
                      className="hidden sm:flex shrink-0 w-10 h-10 items-center justify-center rounded-md text-xs font-medium"
                      style={{
                        backgroundColor: "#F5F1EB",
                        color: "#8A8478",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {total - ((page - 1) * PER_PAGE + i)}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-sm font-medium truncate transition-colors"
                        style={{
                          color: "#1A1814",
                          fontFamily: "'Noto Serif KR', serif",
                        }}
                      >
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span
                          className="flex items-center gap-1 text-xs"
                          style={{ color: "#8A8478" }}
                        >
                          <User className="h-3 w-3" />
                          {post.author_name || post.author_username}
                        </span>
                        <span
                          className="flex items-center gap-1 text-xs"
                          style={{ color: "#8A8478" }}
                        >
                          <Clock className="h-3 w-3" />
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Comment count */}
                    <div
                      className="shrink-0 flex items-center gap-1 text-xs"
                      style={{ color: post.comment_count > 0 ? "#D44B20" : "#8A8478" }}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {post.comment_count}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-8 mb-4">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center justify-center h-8 w-8 rounded-md transition-colors"
                style={{
                  color: page <= 1 ? "#E8E2D9" : "#6B6560",
                  cursor: page <= 1 ? "default" : "pointer",
                }}
                onMouseEnter={(e) => { if (page > 1) e.currentTarget.style.backgroundColor = "#F5F1EB"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {pageNumbers.map((n, i) =>
                n === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="flex items-center justify-center h-8 w-8 text-xs"
                    style={{ color: "#8A8478" }}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={n}
                    onClick={() => goPage(n)}
                    className="flex items-center justify-center h-8 w-8 rounded-md text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: page === n ? "#1A1814" : "transparent",
                      color: page === n ? "#FDFBF7" : "#6B6560",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                    onMouseEnter={(e) => { if (page !== n) e.currentTarget.style.backgroundColor = "#F5F1EB"; }}
                    onMouseLeave={(e) => { if (page !== n) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    {n}
                  </button>
                )
              )}

              <button
                onClick={() => goPage(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center justify-center h-8 w-8 rounded-md transition-colors"
                style={{
                  color: page >= totalPages ? "#E8E2D9" : "#6B6560",
                  cursor: page >= totalPages ? "default" : "pointer",
                }}
                onMouseEnter={(e) => { if (page < totalPages) e.currentTarget.style.backgroundColor = "#F5F1EB"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Login CTA for non-logged-in users */}
          {!user && (
            <div
              className="mt-6 rounded-lg p-5 text-center border"
              style={{
                backgroundColor: "#F5F1EB",
                borderColor: "#E8E2D9",
              }}
            >
              <p className="text-sm" style={{ color: "#6B6560" }}>
                의견을 남기려면 로그인이 필요합니다
              </p>
              <Link
                href="/login?redirect=/feedback"
                className="inline-flex items-center gap-1.5 mt-3 h-8 px-4 text-sm font-medium rounded-md transition-all"
                style={{ backgroundColor: "#1A1814", color: "#FDFBF7" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2A2824")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1A1814")}
              >
                로그인
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

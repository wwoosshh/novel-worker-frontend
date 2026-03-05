"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { feedbackApi } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function FeedbackNewPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/feedback/new");
    }
  }, [user, authLoading, router]);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await feedbackApi.create({
        title: title.trim(),
        content: content.trim(),
      });
      router.push(`/feedback/${res.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글 작성에 실패했습니다.");
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: "#FDFBF7" }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#D44B20" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FDFBF7" }}>
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div style={{ borderColor: "#E8E2D9" }} className="border-b">
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-3">
            <Link
              href="/feedback"
              className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: "#8A8478" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
            >
              <ArrowLeft className="h-3 w-3" />
              게시판으로 돌아가기
            </Link>
          </div>
        </div>

        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h1
            className="text-xl sm:text-2xl font-bold tracking-tight"
            style={{
              fontFamily: "'Cormorant', Georgia, serif",
              color: "#1A1814",
            }}
          >
            새 글 작성
          </h1>
          <p
            className="mt-1.5 text-sm"
            style={{ color: "#8A8478" }}
          >
            개발 방향, 기능 제안, 버그 제보 등 자유롭게 작성해주세요.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#6B6560" }}
              >
                제목
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="게시글 제목을 입력하세요"
                className="w-full h-10 px-3 text-sm rounded-md outline-none transition-all"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E8E2D9",
                  color: "#1A1814",
                  fontFamily: "'Noto Serif KR', serif",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.4)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs" style={{ color: "#8A8478" }}>
                  {title.length}/200
                </span>
              </div>
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#6B6560" }}
              >
                내용
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={10000}
                rows={14}
                placeholder="내용을 입력하세요..."
                className="w-full px-3 py-3 text-sm rounded-md outline-none transition-all resize-y"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E8E2D9",
                  color: "#1A1814",
                  lineHeight: 1.8,
                  fontFamily: "'Noto Serif KR', serif",
                  minHeight: "240px",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.4)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs" style={{ color: "#8A8478" }}>
                  {content.length}/10000
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-md px-3 py-2 text-sm"
                style={{
                  backgroundColor: "rgba(192,84,74,0.08)",
                  color: "#C0544A",
                  border: "1px solid rgba(192,84,74,0.2)",
                }}
              >
                {error}
              </div>
            )}

            {/* Actions */}
            <div
              className="flex items-center justify-end gap-3 pt-4 border-t"
              style={{ borderColor: "#E8E2D9" }}
            >
              <Link
                href="/feedback"
                className="h-9 px-4 text-sm flex items-center rounded-md transition-colors"
                style={{ color: "#6B6560", border: "1px solid #E8E2D9" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#D4C9B8")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={!canSubmit}
                className="h-9 px-5 text-sm font-medium flex items-center gap-2 rounded-md transition-all"
                style={{
                  backgroundColor: canSubmit ? "#D44B20" : "#E8E2D9",
                  color: canSubmit ? "#FFFFFF" : "#8A8478",
                  cursor: canSubmit ? "pointer" : "default",
                  boxShadow: canSubmit ? "0 1px 3px rgba(212,75,32,0.2)" : "none",
                }}
                onMouseEnter={(e) => { if (canSubmit) { e.currentTarget.style.backgroundColor = "#B8401A"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(212,75,32,0.3)"; } }}
                onMouseLeave={(e) => { if (canSubmit) { e.currentTarget.style.backgroundColor = "#D44B20"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(212,75,32,0.2)"; } }}
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {submitting ? "게시 중..." : "게시하기"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import ImageExtension from "@tiptap/extension-image";
import { chaptersApi, commentsApi, type Chapter, type Comment } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, List, Loader2, MessageCircle, Trash2, Send } from "lucide-react";

export default function ChapterReaderPage() {
  const params = useParams();
  const novelId = params.id as string;
  const chapterNumber = parseInt(params.number as string, 10);

  const { user } = useAuth();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<string | null>(null);

  // 댓글 상태
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ─── 콘텐츠 보호 (JS 2차 방어) ─── */
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      // Ctrl+C, Ctrl+A, Ctrl+P, Ctrl+S
      if ((e.ctrlKey || e.metaKey) && ["c","a","p","s"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      // PrintScreen
      if (e.key === "PrintScreen") e.preventDefault();
    };
    document.addEventListener("copy", prevent);
    document.addEventListener("cut", prevent);
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("dragstart", prevent);
    document.addEventListener("keydown", preventKeys);
    return () => {
      document.removeEventListener("copy", prevent);
      document.removeEventListener("cut", prevent);
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("dragstart", prevent);
      document.removeEventListener("keydown", preventKeys);
    };
  }, []);

  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({ horizontalRule: false }),
      HorizontalRule,
      ImageExtension.configure({ inline: false }),
    ],
    editorProps: {
      attributes: {
        class: "novel-reader focus:outline-none",
      },
    },
  });

  useEffect(() => {
    const key = `${novelId}-${chapterNumber}`;
    if (fetchedRef.current === key) return;
    fetchedRef.current = key;

    async function load() {
      try {
        const chapterRes = await chaptersApi.get(novelId, chapterNumber);
        setChapter(chapterRes.data);
        // 댓글 로드
        try {
          const commentsRes = await commentsApi.list(novelId, chapterRes.data.id);
          setComments(commentsRes.data);
        } catch {
          // 댓글 로드 실패는 무시
        }
      } catch (err) {
        console.error("Failed to load chapter:", err);
        setError("챕터를 불러올 수 없습니다.");
        fetchedRef.current = null;
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [novelId, chapterNumber]);

  // Set content when chapter and editor are ready
  useEffect(() => {
    if (!editor || !chapter) return;
    const content = chapter.content;
    if (content && Object.keys(content).length > 0) {
      editor.commands.setContent(content);
    }
  }, [editor, chapter]);

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

  if (error || !chapter) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "#FDFBF7" }}
      >
        <p className="text-sm" style={{ color: "#8A8478" }}>
          {error ?? "챕터를 찾을 수 없습니다."}
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

  const novelTitle = chapter.novel_title ?? "소설";
  const totalChapters = chapter.novel_chapter_count ?? 0;
  const hasPrev = chapterNumber > 1;
  const hasNext = totalChapters > chapterNumber;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FDFBF7" }}>
      {/* CSS 1차 방어: JS 꺼도 동작 */}
      <style>{`
        .novel-protected {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
        @media print {
          .novel-protected { display: none !important; }
          body::after {
            content: "이 콘텐츠는 저작권 보호를 위해 인쇄할 수 없습니다.";
            display: block;
            text-align: center;
            padding: 4rem 2rem;
            font-size: 1rem;
            color: #8A8478;
          }
        }
      `}</style>
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

          <span
            className="text-xs font-medium"
            style={{ color: "#6B6560" }}
          >
            {chapterNumber}화
            {chapter.title ? ` — ${chapter.title}` : ""}
          </span>
        </div>
      </header>

      {/* Reader content */}
      <main className="flex-1 py-8 sm:py-12 novel-protected">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6">
          {/* Chapter header */}
          <div className="mb-8 text-center">
            <p className="text-xs mb-2" style={{ color: "#D44B20" }}>
              {chapterNumber}화
            </p>
            <h1
              className="text-xl sm:text-2xl font-bold"
              style={{ fontFamily: "'Cormorant', 'Noto Serif KR', Georgia, serif", color: "#1A1814" }}
            >
              {chapter.title || "제목 없음"}
            </h1>
          </div>

          {/* Content */}
          <EditorContent editor={editor} />

          {/* Donation CTA */}
          {chapter.author_donation_link && chapter.author_donation_link.startsWith("https://") && (
            <div className="mt-12 mb-4 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-px" style={{ backgroundColor: "#E8E2D9" }} />
                <Heart className="h-4 w-4" style={{ color: "#D44B20", opacity: 0.5 }} />
                <div className="flex-1 h-px" style={{ backgroundColor: "#E8E2D9" }} />
              </div>
              <p className="text-sm text-center" style={{ color: "#6B6560", fontFamily: "'Noto Serif KR', serif" }}>
                이 이야기가 마음에 드셨나요?
              </p>
              <a
                href={chapter.author_donation_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-9 px-5 text-sm font-medium rounded-sm transition-all"
                style={{
                  border: "1px solid rgba(212,75,32,0.25)",
                  backgroundColor: "rgba(212,75,32,0.04)",
                  color: "#D44B20",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.1)"; e.currentTarget.style.borderColor = "rgba(212,75,32,0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.04)"; e.currentTarget.style.borderColor = "rgba(212,75,32,0.25)"; }}
              >
                <Heart className="h-3.5 w-3.5" />
                {chapter.author_donation_label || "작가 응원하기"}
              </a>
            </div>
          )}
        </div>
      </main>

      {/* 댓글 섹션 — novel-protected 밖 (복사 가능) */}
      {chapter && (
        <section className="border-t" style={{ borderColor: "#E8E2D9", backgroundColor: "#FDFBF7" }}>
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="h-4 w-4" style={{ color: "#D44B20" }} />
              <h2
                className="text-base font-bold"
                style={{ fontFamily: "'Cormorant', 'Noto Serif KR', Georgia, serif", color: "#1A1814" }}
              >
                댓글 {comments.length > 0 && <span className="text-sm font-normal" style={{ color: "#8A8478" }}>{comments.length}</span>}
              </h2>
            </div>

            {/* 댓글 입력 */}
            {user ? (
              <div className="mb-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 남겨주세요..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm rounded-sm outline-none transition-all resize-none"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E8E2D9",
                    color: "#1A1814",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    lineHeight: 1.7,
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.35)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={async () => {
                      if (!commentText.trim() || submitting) return;
                      setSubmitting(true);
                      try {
                        const res = await commentsApi.create(novelId, chapter.id, { content: commentText.trim() });
                        setComments((prev) => [...prev, res.data]);
                        setCommentText("");
                      } catch (err) {
                        console.error("Failed to create comment:", err);
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    disabled={!commentText.trim() || submitting}
                    className="flex items-center gap-1.5 h-8 px-4 text-xs font-medium rounded-sm transition-colors disabled:opacity-40"
                    style={{ backgroundColor: "#D44B20", color: "#FFFFFF" }}
                    onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "#B8401A"; }}
                    onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "#D44B20"; }}
                  >
                    <Send className="h-3 w-3" />
                    {submitting ? "등록 중..." : "등록"}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="mb-6 px-4 py-3 rounded-sm text-center"
                style={{ backgroundColor: "#F5F1EB", border: "1px solid #E8E2D9" }}
              >
                <p className="text-sm" style={{ color: "#6B6560" }}>
                  댓글을 작성하려면{" "}
                  <Link href="/login" className="underline" style={{ color: "#D44B20" }}>
                    로그인
                  </Link>
                  이 필요합니다.
                </p>
              </div>
            )}

            {/* 댓글 목록 */}
            {comments.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "#8A8478" }}>
                아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="px-4 py-3 rounded-sm"
                    style={{ backgroundColor: "#F5F1EB", border: "1px solid #E8E2D9" }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: "#1A1814" }}>
                          {c.author_name}
                        </span>
                        <span className="text-[10px]" style={{ color: "#C5BDB2" }}>
                          {new Date(c.created_at).toLocaleDateString("ko-KR", {
                            year: "numeric", month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {user && (user.id === c.author_id) && (
                        <button
                          onClick={async () => {
                            try {
                              await commentsApi.delete(novelId, chapter.id, c.id);
                              setComments((prev) => prev.filter((x) => x.id !== c.id));
                            } catch (err) {
                              console.error("Failed to delete comment:", err);
                            }
                          }}
                          className="text-xs flex items-center gap-1 transition-colors"
                          style={{ color: "#8A8478" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#C0544A")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <p
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ color: "#3A3630", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.7 }}
                    >
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Bottom navigation */}
      <nav
        className="sticky bottom-0 border-t"
        style={{
          borderColor: "#E8E2D9",
          backgroundColor: "rgba(253,251,247,0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-[720px] mx-auto px-4 flex items-center justify-between h-12">
          {hasPrev ? (
            <Link
              href={`/novel/${novelId}/chapter/${chapterNumber - 1}`}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: "#6B6560" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B6560")}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              이전 화
            </Link>
          ) : (
            <span />
          )}

          <Link
            href={`/novel/${novelId}`}
            className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: "#6B6560" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B6560")}
          >
            <List className="h-3.5 w-3.5" />
            목록
          </Link>

          {hasNext ? (
            <Link
              href={`/novel/${novelId}/chapter/${chapterNumber + 1}`}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: "#6B6560" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B6560")}
            >
              다음 화
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </div>
  );
}

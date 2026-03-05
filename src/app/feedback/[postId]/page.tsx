"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import {
  feedbackApi,
  type FeedbackPost,
  type FeedbackComment,
} from "@/lib/api";
import {
  ArrowLeft,
  Loader2,
  Clock,
  User,
  MessageSquare,
  Trash2,
  Pencil,
} from "lucide-react";

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${day} ${h}:${min}`;
}

function formatRelative(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return formatDateTime(dateStr);
}

export default function FeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;
  const { user } = useAuth();

  const [post, setPost] = useState<FeedbackPost | null>(null);
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPost = useCallback(async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        feedbackApi.get(postId),
        feedbackApi.comments(postId),
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      console.error("Failed to load post:", err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const isAuthor = user && post && user.id === post.author_id;

  const handleDelete = async () => {
    if (!confirm("이 게시글을 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      await feedbackApi.delete(postId);
      router.push("/feedback");
    } catch (err) {
      console.error("Failed to delete:", err);
      setDeleting(false);
    }
  };

  const startEdit = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    try {
      const res = await feedbackApi.update(postId, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      setPost({ ...post!, ...res.data });
      setEditing(false);
    } catch (err) {
      console.error("Failed to update:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await feedbackApi.addComment(postId, { content: commentText.trim() });
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("이 댓글을 삭제하시겠습니까?")) return;
    try {
      await feedbackApi.deleteComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FDFBF7" }}>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#D44B20" }} />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FDFBF7" }}>
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <p className="text-sm" style={{ color: "#8A8478" }}>게시글을 찾을 수 없습니다</p>
          <Link
            href="/feedback"
            className="text-sm font-medium"
            style={{ color: "#D44B20" }}
          >
            게시판으로 돌아가기
          </Link>
        </div>
        <Footer />
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

        <article className="max-w-[720px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Post header */}
          {editing ? (
            <div className="space-y-4">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={200}
                className="w-full h-10 px-3 text-sm rounded-md outline-none"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(212,75,32,0.4)",
                  color: "#1A1814",
                  fontFamily: "'Noto Serif KR', serif",
                }}
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={10000}
                rows={12}
                className="w-full px-3 py-3 text-sm rounded-md outline-none resize-y"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(212,75,32,0.4)",
                  color: "#1A1814",
                  lineHeight: 1.8,
                  fontFamily: "'Noto Serif KR', serif",
                  minHeight: "200px",
                }}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="h-8 px-3 text-xs rounded-md transition-colors"
                  style={{ color: "#6B6560", border: "1px solid #E8E2D9" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#D4C9B8")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
                >
                  취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="h-8 px-4 text-xs font-medium rounded-md transition-colors"
                  style={{
                    backgroundColor: "#D44B20",
                    color: "#FFFFFF",
                    opacity: saving ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8401A")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D44B20")}
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1
                className="text-lg sm:text-xl font-bold leading-snug"
                style={{
                  fontFamily: "'Noto Serif KR', serif",
                  color: "#1A1814",
                }}
              >
                {post.title}
              </h1>

              {/* Meta */}
              <div
                className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 pb-5 border-b"
                style={{ borderColor: "#E8E2D9" }}
              >
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "#6B6560" }}>
                  <User className="h-3 w-3" />
                  {post.author_name || post.author_username}
                </span>
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "#8A8478" }}>
                  <Clock className="h-3 w-3" />
                  {formatDateTime(post.created_at)}
                </span>
                {post.updated_at !== post.created_at && (
                  <span className="text-xs" style={{ color: "#8A8478" }}>
                    (수정됨)
                  </span>
                )}

                {/* Author actions */}
                {isAuthor && (
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={startEdit}
                      className="flex items-center gap-1 h-7 px-2 text-xs rounded transition-colors"
                      style={{ color: "#6B6560" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#6B6560")}
                    >
                      <Pencil className="h-3 w-3" />
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex items-center gap-1 h-7 px-2 text-xs rounded transition-colors"
                      style={{ color: "#6B6560" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#C0544A")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#6B6560")}
                    >
                      <Trash2 className="h-3 w-3" />
                      {deleting ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div
                className="py-6 text-sm leading-[1.9] whitespace-pre-wrap"
                style={{
                  color: "#1A1814",
                  fontFamily: "'Noto Serif KR', serif",
                }}
              >
                {post.content}
              </div>
            </>
          )}

          {/* Comments section */}
          <div
            className="mt-2 pt-6 border-t"
            style={{ borderColor: "#E8E2D9" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="h-4 w-4" style={{ color: "#D44B20" }} />
              <h2
                className="text-sm font-bold"
                style={{
                  fontFamily: "'Cormorant', Georgia, serif",
                  color: "#1A1814",
                  fontSize: "1.05rem",
                }}
              >
                Comments
              </h2>
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: "rgba(212,75,32,0.08)",
                  color: "#D44B20",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {comments.length}
              </span>
            </div>

            {/* Comment list */}
            {comments.length === 0 ? (
              <div
                className="py-8 text-center rounded-md"
                style={{ backgroundColor: "#F5F1EB" }}
              >
                <p className="text-sm" style={{ color: "#8A8478" }}>
                  아직 댓글이 없습니다
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {comments.map((comment, i) => (
                  <div
                    key={comment.id}
                    className="py-4 border-b"
                    style={{
                      borderColor: "#F0EBE3",
                      animation: `fadeUp 0.3s ease-out ${i * 0.04}s both`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: "#F5F1EB",
                            color: "#6B6560",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          {(comment.author_name || comment.author_username || "?").charAt(0).toUpperCase()}
                        </span>
                        <span className="text-xs font-medium" style={{ color: "#1A1814" }}>
                          {comment.author_name || comment.author_username}
                        </span>
                        <span className="text-xs" style={{ color: "#8A8478" }}>
                          {formatRelative(comment.created_at)}
                        </span>
                      </div>

                      {user && user.id === comment.author_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="flex items-center justify-center h-6 w-6 rounded transition-colors"
                          style={{ color: "#8A8478" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#C0544A")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
                          title="댓글 삭제"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <p
                      className="mt-2 text-sm leading-relaxed whitespace-pre-wrap pl-9"
                      style={{
                        color: "#1A1814",
                        fontFamily: "'Noto Serif KR', serif",
                      }}
                    >
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Comment form */}
            {user ? (
              <form onSubmit={handleAddComment} className="mt-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="댓글을 입력하세요..."
                  className="w-full px-3 py-3 text-sm rounded-md outline-none transition-all resize-none"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E8E2D9",
                    color: "#1A1814",
                    lineHeight: 1.7,
                    fontFamily: "'Noto Serif KR', serif",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.4)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs" style={{ color: "#8A8478" }}>
                    {commentText.length}/2000
                  </span>
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submittingComment}
                    className="h-8 px-4 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all"
                    style={{
                      backgroundColor: commentText.trim() && !submittingComment ? "#1A1814" : "#E8E2D9",
                      color: commentText.trim() && !submittingComment ? "#FDFBF7" : "#8A8478",
                      cursor: commentText.trim() && !submittingComment ? "pointer" : "default",
                    }}
                    onMouseEnter={(e) => { if (commentText.trim() && !submittingComment) e.currentTarget.style.backgroundColor = "#2A2824"; }}
                    onMouseLeave={(e) => { if (commentText.trim() && !submittingComment) e.currentTarget.style.backgroundColor = "#1A1814"; }}
                  >
                    {submittingComment && <Loader2 className="h-3 w-3 animate-spin" />}
                    {submittingComment ? "등록 중..." : "댓글 등록"}
                  </button>
                </div>
              </form>
            ) : (
              <div
                className="mt-6 rounded-md p-4 text-center border"
                style={{ backgroundColor: "#F5F1EB", borderColor: "#E8E2D9" }}
              >
                <p className="text-sm" style={{ color: "#6B6560" }}>
                  댓글을 작성하려면{" "}
                  <Link
                    href={`/login?redirect=/feedback/${postId}`}
                    className="font-medium transition-colors"
                    style={{ color: "#D44B20" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#B8401A")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#D44B20")}
                  >
                    로그인
                  </Link>
                  이 필요합니다
                </p>
              </div>
            )}
          </div>
        </article>
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

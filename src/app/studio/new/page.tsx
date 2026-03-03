"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { novelsApi } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";

const GENRES = [
  "판타지", "로맨스", "현대", "무협", "SF", "공포",
  "미스터리", "스릴러", "역사", "코미디", "드라마", "기타",
];

export default function NewNovelPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/studio/new");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("소설 제목을 입력해주세요.");
      return;
    }
    if (!genre) {
      setError("장르를 선택해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await novelsApi.create({
        title: title.trim(),
        genre,
        synopsis: synopsis.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      router.push(`/studio/${res.data.id}`);
    } catch (err) {
      console.error("Failed to create novel:", err);
      setError(err instanceof Error ? err.message : "소설 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <>
        <Header />
        <main className="max-w-[560px] mx-auto px-4 sm:px-6 py-16 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#D44B20" }} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-[560px] mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
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
          className="text-xl font-bold mb-1"
          style={{
            fontFamily: "'Cormorant', Georgia, serif",
            color: "#1A1814",
            fontSize: "1.5rem",
          }}
        >
          새 소설 만들기
        </h1>
        <p className="text-xs mb-8" style={{ color: "#8A8478" }}>
          소설의 기본 정보를 입력하세요. 나중에 수정할 수 있습니다.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title field */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#1A1814" }}
            >
              소설 제목 <span style={{ color: "#D44B20" }}>*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="소설 제목을 입력하세요"
              maxLength={100}
              className="w-full h-10 px-3 text-sm rounded-sm outline-none transition-colors"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E2D9",
                color: "#1A1814",
                fontFamily: "'Noto Serif KR', serif",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(212,75,32,0.4)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#E8E2D9")
              }
            />
          </div>

          {/* Genre */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#1A1814" }}
            >
              장르 <span style={{ color: "#D44B20" }}>*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => {
                const selected = genre === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenre(g)}
                    className="h-7 px-3 text-xs rounded-sm transition-all"
                    style={{
                      backgroundColor: selected
                        ? "rgba(212,75,32,0.1)"
                        : "#F5F1EB",
                      border: selected
                        ? "1px solid rgba(212,75,32,0.3)"
                        : "1px solid #E8E2D9",
                      color: selected ? "#D44B20" : "#6B6560",
                      fontWeight: selected ? 500 : 400,
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#1A1814" }}
            >
              시놉시스
            </label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="소설의 줄거리를 간략하게 소개하세요"
              maxLength={1000}
              rows={4}
              className="w-full px-3 py-2.5 text-sm rounded-sm outline-none transition-colors resize-none"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E2D9",
                color: "#1A1814",
                lineHeight: "1.7",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(212,75,32,0.4)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#E8E2D9")
              }
            />
            <p className="text-[10px] mt-1 text-right" style={{ color: "#C5BDB2" }}>
              {synopsis.length}/1000
            </p>
          </div>

          {/* Tags */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#1A1814" }}
            >
              태그
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="쉼표로 구분 (예: 회귀, 먼치킨, 성장)"
              className="w-full h-10 px-3 text-sm rounded-sm outline-none transition-colors"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E2D9",
                color: "#1A1814",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(212,75,32,0.4)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#E8E2D9")
              }
            />
            <p className="text-[10px] mt-1" style={{ color: "#C5BDB2" }}>
              최대 10개
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="px-3 py-2 rounded-sm text-xs"
              style={{
                backgroundColor: "rgba(192,84,74,0.06)",
                border: "1px solid rgba(192,84,74,0.15)",
                color: "#C0544A",
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-6 text-sm font-medium rounded-sm transition-colors"
              style={{
                backgroundColor: "#D44B20",
                color: "#FFFFFF",
                opacity: submitting ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!submitting)
                  e.currentTarget.style.backgroundColor = "#B8401A";
              }}
              onMouseLeave={(e) => {
                if (!submitting)
                  e.currentTarget.style.backgroundColor = "#D44B20";
              }}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  생성 중...
                </span>
              ) : (
                "소설 만들기"
              )}
            </button>
            <Link
              href="/studio"
              className="h-10 px-4 text-sm flex items-center rounded-sm transition-colors"
              style={{
                border: "1px solid #E8E2D9",
                color: "#6B6560",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#D4C9B8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#E8E2D9")
              }
            >
              취소
            </Link>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}

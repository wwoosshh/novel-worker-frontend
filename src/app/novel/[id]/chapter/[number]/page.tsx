"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import {
  novelsApi,
  chaptersApi,
  type Novel,
  type Chapter,
} from "@/lib/api";
import { ArrowLeft, ChevronLeft, ChevronRight, List, Loader2 } from "lucide-react";

export default function ChapterReaderPage() {
  const params = useParams();
  const novelId = params.id as string;
  const chapterNumber = parseInt(params.number as string, 10);

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({ horizontalRule: false }),
      HorizontalRule,
    ],
    editorProps: {
      attributes: {
        class: "novel-reader focus:outline-none",
      },
    },
  });

  useEffect(() => {
    async function load() {
      try {
        const [novelRes, chapterRes] = await Promise.all([
          novelsApi.get(novelId),
          chaptersApi.get(novelId, chapterNumber),
        ]);
        setNovel(novelRes.data);
        setChapter(chapterRes.data);
      } catch (err) {
        console.error("Failed to load chapter:", err);
        setError("챕터를 불러올 수 없습니다.");
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

  if (error || !chapter || !novel) {
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

  const hasPrev = chapterNumber > 1;
  const hasNext = novel.chapter_count > chapterNumber;

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
              {novel.title}
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
      <main className="flex-1 py-8 sm:py-12">
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
        </div>
      </main>

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

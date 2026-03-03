"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { useAuth } from "@/hooks/useAuth";
import { novelsApi, chaptersApi, type Novel, type Chapter } from "@/lib/api";
import { ChapterSidebar } from "@/components/editor/ChapterSidebar";
import { DbQuickPanel } from "@/components/editor/DbQuickPanel";
import { NovelEditor } from "@/components/editor/NovelEditor";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { PanelLeft, Database, Loader2 } from "lucide-react";

export default function EditorWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const novelId = params.novelId as string;
  const { user, loading: authLoading } = useAuth();

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Mobile sheet states
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // Shared Tiptap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ horizontalRule: false }),
      HorizontalRule,
      Placeholder.configure({
        placeholder: "이야기를 시작하세요...",
      }),
    ],
    editorProps: {
      attributes: {
        class: "novel-reader min-h-[60vh] px-1 py-2 focus:outline-none",
      },
    },
  });

  // Load novel and chapters
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/studio/${novelId}`);
      return;
    }

    async function load() {
      try {
        const [novelRes, chaptersRes] = await Promise.all([
          novelsApi.get(novelId),
          chaptersApi.list(novelId),
        ]);
        setNovel(novelRes.data);
        const sorted = chaptersRes.data.sort((a, b) => a.number - b.number);
        setChapters(sorted);
      } catch (err) {
        console.error("Failed to load workspace:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [novelId, user, authLoading, router]);

  // Select chapter
  const selectChapter = useCallback(
    async (chapter: Chapter) => {
      try {
        const res = await chaptersApi.get(novelId, chapter.number);
        setActiveChapter(res.data);
        setChapterTitle(res.data.title);
        setLastSaved(null);
        setLeftOpen(false);
      } catch (err) {
        console.error("Failed to load chapter:", err);
      }
    },
    [novelId]
  );

  // Create new chapter
  const createChapter = useCallback(async () => {
    setCreating(true);
    try {
      const res = await chaptersApi.create(novelId);
      const newChapter = res.data;
      setChapters((prev) =>
        [...prev, newChapter].sort((a, b) => a.number - b.number)
      );
      setActiveChapter(newChapter);
      setChapterTitle(newChapter.title);
      setLastSaved(null);
      setLeftOpen(false);
    } catch (err) {
      console.error("Failed to create chapter:", err);
    } finally {
      setCreating(false);
    }
  }, [novelId]);

  // Save chapter
  const saveChapter = useCallback(
    async (content: Record<string, unknown>, contentText: string) => {
      if (!activeChapter) return;
      setSaving(true);
      try {
        const res = await chaptersApi.save(novelId, activeChapter.id, {
          title: chapterTitle,
          content,
          content_text: contentText,
          is_public: activeChapter.is_public,
        });
        setActiveChapter(res.data);
        setChapters((prev) =>
          prev.map((ch) => (ch.id === res.data.id ? res.data : ch))
        );
        setLastSaved(new Date());
      } catch (err) {
        console.error("Failed to save chapter:", err);
      } finally {
        setSaving(false);
      }
    },
    [novelId, activeChapter, chapterTitle]
  );

  // Loading state
  if (loading || authLoading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FDFBF7" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#D44B20" }} />
          <p className="text-xs" style={{ color: "#8A8478" }}>
            작업 공간을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: "#FDFBF7" }}>
      {/* Mobile top bar */}
      <div
        className="lg:hidden flex items-center justify-between h-11 px-3 border-b shrink-0"
        style={{ borderColor: "#E8E2D9" }}
      >
        <button
          onClick={() => setLeftOpen(true)}
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "#6B6560" }}
        >
          <PanelLeft className="h-4 w-4" />
          챕터
        </button>
        <span
          className="text-xs font-medium truncate max-w-[200px]"
          style={{ fontFamily: "'Noto Serif KR', serif", color: "#1A1814" }}
        >
          {novel?.title}
        </span>
        <button
          onClick={() => setRightOpen(true)}
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "#6B6560" }}
        >
          <Database className="h-4 w-4" />
          DB
        </button>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — desktop */}
        <div
          className="hidden lg:flex w-56 shrink-0 border-r flex-col"
          style={{ borderColor: "#E8E2D9" }}
        >
          <ChapterSidebar
            novelTitle={novel?.title ?? ""}
            chapters={chapters}
            activeChapterId={activeChapter?.id ?? null}
            onSelect={selectChapter}
            onCreate={createChapter}
            onBack={() => router.push("/studio")}
            creating={creating}
          />
        </div>

        {/* Center editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <NovelEditor
            editor={editor}
            chapter={activeChapter}
            title={chapterTitle}
            onTitleChange={setChapterTitle}
            onSave={saveChapter}
            saving={saving}
            lastSaved={lastSaved}
          />
        </div>

        {/* Right sidebar — desktop */}
        <div
          className="hidden lg:flex w-52 shrink-0 border-l flex-col"
          style={{ borderColor: "#E8E2D9" }}
        >
          <DbQuickPanel novelId={novelId} editor={editor} />
        </div>
      </div>

      {/* Mobile sheets */}
      <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">챕터 목록</SheetTitle>
          <ChapterSidebar
            novelTitle={novel?.title ?? ""}
            chapters={chapters}
            activeChapterId={activeChapter?.id ?? null}
            onSelect={selectChapter}
            onCreate={createChapter}
            onBack={() => router.push("/studio")}
            creating={creating}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={rightOpen} onOpenChange={setRightOpen}>
        <SheetContent side="right" className="w-64 p-0">
          <SheetTitle className="sr-only">설정 DB</SheetTitle>
          <DbQuickPanel novelId={novelId} editor={editor} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

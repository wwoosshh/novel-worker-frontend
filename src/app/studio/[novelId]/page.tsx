"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import ImageExtension from "@tiptap/extension-image";
import { uploadImage } from "@/lib/uploadImage";
import { useAuth } from "@/hooks/useAuth";
import { novelsApi, chaptersApi, macrosApi, type Novel, type Chapter, type Macro } from "@/lib/api";
import { ChapterSidebar } from "@/components/editor/ChapterSidebar";
import { DbQuickPanel } from "@/components/editor/DbQuickPanel";
import { NovelEditor } from "@/components/editor/NovelEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [macros, setMacros] = useState<Macro[]>([]);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Mobile sheet states
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // Ref to avoid stale closure in editorProps handlers
  const activeChapterRef = useRef(activeChapter);
  activeChapterRef.current = activeChapter;

  // Shared Tiptap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ horizontalRule: false }),
      HorizontalRule,
      ImageExtension.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({
        placeholder: "이야기를 시작하세요...",
      }),
    ],
    editorProps: {
      attributes: {
        class: "novel-reader min-h-[60vh] px-1 py-2 focus:outline-none",
      },
      handleDrop(view, event, _slice, moved) {
        if (moved || !event.dataTransfer?.files?.length) return false;
        const file = event.dataTransfer.files[0];
        if (!file.type.startsWith("image/")) return false;
        event.preventDefault();
        const chId = activeChapterRef.current?.id ?? "misc";
        const folder = `chapters/${novelId}/${chId}`;
        uploadImage(file, folder).then((url) => {
          const { schema } = view.state;
          const node = schema.nodes.image.create({ src: url });
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (pos) {
            const tr = view.state.tr.insert(pos.pos, node);
            view.dispatch(tr);
          }
        }).catch(() => {});
        return true;
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (!file) continue;
            event.preventDefault();
            const chId = activeChapterRef.current?.id ?? "misc";
            const folder = `chapters/${novelId}/${chId}`;
            uploadImage(file, folder).then((url) => {
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: url });
              const tr = view.state.tr.replaceSelectionWith(node);
              view.dispatch(tr);
            }).catch(() => {});
            return true;
          }
        }
        return false;
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
        const [novelRes, chaptersRes, macrosRes] = await Promise.all([
          novelsApi.get(novelId),
          chaptersApi.list(novelId),
          macrosApi.list(novelId),
        ]);
        setNovel(novelRes.data);
        const sorted = chaptersRes.data.sort((a, b) => a.number - b.number);
        setChapters(sorted);
        setMacros(macrosRes.data);
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
          scheduled_at: activeChapter.scheduled_at,
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

  // Set publish state (비공개 / 공개 / 예약)
  const setPublishState = useCallback(
    async (isPublic: boolean, scheduledAt: string | null) => {
      if (!activeChapter || !editor) return;
      setSaving(true);
      try {
        const res = await chaptersApi.save(novelId, activeChapter.id, {
          title: chapterTitle,
          content: editor.getJSON(),
          content_text: editor.getText(),
          is_public: isPublic,
          scheduled_at: scheduledAt,
        });
        setActiveChapter(res.data);
        setChapters((prev) =>
          prev.map((ch) => (ch.id === res.data.id ? res.data : ch))
        );
        setLastSaved(new Date());
      } catch (err) {
        console.error("Failed to set publish state:", err);
      } finally {
        setSaving(false);
      }
    },
    [novelId, activeChapter, chapterTitle, editor]
  );

  // Delete chapter
  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await chaptersApi.delete(novelId, deleteTarget.id);
      setChapters((prev) => prev.filter((ch) => ch.id !== deleteTarget.id));
      if (activeChapter?.id === deleteTarget.id) {
        setActiveChapter(null);
        setChapterTitle("");
        editor?.commands.clearContent();
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete chapter:", err);
    } finally {
      setDeleting(false);
    }
  }, [novelId, deleteTarget, activeChapter, editor]);

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
            novelId={novelId}
            novelTitle={novel?.title ?? ""}
            chapters={chapters}
            activeChapterId={activeChapter?.id ?? null}
            onSelect={selectChapter}
            onCreate={createChapter}
            onDelete={(ch) => setDeleteTarget(ch)}
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
            isPublic={activeChapter?.is_public ?? false}
            scheduledAt={activeChapter?.scheduled_at ?? null}
            onPublishStateChange={setPublishState}
            macros={macros}
            novelId={novelId}
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
            novelId={novelId}
            novelTitle={novel?.title ?? ""}
            chapters={chapters}
            activeChapterId={activeChapter?.id ?? null}
            onSelect={selectChapter}
            onCreate={createChapter}
            onDelete={(ch) => setDeleteTarget(ch)}
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

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Noto Serif KR', serif" }}>
              챕터 삭제
            </DialogTitle>
            <DialogDescription>
              {deleteTarget?.number}화 &quot;{deleteTarget?.title || "제목 없음"}&quot;을(를) 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteTarget(null)}
              className="h-8 px-4 text-xs rounded-sm transition-colors"
              style={{ border: "1px solid #E8E2D9", color: "#6B6560" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#D4C9B8")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
            >
              취소
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="h-8 px-4 text-xs font-medium rounded-sm transition-colors"
              style={{
                backgroundColor: "#DC2626",
                color: "#FFFFFF",
                opacity: deleting ? 0.6 : 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B91C1C")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#DC2626")}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

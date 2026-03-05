"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { EditorToolbar } from "./EditorToolbar";
import { Eye, EyeOff, Clock, ChevronUp } from "lucide-react";
import type { Chapter, Macro } from "@/lib/api";
import { executeMacro } from "@/lib/macroExecutor";

interface NovelEditorProps {
  editor: Editor | null;
  chapter: Chapter | null;
  title: string;
  onTitleChange: (title: string) => void;
  onSave: (content: Record<string, unknown>, contentText: string) => void;
  saving: boolean;
  lastSaved: Date | null;
  isPublic: boolean;
  scheduledAt: string | null;
  onPublishStateChange: (isPublic: boolean, scheduledAt: string | null) => void;
  macros?: Macro[];
  novelId?: string;
}

function normalizeKeyEvent(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push("ctrl");
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");
  parts.push(e.key.toLowerCase());
  return parts.join("+");
}

export function NovelEditor({
  editor,
  chapter,
  title,
  onTitleChange,
  onSave,
  saving,
  lastSaved,
  isPublic,
  scheduledAt,
  onPublishStateChange,
  macros = [],
  novelId,
}: NovelEditorProps) {
  const saveRef = useRef(onSave);
  saveRef.current = onSave;

  const [charCount, setCharCount] = useState(0);
  const [publishMenuOpen, setPublishMenuOpen] = useState(false);
  const [scheduleInput, setScheduleInput] = useState("");
  const publishMenuRef = useRef<HTMLDivElement>(null);

  // Load chapter content when chapter changes
  useEffect(() => {
    if (!editor || !chapter) return;
    const newContent = chapter.content;
    if (newContent && Object.keys(newContent).length > 0) {
      editor.commands.setContent(newContent);
    } else {
      editor.commands.clearContent();
    }
  }, [editor, chapter?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track character count
  useEffect(() => {
    if (!editor) return;

    const updateCount = () => {
      const text = editor.getText().replace(/\s/g, "");
      setCharCount(text.length);
    };

    updateCount();
    editor.on("update", updateCount);
    return () => {
      editor.off("update", updateCount);
    };
  }, [editor]);

  // Keep macros ref up to date for keydown handler
  const macrosRef = useRef(macros);
  macrosRef.current = macros;

  // Ctrl+S shortcut + macro shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl+S → save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (editor) {
          saveRef.current(editor.getJSON(), editor.getText());
        }
        return;
      }

      // Check macro shortcuts
      if (!editor) return;
      const normalized = normalizeKeyEvent(e);
      const macro = macrosRef.current.find(
        (m) => m.shortcut && m.shortcut === normalized
      );
      if (macro) {
        e.preventDefault();
        if (macro.actions && macro.actions.length > 0) {
          executeMacro(editor, macro.actions).catch((err) =>
            console.error("매크로 실행 실패:", err)
          );
        } else {
          const lines = macro.content.split("\n");
          const chain = editor.chain().focus();
          lines.forEach((line, i) => {
            if (i > 0) chain.setHardBreak();
            if (line) chain.insertContent(line);
          });
          chain.run();
        }
      }
    },
    [editor]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // 팝오버 외부 클릭 시 닫기
  useEffect(() => {
    if (!publishMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (publishMenuRef.current && !publishMenuRef.current.contains(e.target as Node)) {
        setPublishMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [publishMenuOpen]);

  // 예약 상태 표시 헬퍼
  const publishStatus = isPublic
    ? "public"
    : scheduledAt
      ? "scheduled"
      : "private";

  const formatScheduledDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!chapter) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p
            className="text-base font-medium mb-1"
            style={{ fontFamily: "'Cormorant', Georgia, serif", color: "#C5BDB2" }}
          >
            화를 선택하세요
          </p>
          <p className="text-xs" style={{ color: "#C5BDB2" }}>
            좌측 패널에서 화를 선택하거나 새 화를 추가하세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Title input */}
      <div className="px-4 sm:px-8 pt-6 pb-2">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="화 제목을 입력하세요"
          className="w-full text-lg font-semibold outline-none bg-transparent"
          style={{
            fontFamily: "'Noto Serif KR', serif",
            color: "#1A1814",
          }}
        />
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 sm:px-8 py-2 mx-4 sm:mx-8 rounded-sm"
        style={{ backgroundColor: "#F5F1EB", border: "1px solid #E8E2D9" }}
      >
        <EditorToolbar editor={editor} novelId={novelId} chapterId={chapter?.id} />
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4">
        <div className="max-w-[720px] mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-8 py-2.5 border-t"
        style={{ borderColor: "#E8E2D9", backgroundColor: "#FDFBF7" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px]" style={{ color: "#8A8478" }}>
            {charCount.toLocaleString()}자
          </span>
          <span className="text-[10px]" style={{ color: "#E8E2D9" }}>|</span>
          <span className="text-[10px]" style={{ color: "#C5BDB2" }}>
            {lastSaved
              ? `마지막 저장: ${lastSaved.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "저장되지 않음"}
          </span>
          <span className="text-[10px]" style={{ color: "#E8E2D9" }}>|</span>
          <div className="relative" ref={publishMenuRef}>
            <button
              onClick={() => setPublishMenuOpen((v) => !v)}
              disabled={saving}
              className="flex items-center gap-1 text-[10px] font-medium transition-colors"
              style={{
                color: publishStatus === "public"
                  ? "#2D7A3A"
                  : publishStatus === "scheduled"
                    ? "#D97706"
                    : "#8A8478",
              }}
            >
              {publishStatus === "public" && <Eye className="h-3 w-3" />}
              {publishStatus === "scheduled" && <Clock className="h-3 w-3" />}
              {publishStatus === "private" && <EyeOff className="h-3 w-3" />}
              {publishStatus === "public" && "공개"}
              {publishStatus === "scheduled" && formatScheduledDate(scheduledAt!)}
              {publishStatus === "private" && "비공개"}
              <ChevronUp className="h-2.5 w-2.5" />
            </button>

            {publishMenuOpen && (
              <div
                className="absolute bottom-full left-0 mb-1 w-56 rounded-md shadow-lg py-1 z-50"
                style={{ backgroundColor: "#FDFBF7", border: "1px solid #E8E2D9" }}
              >
                {/* 비공개 */}
                <button
                  onClick={() => {
                    onPublishStateChange(false, null);
                    setPublishMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors"
                  style={{
                    color: publishStatus === "private" ? "#1A1814" : "#6B6560",
                    backgroundColor: publishStatus === "private" ? "#F5F1EB" : "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F5F1EB")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = publishStatus === "private" ? "#F5F1EB" : "transparent")}
                >
                  <EyeOff className="h-3.5 w-3.5 shrink-0" style={{ color: "#8A8478" }} />
                  비공개
                </button>

                {/* 공개 */}
                <button
                  onClick={() => {
                    onPublishStateChange(true, null);
                    setPublishMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors"
                  style={{
                    color: publishStatus === "public" ? "#1A1814" : "#6B6560",
                    backgroundColor: publishStatus === "public" ? "#F5F1EB" : "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F5F1EB")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = publishStatus === "public" ? "#F5F1EB" : "transparent")}
                >
                  <Eye className="h-3.5 w-3.5 shrink-0" style={{ color: "#2D7A3A" }} />
                  즉시 공개
                </button>

                {/* 예약 공개 */}
                <div
                  className="px-3 py-2"
                  style={{
                    backgroundColor: publishStatus === "scheduled" ? "#F5F1EB" : "transparent",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: "#D97706" }} />
                    <span className="text-xs" style={{ color: publishStatus === "scheduled" ? "#1A1814" : "#6B6560" }}>
                      예약 공개
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="datetime-local"
                      value={scheduleInput}
                      onChange={(e) => setScheduleInput(e.target.value)}
                      className="flex-1 h-7 px-2 text-[11px] rounded-sm bg-white outline-none"
                      style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
                      min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                    />
                    <button
                      onClick={() => {
                        if (!scheduleInput) return;
                        const iso = new Date(scheduleInput).toISOString();
                        onPublishStateChange(false, iso);
                        setPublishMenuOpen(false);
                        setScheduleInput("");
                      }}
                      disabled={!scheduleInput}
                      className="h-7 px-2.5 text-[11px] font-medium rounded-sm transition-colors shrink-0"
                      style={{
                        backgroundColor: scheduleInput ? "#D97706" : "#E8E2D9",
                        color: scheduleInput ? "#FFFFFF" : "#8A8478",
                      }}
                    >
                      설정
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (editor) onSave(editor.getJSON(), editor.getText());
            }}
            disabled={saving}
            className="h-7 px-3 text-xs rounded-sm transition-colors"
            style={{
              border: "1px solid #E8E2D9",
              color: "#6B6560",
              opacity: saving ? 0.5 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#D4C9B8")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
          >
            {saving ? "저장 중..." : "임시저장"}
          </button>
          <button
            onClick={() => {
              if (editor) onSave(editor.getJSON(), editor.getText());
            }}
            disabled={saving}
            className="h-7 px-3 text-xs font-medium rounded-sm transition-colors"
            style={{
              backgroundColor: "#D44B20",
              color: "#FFFFFF",
              opacity: saving ? 0.5 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8401A")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D44B20")}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { EditorToolbar } from "./EditorToolbar";
import type { Chapter } from "@/lib/api";

interface NovelEditorProps {
  editor: Editor | null;
  chapter: Chapter | null;
  title: string;
  onTitleChange: (title: string) => void;
  onSave: (content: Record<string, unknown>, contentText: string) => void;
  saving: boolean;
  lastSaved: Date | null;
}

export function NovelEditor({
  editor,
  chapter,
  title,
  onTitleChange,
  onSave,
  saving,
  lastSaved,
}: NovelEditorProps) {
  const saveRef = useRef(onSave);
  saveRef.current = onSave;

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

  // Ctrl+S shortcut
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (editor) {
          saveRef.current(editor.getJSON(), editor.getText());
        }
      }
    },
    [editor]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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
        <EditorToolbar editor={editor} />
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
        <span className="text-[10px]" style={{ color: "#C5BDB2" }}>
          {lastSaved
            ? `마지막 저장: ${lastSaved.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "저장되지 않음"}
        </span>

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

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { EditorToolbar } from "./EditorToolbar";
import { Eye, EyeOff } from "lucide-react";
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
  onTogglePublish: () => void;
  macros?: Macro[];
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
  onTogglePublish,
  macros = [],
}: NovelEditorProps) {
  const saveRef = useRef(onSave);
  saveRef.current = onSave;

  const [charCount, setCharCount] = useState(0);

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
          <button
            onClick={onTogglePublish}
            disabled={saving}
            className="flex items-center gap-1 text-[10px] font-medium transition-colors"
            style={{ color: isPublic ? "#2D7A3A" : "#8A8478" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {isPublic ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
            {isPublic ? "공개" : "비공개"}
          </button>
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

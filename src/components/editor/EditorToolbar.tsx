"use client";

import type { Editor } from "@tiptap/react";
import { Bold, Italic, Quote, Minus } from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
}

const BTN =
  "flex items-center justify-center h-7 w-7 rounded-sm transition-colors";

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const buttons = [
    {
      icon: <Bold className="h-3.5 w-3.5" />,
      label: "굵게",
      active: editor.isActive("bold"),
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: <Italic className="h-3.5 w-3.5" />,
      label: "기울임",
      active: editor.isActive("italic"),
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: <Quote className="h-3.5 w-3.5" />,
      label: "인용",
      active: editor.isActive("blockquote"),
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: <Minus className="h-3.5 w-3.5" />,
      label: "장면 전환",
      active: false,
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
  ];

  return (
    <div className="flex items-center gap-1">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          className={BTN}
          title={btn.label}
          onClick={btn.action}
          style={{
            backgroundColor: btn.active ? "rgba(212,75,32,0.1)" : "transparent",
            color: btn.active ? "#D44B20" : "#8A8478",
            border: btn.active
              ? "1px solid rgba(212,75,32,0.2)"
              : "1px solid transparent",
          }}
          onMouseEnter={(e) => {
            if (!btn.active) e.currentTarget.style.color = "#6B6560";
          }}
          onMouseLeave={(e) => {
            if (!btn.active) e.currentTarget.style.color = "#8A8478";
          }}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}

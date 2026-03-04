"use client";

import { useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Bold, Italic, Quote, Minus, ImagePlus, Loader2 } from "lucide-react";
import { uploadImage, UploadError } from "@/lib/uploadImage";

interface EditorToolbarProps {
  editor: Editor | null;
  novelId?: string;
  chapterId?: string;
}

const BTN =
  "flex items-center justify-center h-7 w-7 rounded-sm transition-colors";

export function EditorToolbar({ editor, novelId, chapterId }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!editor) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !novelId) return;
    setUploading(true);
    try {
      const folder = chapterId
        ? `chapters/${novelId}/${chapterId}`
        : `chapters/${novelId}/misc`;
      const url = await uploadImage(file, folder);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      const msg = err instanceof UploadError ? err.message : "이미지 업로드에 실패했습니다.";
      alert(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

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

      {/* Separator */}
      <div className="w-px h-4 mx-0.5" style={{ backgroundColor: "#E8E2D9" }} />

      {/* Image upload button */}
      <button
        type="button"
        className={BTN}
        title="이미지 삽입"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || !novelId}
        style={{
          color: uploading ? "#C5BDB2" : "#8A8478",
          border: "1px solid transparent",
          opacity: novelId ? 1 : 0.4,
        }}
        onMouseEnter={(e) => {
          if (!uploading) e.currentTarget.style.color = "#6B6560";
        }}
        onMouseLeave={(e) => {
          if (!uploading) e.currentTarget.style.color = "#8A8478";
        }}
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ImagePlus className="h-3.5 w-3.5" />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}

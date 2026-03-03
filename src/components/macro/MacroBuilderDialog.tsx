"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, X } from "lucide-react";
import {
  type MacroAction,
  type MacroActionType,
  createAction,
  generateSummary,
} from "@/lib/macroTypes";
import { ActionPicker } from "./ActionPicker";
import { ActionBlock } from "./ActionBlock";
import type { Macro } from "@/lib/api";

interface MacroBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget: Macro | null;
  onSave: (data: {
    label: string;
    content: string;
    shortcut?: string;
    actions: MacroAction[];
  }) => Promise<void>;
}

export function MacroBuilderDialog({
  open,
  onOpenChange,
  editTarget,
  onSave,
}: MacroBuilderDialogProps) {
  const [label, setLabel] = useState("");
  const [shortcut, setShortcut] = useState("");
  const [actions, setActions] = useState<MacroAction[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editTarget) {
        setLabel(editTarget.label);
        setShortcut(editTarget.shortcut ?? "");
        setActions(
          editTarget.actions && editTarget.actions.length > 0
            ? editTarget.actions
            : []
        );
      } else {
        setLabel("");
        setShortcut("");
        setActions([]);
      }
    }
  }, [open, editTarget]);

  const handleAddAction = (type: MacroActionType) => {
    setActions((prev) => [...prev, createAction(type)]);
  };

  const handleUpdateAction = (id: string, params: Record<string, unknown>) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, params } : a))
    );
  };

  const handleMoveUp = (id: string) => {
    setActions((prev) => {
      const idx = prev.findIndex((a) => a.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const handleMoveDown = (id: string) => {
    setActions((prev) => {
      const idx = prev.findIndex((a) => a.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const handleDeleteAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  // Nested action handlers for loop blocks
  const handleAddNestedAction = (parentId: string, type: MacroActionType) => {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id !== parentId || a.type !== "loop") return a;
        const nested = (a.params.actions as MacroAction[]) ?? [];
        return {
          ...a,
          params: { ...a.params, actions: [...nested, createAction(type)] },
        };
      })
    );
  };

  const handleUpdateNestedAction = (
    parentId: string,
    childId: string,
    params: Record<string, unknown>
  ) => {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id !== parentId || a.type !== "loop") return a;
        const nested = (a.params.actions as MacroAction[]) ?? [];
        return {
          ...a,
          params: {
            ...a.params,
            actions: nested.map((n) =>
              n.id === childId ? { ...n, params } : n
            ),
          },
        };
      })
    );
  };

  const handleMoveNestedUp = (parentId: string, childId: string) => {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id !== parentId || a.type !== "loop") return a;
        const nested = [...((a.params.actions as MacroAction[]) ?? [])];
        const idx = nested.findIndex((n) => n.id === childId);
        if (idx <= 0) return a;
        [nested[idx - 1], nested[idx]] = [nested[idx], nested[idx - 1]];
        return { ...a, params: { ...a.params, actions: nested } };
      })
    );
  };

  const handleMoveNestedDown = (parentId: string, childId: string) => {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id !== parentId || a.type !== "loop") return a;
        const nested = [...((a.params.actions as MacroAction[]) ?? [])];
        const idx = nested.findIndex((n) => n.id === childId);
        if (idx < 0 || idx >= nested.length - 1) return a;
        [nested[idx], nested[idx + 1]] = [nested[idx + 1], nested[idx]];
        return { ...a, params: { ...a.params, actions: nested } };
      })
    );
  };

  const handleDeleteNestedAction = (parentId: string, childId: string) => {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id !== parentId || a.type !== "loop") return a;
        const nested = (a.params.actions as MacroAction[]) ?? [];
        return {
          ...a,
          params: {
            ...a.params,
            actions: nested.filter((n) => n.id !== childId),
          },
        };
      })
    );
  };

  const handleSave = async () => {
    if (!label.trim() || actions.length === 0) return;
    setSaving(true);
    try {
      await onSave({
        label: label.trim(),
        content: generateSummary(actions),
        shortcut: shortcut || undefined,
        actions,
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save macro:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Noto Serif KR', serif" }}>
            {editTarget ? "매크로 수정" : "매크로 빌더"}
          </DialogTitle>
          <DialogDescription>
            동작을 조합하여 워크플로우 매크로를 만드세요.
          </DialogDescription>
        </DialogHeader>

        {/* Label + Shortcut */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "#1A1814" }}
            >
              라벨
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="매크로 이름"
              className="w-full h-9 px-3 text-sm rounded-sm outline-none"
              style={{
                border: "1px solid #E8E2D9",
                color: "#1A1814",
                backgroundColor: "#FDFBF7",
              }}
            />
          </div>
          <div className="w-44">
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "#1A1814" }}
            >
              단축키
            </label>
            <div className="flex items-center gap-1">
              <input
                value={
                  shortcut
                    ? shortcut
                        .split("+")
                        .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
                        .join("+")
                    : ""
                }
                readOnly
                placeholder="키 입력"
                className="flex-1 h-9 px-3 text-sm rounded-sm outline-none cursor-pointer font-mono"
                style={{
                  border: "1px solid #E8E2D9",
                  color: "#1A1814",
                  backgroundColor: "#FDFBF7",
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                  if (e.key === "Escape") return;
                  if (
                    ["Control", "Alt", "Shift", "Meta"].includes(e.key)
                  )
                    return;
                  const parts: string[] = [];
                  if (e.ctrlKey || e.metaKey) parts.push("ctrl");
                  if (e.altKey) parts.push("alt");
                  if (e.shiftKey) parts.push("shift");
                  parts.push(e.key.toLowerCase());
                  setShortcut(parts.join("+"));
                }}
              />
              {shortcut && (
                <button
                  type="button"
                  onClick={() => setShortcut("")}
                  className="h-9 w-9 shrink-0 flex items-center justify-center rounded-sm transition-colors"
                  style={{ border: "1px solid #E8E2D9", color: "#8A8478" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#DC2626")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#8A8478")
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Actions builder */}
        <div className="flex-1 min-h-0">
          <label
            className="block text-xs font-medium mb-2"
            style={{ color: "#1A1814" }}
          >
            워크플로우
          </label>
          <ScrollArea
            className="rounded-sm"
            style={{
              height: 400,
              border: "1px solid #E8E2D9",
              backgroundColor: "#FAF8F5",
            }}
          >
            <div className="p-4">
              {/* START marker */}
              <div
                className="flex items-center gap-2 h-7 px-3 rounded-sm mb-1"
                style={{
                  backgroundColor: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                <Play
                  className="h-3 w-3"
                  style={{ color: "#10B981" }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{ color: "#10B981" }}
                >
                  START
                </span>
              </div>

              {/* Action blocks */}
              {actions.map((action, i) => (
                <ActionBlock
                  key={action.id}
                  action={action}
                  index={i}
                  total={actions.length}
                  onUpdate={handleUpdateAction}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onDelete={handleDeleteAction}
                  onAddNestedAction={handleAddNestedAction}
                  onUpdateNestedAction={handleUpdateNestedAction}
                  onMoveNestedUp={handleMoveNestedUp}
                  onMoveNestedDown={handleMoveNestedDown}
                  onDeleteNestedAction={handleDeleteNestedAction}
                />
              ))}

              {/* Add action button */}
              <div className="flex justify-center mt-2">
                {actions.length > 0 && (
                  <div className="flex flex-col items-center">
                    <div
                      className="w-0.5"
                      style={{ height: 16, backgroundColor: "#E8E2D9" }}
                    />
                    <ActionPicker onSelect={handleAddAction} />
                  </div>
                )}
                {actions.length === 0 && (
                  <div className="mt-2">
                    <ActionPicker onSelect={handleAddAction} />
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 text-xs rounded-sm"
            style={{ border: "1px solid #E8E2D9", color: "#6B6560" }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !label.trim() || actions.length === 0}
            className="h-8 px-4 text-xs font-medium rounded-sm transition-colors"
            style={{
              backgroundColor: "#D44B20",
              color: "#FFFFFF",
              opacity:
                saving || !label.trim() || actions.length === 0 ? 0.6 : 1,
            }}
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

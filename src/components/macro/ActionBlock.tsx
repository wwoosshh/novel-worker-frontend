"use client";

import { ChevronUp, ChevronDown, X } from "lucide-react";
import {
  type MacroAction,
  type MacroActionType,
  getActionMeta,
  getCategoryColor,
  createAction,
} from "@/lib/macroTypes";
import { getActionIcon } from "./ActionPicker";
import { ActionPicker } from "./ActionPicker";

interface ActionBlockProps {
  action: MacroAction;
  index: number;
  total: number;
  isNested?: boolean;
  onUpdate: (id: string, params: Record<string, unknown>) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNestedAction?: (parentId: string, type: MacroActionType) => void;
  onUpdateNestedAction?: (parentId: string, childId: string, params: Record<string, unknown>) => void;
  onMoveNestedUp?: (parentId: string, childId: string) => void;
  onMoveNestedDown?: (parentId: string, childId: string) => void;
  onDeleteNestedAction?: (parentId: string, childId: string) => void;
}

const WRAP_PRESETS = [
  { label: '""', before: '"', after: '"' },
  { label: "''", before: "'", after: "'" },
  { label: "()", before: "(", after: ")" },
  { label: "\u300C\u300D", before: "\u300C", after: "\u300D" },
];

export function ActionBlock({
  action,
  index,
  total,
  isNested,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAddNestedAction,
  onUpdateNestedAction,
  onMoveNestedUp,
  onMoveNestedDown,
  onDeleteNestedAction,
}: ActionBlockProps) {
  const meta = getActionMeta(action.type);
  const categoryColor = getCategoryColor(action.type);
  const Icon = getActionIcon(meta.icon);

  const nestedActions = (action.params.actions as MacroAction[] | undefined) ?? [];

  return (
    <div>
      {/* Connector line */}
      {index > 0 && (
        <div className="flex justify-center">
          <div
            className="w-0.5"
            style={{ height: 16, backgroundColor: "#E8E2D9" }}
          />
        </div>
      )}

      {/* Block card */}
      <div
        className="rounded-sm overflow-hidden transition-all"
        style={{
          border: "1px solid #E8E2D9",
          backgroundColor: "#FDFBF7",
        }}
      >
        {/* Category color bar */}
        <div style={{ height: 3, backgroundColor: categoryColor }} />

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex items-center justify-center w-5 h-5 rounded-sm shrink-0"
              style={{
                backgroundColor: `${categoryColor}15`,
                color: categoryColor,
              }}
            >
              <Icon className="h-3 w-3" />
            </div>
            <span
              className="text-xs font-medium truncate"
              style={{ color: "#1A1814" }}
            >
              {meta.label}
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => onMoveUp(action.id)}
              disabled={index === 0}
              className="h-5 w-5 flex items-center justify-center rounded-sm transition-colors disabled:opacity-25"
              style={{ color: "#8A8478" }}
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => onMoveDown(action.id)}
              disabled={index === total - 1}
              className="h-5 w-5 flex items-center justify-center rounded-sm transition-colors disabled:opacity-25"
              style={{ color: "#8A8478" }}
            >
              <ChevronDown className="h-3 w-3" />
            </button>
            <button
              onClick={() => onDelete(action.id)}
              className="h-5 w-5 flex items-center justify-center rounded-sm transition-colors"
              style={{ color: "#C5BDB2" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#C5BDB2")}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Params area */}
        <div className="px-3 pb-3">
          <ParamsEditor
            action={action}
            onUpdate={onUpdate}
            nestedActions={nestedActions}
            isNested={isNested}
            onAddNestedAction={onAddNestedAction}
            onUpdateNestedAction={onUpdateNestedAction}
            onMoveNestedUp={onMoveNestedUp}
            onMoveNestedDown={onMoveNestedDown}
            onDeleteNestedAction={onDeleteNestedAction}
          />
        </div>
      </div>
    </div>
  );
}

function ParamsEditor({
  action,
  onUpdate,
  nestedActions,
  isNested,
  onAddNestedAction,
  onUpdateNestedAction,
  onMoveNestedUp,
  onMoveNestedDown,
  onDeleteNestedAction,
}: {
  action: MacroAction;
  onUpdate: (id: string, params: Record<string, unknown>) => void;
  nestedActions: MacroAction[];
  isNested?: boolean;
  onAddNestedAction?: (parentId: string, type: MacroActionType) => void;
  onUpdateNestedAction?: (parentId: string, childId: string, params: Record<string, unknown>) => void;
  onMoveNestedUp?: (parentId: string, childId: string) => void;
  onMoveNestedDown?: (parentId: string, childId: string) => void;
  onDeleteNestedAction?: (parentId: string, childId: string) => void;
}) {
  const { type, params } = action;

  switch (type) {
    case "insertText":
      return (
        <textarea
          value={String(params.text ?? "")}
          onChange={(e) => onUpdate(action.id, { ...params, text: e.target.value })}
          placeholder="삽입할 텍스트"
          rows={2}
          className="w-full px-2 py-1.5 text-xs rounded-sm outline-none resize-none"
          style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
        />
      );

    case "setHeading":
      return (
        <div className="flex gap-1">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => onUpdate(action.id, { ...params, level })}
              className="h-6 w-8 text-[10px] font-medium rounded-sm transition-all"
              style={{
                backgroundColor:
                  params.level === level ? "rgba(139,92,246,0.1)" : "#F5F1EB",
                border: `1px solid ${params.level === level ? "rgba(139,92,246,0.3)" : "#E8E2D9"}`,
                color: params.level === level ? "#8B5CF6" : "#6B6560",
              }}
            >
              H{level}
            </button>
          ))}
        </div>
      );

    case "selectChars":
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={Number(params.count ?? 1)}
            onChange={(e) =>
              onUpdate(action.id, {
                ...params,
                count: Math.max(1, parseInt(e.target.value) || 1),
              })
            }
            className="w-16 h-6 px-2 text-[10px] rounded-sm outline-none"
            style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
          />
          <span className="text-[10px]" style={{ color: "#8A8478" }}>
            자
          </span>
          <div className="flex gap-0.5">
            {(["forward", "backward"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => onUpdate(action.id, { ...params, direction: dir })}
                className="h-6 px-2 text-[10px] rounded-sm transition-all"
                style={{
                  backgroundColor:
                    params.direction === dir
                      ? "rgba(245,158,11,0.1)"
                      : "#F5F1EB",
                  border: `1px solid ${params.direction === dir ? "rgba(245,158,11,0.3)" : "#E8E2D9"}`,
                  color: params.direction === dir ? "#F59E0B" : "#6B6560",
                }}
              >
                {dir === "forward" ? "앞으로" : "뒤로"}
              </button>
            ))}
          </div>
        </div>
      );

    case "wrapSelection":
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] mb-0.5 block" style={{ color: "#8A8478" }}>
                앞
              </label>
              <input
                value={String(params.before ?? "")}
                onChange={(e) =>
                  onUpdate(action.id, { ...params, before: e.target.value })
                }
                className="w-full h-6 px-2 text-[10px] rounded-sm outline-none"
                style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] mb-0.5 block" style={{ color: "#8A8478" }}>
                뒤
              </label>
              <input
                value={String(params.after ?? "")}
                onChange={(e) =>
                  onUpdate(action.id, { ...params, after: e.target.value })
                }
                className="w-full h-6 px-2 text-[10px] rounded-sm outline-none"
                style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
              />
            </div>
          </div>
          <div className="flex gap-1">
            {WRAP_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() =>
                  onUpdate(action.id, {
                    ...params,
                    before: preset.before,
                    after: preset.after,
                  })
                }
                className="h-5 px-2 text-[10px] rounded-sm transition-all"
                style={{
                  backgroundColor: "#F5F1EB",
                  border: "1px solid #E8E2D9",
                  color: "#6B6560",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#E8E2D9")
                }
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      );

    case "replaceSelection":
      return (
        <input
          value={String(params.text ?? "")}
          onChange={(e) => onUpdate(action.id, { ...params, text: e.target.value })}
          placeholder="교체할 텍스트"
          className="w-full h-6 px-2 text-xs rounded-sm outline-none"
          style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
        />
      );

    case "moveCursor":
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={Number(params.offset ?? 0)}
            onChange={(e) =>
              onUpdate(action.id, {
                ...params,
                offset: parseInt(e.target.value) || 0,
              })
            }
            className="w-20 h-6 px-2 text-[10px] rounded-sm outline-none"
            style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
          />
          <span className="text-[10px]" style={{ color: "#8A8478" }}>
            양수=앞, 음수=뒤
          </span>
        </div>
      );

    case "loop":
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={Number(params.count ?? 3)}
              onChange={(e) =>
                onUpdate(action.id, {
                  ...params,
                  count: Math.max(1, Math.min(100, parseInt(e.target.value) || 1)),
                })
              }
              className="w-16 h-6 px-2 text-[10px] rounded-sm outline-none"
              style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
            />
            <span className="text-[10px]" style={{ color: "#8A8478" }}>
              회 반복
            </span>
          </div>

          {/* Nested actions */}
          <div
            className="pl-3 ml-1"
            style={{ borderLeft: "2px solid #E8E2D9" }}
          >
            {nestedActions.map((nested, i) => (
              <ActionBlock
                key={nested.id}
                action={nested}
                index={i}
                total={nestedActions.length}
                isNested
                onUpdate={(childId, childParams) =>
                  onUpdateNestedAction?.(action.id, childId, childParams)
                }
                onMoveUp={(childId) => onMoveNestedUp?.(action.id, childId)}
                onMoveDown={(childId) => onMoveNestedDown?.(action.id, childId)}
                onDelete={(childId) => onDeleteNestedAction?.(action.id, childId)}
              />
            ))}
            {!isNested && (
              <div className={nestedActions.length > 0 ? "mt-2" : ""}>
                <ActionPicker
                  disableLoop
                  onSelect={(type) => onAddNestedAction?.(action.id, type)}
                />
              </div>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}

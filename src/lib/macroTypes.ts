// ─── Macro Action Type System ────────────────────────────────────────────────

export const MACRO_ACTION_TYPES = [
  "insertText",
  "deleteSelection",
  "toggleBold",
  "toggleItalic",
  "toggleBlockquote",
  "setHeading",
  "insertParagraph",
  "insertHardBreak",
  "insertHorizontalRule",
  "selectAll",
  "selectCurrentParagraph",
  "selectChars",
  "wrapSelection",
  "replaceSelection",
  "moveCursor",
  "setCursorToStart",
  "setCursorToEnd",
  "loop",
] as const;

export type MacroActionType = (typeof MACRO_ACTION_TYPES)[number];

export interface MacroAction {
  id: string;
  type: MacroActionType;
  params: Record<string, unknown>;
}

// ─── Category & Metadata ────────────────────────────────────────────────────

export type ActionCategory =
  | "text"
  | "format"
  | "structure"
  | "selection"
  | "selectionEdit"
  | "cursor"
  | "control";

export interface ActionMeta {
  type: MacroActionType;
  label: string;
  category: ActionCategory;
  icon: string; // lucide icon name
  defaultParams: Record<string, unknown>;
}

const CATEGORY_META: Record<ActionCategory, { label: string; color: string }> = {
  text:          { label: "텍스트",   color: "#3B82F6" },
  format:        { label: "서식",     color: "#8B5CF6" },
  structure:     { label: "구조",     color: "#10B981" },
  selection:     { label: "선택",     color: "#F59E0B" },
  selectionEdit: { label: "선택 편집", color: "#EF4444" },
  cursor:        { label: "커서",     color: "#6366F1" },
  control:       { label: "제어",     color: "#EC4899" },
};

export const ACTION_REGISTRY: ActionMeta[] = [
  // Text
  { type: "insertText",       label: "텍스트 삽입",     category: "text",          icon: "Type",             defaultParams: { text: "" } },
  { type: "deleteSelection",  label: "선택 삭제",       category: "text",          icon: "Eraser",           defaultParams: {} },
  // Format
  { type: "toggleBold",       label: "굵게 토글",       category: "format",        icon: "Bold",             defaultParams: {} },
  { type: "toggleItalic",     label: "기울임 토글",     category: "format",        icon: "Italic",           defaultParams: {} },
  { type: "toggleBlockquote", label: "인용 토글",       category: "format",        icon: "Quote",            defaultParams: {} },
  { type: "setHeading",       label: "제목 설정",       category: "format",        icon: "Heading",          defaultParams: { level: 2 } },
  // Structure
  { type: "insertParagraph",      label: "새 문단",       category: "structure",   icon: "CornerDownLeft",   defaultParams: {} },
  { type: "insertHardBreak",      label: "줄 내 줄바꿈",  category: "structure",   icon: "WrapText",         defaultParams: {} },
  { type: "insertHorizontalRule", label: "장면 전환선",   category: "structure",   icon: "Minus",            defaultParams: {} },
  // Selection
  { type: "selectAll",              label: "전체 선택",     category: "selection",   icon: "BoxSelect",        defaultParams: {} },
  { type: "selectCurrentParagraph", label: "현재 단락 선택", category: "selection",  icon: "AlignJustify",     defaultParams: {} },
  { type: "selectChars",            label: "범위 선택",     category: "selection",   icon: "TextCursorInput",  defaultParams: { count: 1, direction: "forward" } },
  // Selection Edit
  { type: "wrapSelection",    label: "감싸기",         category: "selectionEdit", icon: "WrapText",         defaultParams: { before: "", after: "" } },
  { type: "replaceSelection", label: "선택 교체",      category: "selectionEdit", icon: "Replace",          defaultParams: { text: "" } },
  // Cursor
  { type: "moveCursor",       label: "커서 이동",      category: "cursor",        icon: "MoveHorizontal",   defaultParams: { offset: 1 } },
  { type: "setCursorToStart", label: "문서 처음으로",   category: "cursor",        icon: "ArrowUpToLine",    defaultParams: {} },
  { type: "setCursorToEnd",   label: "문서 끝으로",    category: "cursor",        icon: "ArrowDownToLine",  defaultParams: {} },
  // Control
  { type: "loop",             label: "반복",           category: "control",       icon: "Repeat",           defaultParams: { count: 3, actions: [] } },
];

export function getActionMeta(type: MacroActionType): ActionMeta {
  return ACTION_REGISTRY.find((a) => a.type === type)!;
}

export function getCategoryMeta(category: ActionCategory) {
  return CATEGORY_META[category];
}

export function getCategoryColor(type: MacroActionType): string {
  const meta = getActionMeta(type);
  return CATEGORY_META[meta.category].color;
}

export function generateActionId(): string {
  return crypto.randomUUID();
}

export function createAction(type: MacroActionType): MacroAction {
  const meta = getActionMeta(type);
  return {
    id: generateActionId(),
    type,
    params: JSON.parse(JSON.stringify(meta.defaultParams)),
  };
}

export function generateSummary(actions: MacroAction[]): string {
  if (actions.length === 0) return "";
  const labels = actions.slice(0, 3).map((a) => getActionMeta(a.type).label);
  const suffix = actions.length > 3 ? ` 외 ${actions.length - 3}개` : "";
  return `${actions.length}개 동작: ${labels.join(", ")}${suffix}`;
}

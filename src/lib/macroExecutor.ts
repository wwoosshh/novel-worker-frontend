import type { Editor } from "@tiptap/core";
import type { MacroAction } from "./macroTypes";

const MAX_LOOP_ITERATIONS = 100;
const MAX_NESTING_DEPTH = 2;
const EXECUTION_TIMEOUT_MS = 10_000;

class MacroTimeoutError extends Error {
  constructor() {
    super("매크로 실행 시간이 초과되었습니다.");
  }
}

export async function executeMacro(
  editor: Editor,
  actions: MacroAction[]
): Promise<void> {
  const startTime = Date.now();
  await executeActions(editor, actions, 0, startTime);
}

async function executeActions(
  editor: Editor,
  actions: MacroAction[],
  depth: number,
  startTime: number
): Promise<void> {
  for (const action of actions) {
    if (Date.now() - startTime > EXECUTION_TIMEOUT_MS) {
      throw new MacroTimeoutError();
    }
    await executeAction(editor, action, depth, startTime);
  }
}

async function executeAction(
  editor: Editor,
  action: MacroAction,
  depth: number,
  startTime: number
): Promise<void> {
  const { type, params } = action;

  switch (type) {
    case "insertText":
      editor.chain().focus().insertContent(String(params.text ?? "")).run();
      break;

    case "deleteSelection":
      editor.chain().focus().deleteSelection().run();
      break;

    case "toggleBold":
      editor.chain().focus().toggleBold().run();
      break;

    case "toggleItalic":
      editor.chain().focus().toggleItalic().run();
      break;

    case "toggleBlockquote":
      editor.chain().focus().toggleBlockquote().run();
      break;

    case "setHeading": {
      const level = (params.level as 1 | 2 | 3) ?? 2;
      editor.chain().focus().toggleHeading({ level }).run();
      break;
    }

    case "insertParagraph":
      editor.chain().focus().splitBlock().run();
      break;

    case "insertHardBreak":
      editor.chain().focus().setHardBreak().run();
      break;

    case "insertHorizontalRule":
      editor.chain().focus().setHorizontalRule().run();
      break;

    case "selectAll":
      editor.chain().focus().selectAll().run();
      break;

    case "selectCurrentParagraph": {
      const { state } = editor;
      const { $from } = state.selection;
      const start = $from.start();
      const end = $from.end();
      editor.chain().focus().setTextSelection({ from: start, to: end }).run();
      break;
    }

    case "selectChars": {
      const count = Number(params.count ?? 1);
      const direction = params.direction === "backward" ? -1 : 1;
      const { state } = editor;
      const pos = state.selection.from;
      const target = pos + count * direction;
      const from = Math.min(pos, target);
      const to = Math.max(pos, target);
      const clampedFrom = Math.max(0, from);
      const clampedTo = Math.min(state.doc.content.size, to);
      editor.chain().focus().setTextSelection({ from: clampedFrom, to: clampedTo }).run();
      break;
    }

    case "wrapSelection": {
      const before = String(params.before ?? "");
      const after = String(params.after ?? "");
      const { state } = editor;
      const { from, to } = state.selection;
      const selectedText = state.doc.textBetween(from, to, "");
      editor
        .chain()
        .focus()
        .insertContentAt({ from, to }, before + selectedText + after)
        .run();
      break;
    }

    case "replaceSelection": {
      const text = String(params.text ?? "");
      editor.chain().focus().deleteSelection().insertContent(text).run();
      break;
    }

    case "moveCursor": {
      const offset = Number(params.offset ?? 0);
      const { state } = editor;
      const pos = state.selection.from + offset;
      const clamped = Math.max(0, Math.min(state.doc.content.size, pos));
      editor.chain().focus().setTextSelection(clamped).run();
      break;
    }

    case "setCursorToStart":
      editor.chain().focus().setTextSelection(0).run();
      break;

    case "setCursorToEnd":
      editor.chain().focus().setTextSelection(editor.state.doc.content.size).run();
      break;

    case "loop": {
      if (depth >= MAX_NESTING_DEPTH) {
        console.warn("매크로 반복 중첩 깊이 초과");
        break;
      }
      const count = Math.min(Number(params.count ?? 1), MAX_LOOP_ITERATIONS);
      const nestedActions = (params.actions as MacroAction[]) ?? [];
      for (let i = 0; i < count; i++) {
        if (Date.now() - startTime > EXECUTION_TIMEOUT_MS) {
          throw new MacroTimeoutError();
        }
        await executeActions(editor, nestedActions, depth + 1, startTime);
      }
      break;
    }
  }
}

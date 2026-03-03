"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Type,
  Eraser,
  Bold,
  Italic,
  Quote,
  Heading,
  CornerDownLeft,
  WrapText,
  Minus,
  BoxSelect,
  AlignJustify,
  TextCursorInput,
  Replace,
  MoveHorizontal,
  ArrowUpToLine,
  ArrowDownToLine,
  Repeat,
  Plus,
} from "lucide-react";
import {
  ACTION_REGISTRY,
  getCategoryMeta,
  createAction,
  type MacroActionType,
  type ActionCategory,
} from "@/lib/macroTypes";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  Eraser,
  Bold,
  Italic,
  Quote,
  Heading,
  CornerDownLeft,
  WrapText,
  Minus,
  BoxSelect,
  AlignJustify,
  TextCursorInput,
  Replace,
  MoveHorizontal,
  ArrowUpToLine,
  ArrowDownToLine,
  Repeat,
};

const CATEGORY_ORDER: ActionCategory[] = [
  "text",
  "format",
  "structure",
  "selection",
  "selectionEdit",
  "cursor",
  "control",
];

interface ActionPickerProps {
  onSelect: (type: MacroActionType) => void;
  disableLoop?: boolean;
}

export function ActionPicker({ onSelect, disableLoop }: ActionPickerProps) {
  const [open, setOpen] = useState(false);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    meta: getCategoryMeta(cat),
    actions: ACTION_REGISTRY.filter((a) => {
      if (disableLoop && a.type === "loop") return false;
      return a.category === cat;
    }),
  })).filter((g) => g.actions.length > 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 h-7 px-3 text-[11px] font-medium rounded-sm transition-all"
          style={{
            backgroundColor: "rgba(212,75,32,0.06)",
            border: "1px dashed rgba(212,75,32,0.25)",
            color: "#D44B20",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.12)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.06)")
          }
        >
          <Plus className="h-3 w-3" />
          동작 추가
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="동작 검색..." />
          <CommandList>
            <CommandEmpty>
              <span className="text-xs" style={{ color: "#8A8478" }}>
                결과 없음
              </span>
            </CommandEmpty>
            {grouped.map((group) => (
              <CommandGroup
                key={group.category}
                heading={group.meta.label}
              >
                {group.actions.map((action) => {
                  const Icon = ICON_MAP[action.icon];
                  return (
                    <CommandItem
                      key={action.type}
                      value={`${action.label} ${action.type}`}
                      onSelect={() => {
                        onSelect(action.type);
                        setOpen(false);
                      }}
                      className="gap-2 cursor-pointer"
                    >
                      <div
                        className="flex items-center justify-center w-5 h-5 rounded-sm"
                        style={{
                          backgroundColor: `${getCategoryMeta(action.category).color}15`,
                          color: getCategoryMeta(action.category).color,
                        }}
                      >
                        {Icon && <Icon className="h-3 w-3" />}
                      </div>
                      <span className="text-xs">{action.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function getActionIcon(iconName: string) {
  return ICON_MAP[iconName] ?? Type;
}

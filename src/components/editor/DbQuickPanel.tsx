"use client";

import { useState, useEffect, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import {
  Search, Users, MapPin, Shield, Package,
  Plus, Pencil, Trash2, X, Check, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { settingsApi, type DbEntry } from "@/lib/api";

type DbType = "characters" | "locations" | "factions" | "items";

const TABS: { type: DbType; label: string; icon: React.ReactNode }[] = [
  { type: "characters", label: "인물", icon: <Users className="h-3.5 w-3.5" /> },
  { type: "locations",  label: "지역", icon: <MapPin className="h-3.5 w-3.5" /> },
  { type: "factions",   label: "세력", icon: <Shield className="h-3.5 w-3.5" /> },
  { type: "items",      label: "아이템", icon: <Package className="h-3.5 w-3.5" /> },
];

interface DbQuickPanelProps {
  novelId: string;
  editor: Editor | null;
}

/* ─── Inline Form (create / edit) ─────────────────── */
function InlineForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: DbEntry;
  onSave: (name: string, fields: Record<string, string>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [fieldRows, setFieldRows] = useState<{ key: string; value: string }[]>(
    initial?.fields
      ? Object.entries(initial.fields).map(([key, value]) => ({ key, value }))
      : [],
  );
  const [showFields, setShowFields] = useState(fieldRows.length > 0);

  const handleSubmit = () => {
    if (!name.trim()) return;
    const fields: Record<string, string> = {};
    fieldRows.forEach((f) => {
      if (f.key.trim()) fields[f.key.trim()] = f.value;
    });
    onSave(name.trim(), fields);
  };

  return (
    <div
      className="mx-2 mb-1 p-2.5 rounded-sm space-y-2"
      style={{ border: "1px solid rgba(212,75,32,0.25)", backgroundColor: "#FEFCF9" }}
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !showFields) handleSubmit(); if (e.key === "Escape") onCancel(); }}
        placeholder="이름"
        className="w-full h-7 px-2 text-xs rounded-sm outline-none"
        style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
      />

      <button
        onClick={() => {
          setShowFields(!showFields);
          if (!showFields && fieldRows.length === 0) setFieldRows([{ key: "", value: "" }]);
        }}
        className="flex items-center gap-1 text-[10px] transition-colors"
        style={{ color: "#8A8478" }}
      >
        {showFields ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        필드 {showFields ? "접기" : "펼치기"}
      </button>

      {showFields && (
        <div className="space-y-1">
          {fieldRows.map((f, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                value={f.key}
                onChange={(e) => { const n = [...fieldRows]; n[i] = { ...n[i], key: e.target.value }; setFieldRows(n); }}
                placeholder="키"
                className="w-16 h-6 px-1.5 text-[10px] rounded-sm outline-none"
                style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
              />
              <input
                value={f.value}
                onChange={(e) => { const n = [...fieldRows]; n[i] = { ...n[i], value: e.target.value }; setFieldRows(n); }}
                placeholder="값"
                className="flex-1 min-w-0 h-6 px-1.5 text-[10px] rounded-sm outline-none"
                style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
              />
              <button
                onClick={() => setFieldRows(fieldRows.filter((_, j) => j !== i))}
                className="h-6 w-6 shrink-0 flex items-center justify-center rounded-sm transition-colors"
                style={{ color: "#C5BDB2" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#C5BDB2")}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setFieldRows([...fieldRows, { key: "", value: "" }])}
            className="flex items-center gap-0.5 text-[10px] transition-colors"
            style={{ color: "#8A8478" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
          >
            <Plus className="h-2.5 w-2.5" />
            필드 추가
          </button>
        </div>
      )}

      <div className="flex items-center justify-end gap-1 pt-0.5">
        <button
          onClick={onCancel}
          className="h-6 px-2 text-[10px] rounded-sm transition-colors"
          style={{ color: "#8A8478" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1A1814")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || !name.trim()}
          className="h-6 px-2.5 text-[10px] font-medium rounded-sm flex items-center gap-1 transition-colors"
          style={{
            backgroundColor: "#D44B20",
            color: "#FFFFFF",
            opacity: saving || !name.trim() ? 0.5 : 1,
          }}
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          {saving ? "저장 중" : "저장"}
        </button>
      </div>
    </div>
  );
}

/* ─── Entry Row ───────────────────────────────────── */
function EntryRow({
  entry,
  onInsert,
  onEdit,
  onDelete,
}: {
  entry: DbEntry;
  onInsert: (name: string) => void;
  onEdit: (entry: DbEntry) => void;
  onDelete: (entry: DbEntry) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasFields = Object.keys(entry.fields).length > 0;

  return (
    <div
      className="group rounded-sm transition-all"
      style={{ backgroundColor: "transparent" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F5F1EB")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <div className="flex items-center w-full px-2.5 py-1.5">
        <button
          onClick={() => onInsert(entry.name)}
          className="flex-1 text-left text-xs truncate transition-colors"
          style={{ color: "#6B6560" }}
          title={`클릭하여 "${entry.name}" 삽입`}
        >
          {entry.name}
        </button>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {hasFields && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="h-5 w-5 flex items-center justify-center rounded-sm transition-colors"
              style={{ color: "#8A8478" }}
              title="필드 보기"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
          <button
            onClick={() => onEdit(entry)}
            className="h-5 w-5 flex items-center justify-center rounded-sm transition-colors"
            style={{ color: "#8A8478" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
            title="수정"
          >
            <Pencil className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={() => onDelete(entry)}
            className="h-5 w-5 flex items-center justify-center rounded-sm transition-colors"
            style={{ color: "#8A8478" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
            title="삭제"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>

      {expanded && hasFields && (
        <div className="px-3 pb-2 space-y-0.5">
          {Object.entries(entry.fields).map(([key, value]) => (
            <div key={key} className="flex gap-1.5 text-[10px]">
              <span className="shrink-0 font-medium" style={{ color: "#8A8478" }}>{key}</span>
              <span className="truncate" style={{ color: "#6B6560" }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Panel ──────────────────────────────────── */
export function DbQuickPanel({ novelId, editor }: DbQuickPanelProps) {
  const [activeType, setActiveType] = useState<DbType>("characters");
  const [entries, setEntries] = useState<Record<DbType, DbEntry[]>>({
    characters: [],
    locations: [],
    factions: [],
    items: [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Form states
  const [formMode, setFormMode] = useState<"idle" | "create" | "edit">("idle");
  const [editTarget, setEditTarget] = useState<DbEntry | null>(null);
  const [formSaving, setFormSaving] = useState(false);

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState<DbEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [chars, locs, facs, items] = await Promise.all([
        settingsApi.list(novelId, "characters"),
        settingsApi.list(novelId, "locations"),
        settingsApi.list(novelId, "factions"),
        settingsApi.list(novelId, "items"),
      ]);
      setEntries({
        characters: chars.data,
        locations: locs.data,
        factions: facs.data,
        items: items.data,
      });
    } catch (err) {
      console.error("Failed to load settings DB:", err);
    } finally {
      setLoading(false);
    }
  }, [novelId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = entries[activeType].filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const insertName = (name: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(name).run();
  };

  const openCreate = () => {
    setFormMode("create");
    setEditTarget(null);
  };

  const openEdit = (entry: DbEntry) => {
    setFormMode("edit");
    setEditTarget(entry);
  };

  const closeForm = () => {
    setFormMode("idle");
    setEditTarget(null);
  };

  const handleSave = async (name: string, fields: Record<string, string>) => {
    setFormSaving(true);
    try {
      if (formMode === "create") {
        const res = await settingsApi.create(novelId, activeType, { name, fields });
        setEntries((prev) => ({
          ...prev,
          [activeType]: [...prev[activeType], res.data],
        }));
      } else if (formMode === "edit" && editTarget) {
        const res = await settingsApi.update(novelId, activeType, editTarget.id, { name, fields });
        setEntries((prev) => ({
          ...prev,
          [activeType]: prev[activeType].map((e) => (e.id === editTarget.id ? res.data : e)),
        }));
      }
      closeForm();
    } catch (err) {
      console.error("Failed to save entry:", err);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await settingsApi.delete(novelId, activeType, deleteTarget.id);
      setEntries((prev) => ({
        ...prev,
        [activeType]: prev[activeType].filter((e) => e.id !== deleteTarget.id),
      }));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete entry:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#FDFBF7" }}>
      {/* Header */}
      <div className="px-3 pt-4 pb-2 flex items-center justify-between">
        <p
          className="text-[9px] font-semibold tracking-[0.14em] uppercase"
          style={{ color: "#8A8478" }}
        >
          설정 DB
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-0.5 h-5 px-1.5 text-[10px] font-medium rounded-sm transition-all"
          style={{
            backgroundColor: "rgba(212,75,32,0.06)",
            border: "1px solid rgba(212,75,32,0.15)",
            color: "#D44B20",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.06)")}
          title="새 항목 추가"
        >
          <Plus className="h-3 w-3" />
          추가
        </button>
      </div>

      {/* Type tabs */}
      <div className="px-2 flex gap-0.5">
        {TABS.map((tab) => {
          const isActive = tab.type === activeType;
          const count = entries[tab.type].length;
          return (
            <button
              key={tab.type}
              onClick={() => { setActiveType(tab.type); closeForm(); }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-sm text-[10px] font-medium transition-all flex-1 justify-center"
              style={{
                backgroundColor: isActive ? "rgba(212,75,32,0.08)" : "transparent",
                color: isActive ? "#D44B20" : "#8A8478",
              }}
              title={`${tab.label} (${count})`}
            >
              {tab.icon}
              <span className="hidden xl:inline">{tab.label}</span>
              {count > 0 && (
                <span
                  className="text-[8px] ml-0.5"
                  style={{ color: isActive ? "#D44B20" : "#C5BDB2" }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3"
            style={{ color: "#C5BDB2" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색..."
            className="w-full h-7 pl-7 pr-2 text-xs rounded-sm outline-none transition-colors"
            style={{
              backgroundColor: "#F5F1EB",
              border: "1px solid #E8E2D9",
              color: "#1A1814",
            }}
          />
        </div>
      </div>

      {/* Create form */}
      {formMode === "create" && (
        <InlineForm onSave={handleSave} onCancel={closeForm} saving={formSaving} />
      )}

      {/* Entries */}
      <ScrollArea className="flex-1">
        <div className="pb-4 space-y-0.5">
          {loading ? (
            <div className="px-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 rounded-sm animate-pulse mb-1"
                  style={{ backgroundColor: "#F5F1EB" }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <p className="text-[11px]" style={{ color: "#8A8478" }}>
                {search ? "검색 결과 없음" : "등록된 항목 없음"}
              </p>
              {!search && formMode === "idle" && (
                <button
                  onClick={openCreate}
                  className="flex items-center gap-1 text-[11px] transition-colors"
                  style={{ color: "#D44B20" }}
                >
                  <Plus className="h-3 w-3" />
                  첫 항목 추가하기
                </button>
              )}
            </div>
          ) : (
            filtered.map((entry) =>
              formMode === "edit" && editTarget?.id === entry.id ? (
                <InlineForm
                  key={entry.id}
                  initial={entry}
                  onSave={handleSave}
                  onCancel={closeForm}
                  saving={formSaving}
                />
              ) : (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  onInsert={insertName}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              )
            )
          )}
        </div>
      </ScrollArea>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className="mx-2 mb-2 p-2.5 rounded-sm space-y-2"
          style={{ border: "1px solid rgba(220,38,38,0.25)", backgroundColor: "#FEF9F9" }}
        >
          <p className="text-[11px]" style={{ color: "#1A1814" }}>
            <strong>&quot;{deleteTarget.name}&quot;</strong>을(를) 삭제하시겠습니까?
          </p>
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => setDeleteTarget(null)}
              className="h-6 px-2 text-[10px] rounded-sm transition-colors"
              style={{ color: "#8A8478" }}
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="h-6 px-2.5 text-[10px] font-medium rounded-sm transition-colors"
              style={{
                backgroundColor: "#DC2626",
                color: "#FFFFFF",
                opacity: deleting ? 0.6 : 1,
              }}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

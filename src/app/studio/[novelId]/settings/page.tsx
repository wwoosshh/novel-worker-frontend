"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  novelsApi,
  settingsApi,
  macrosApi,
  noticesApi,
  type Novel,
  type DbEntry,
  type Macro,
  type Notice,
} from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  Plus,
  Pencil,
  Users,
  MapPin,
  Shield,
  Package,
  X,
  Pin,
} from "lucide-react";

type DbType = "characters" | "locations" | "factions" | "items";

const GENRE_OPTIONS = ["판타지", "로맨스", "현대", "무협", "SF", "공포", "기타"];

const STATUS_OPTIONS: { value: Novel["status"]; label: string }[] = [
  { value: "ongoing", label: "연재중" },
  { value: "hiatus", label: "휴재" },
  { value: "completed", label: "완결" },
];

const DB_TABS: { type: DbType; label: string; icon: React.ReactNode }[] = [
  { type: "characters", label: "인물", icon: <Users className="h-3.5 w-3.5" /> },
  { type: "locations", label: "지역", icon: <MapPin className="h-3.5 w-3.5" /> },
  { type: "factions", label: "세력", icon: <Shield className="h-3.5 w-3.5" /> },
  { type: "items", label: "아이템", icon: <Package className="h-3.5 w-3.5" /> },
];

/* ─── Basic Info Tab ─────────────────────────────────── */
function BasicInfoTab({
  novel,
  novelId,
  onNovelUpdate,
  onNovelDelete,
}: {
  novel: Novel;
  novelId: string;
  onNovelUpdate: (updated: Novel) => void;
  onNovelDelete: () => void;
}) {
  const [title, setTitle] = useState(novel.title);
  const [synopsis, setSynopsis] = useState(novel.synopsis ?? "");
  const [genre, setGenre] = useState(novel.genre);
  const [tags, setTags] = useState(novel.tags.join(", "));
  const [status, setStatus] = useState<Novel["status"]>(novel.status);
  const [isPublic, setIsPublic] = useState(novel.is_public ?? true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await novelsApi.update(novelId, {
        title,
        synopsis,
        genre,
        tags: parsedTags,
        status,
        is_public: isPublic,
      });
      onNovelUpdate(res.data);
    } catch (err) {
      console.error("Failed to update novel:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await novelsApi.delete(novelId);
      onNovelDelete();
    } catch (err) {
      console.error("Failed to delete novel:", err);
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#1A1814" }}>
          소설 제목
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full h-9 px-3 text-sm rounded-sm outline-none transition-colors"
          style={{ border: "1px solid #E8E2D9", color: "#1A1814", backgroundColor: "#FDFBF7" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.35)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
        />
      </div>

      {/* Synopsis */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#1A1814" }}>
          시놉시스
        </label>
        <textarea
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 text-sm rounded-sm outline-none transition-colors resize-none"
          style={{ border: "1px solid #E8E2D9", color: "#1A1814", backgroundColor: "#FDFBF7" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.35)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
        />
      </div>

      {/* Genre */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#1A1814" }}>
          장르
        </label>
        <div className="flex flex-wrap gap-1.5">
          {GENRE_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className="h-7 px-3 text-xs rounded-sm transition-all"
              style={{
                backgroundColor: genre === g ? "rgba(212,75,32,0.08)" : "#F5F1EB",
                border: `1px solid ${genre === g ? "rgba(212,75,32,0.25)" : "#E8E2D9"}`,
                color: genre === g ? "#D44B20" : "#6B6560",
                fontWeight: genre === g ? 500 : 400,
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#1A1814" }}>
          태그
        </label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="쉼표로 구분 (예: 먼치킨, 회귀, 성장)"
          className="w-full h-9 px-3 text-sm rounded-sm outline-none transition-colors"
          style={{ border: "1px solid #E8E2D9", color: "#1A1814", backgroundColor: "#FDFBF7" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.35)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
        />
        <p className="text-[10px] mt-1" style={{ color: "#C5BDB2" }}>
          쉼표(,)로 구분하여 입력하세요
        </p>
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#1A1814" }}>
          연재 상태
        </label>
        <div className="flex gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className="h-7 px-4 text-xs rounded-sm transition-all"
              style={{
                backgroundColor: status === opt.value ? "rgba(212,75,32,0.08)" : "#F5F1EB",
                border: `1px solid ${status === opt.value ? "rgba(212,75,32,0.25)" : "#E8E2D9"}`,
                color: status === opt.value ? "#D44B20" : "#6B6560",
                fontWeight: status === opt.value ? 500 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Public toggle */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#1A1814" }}>
          공개 설정
        </label>
        <div className="flex gap-1.5">
          {[
            { value: true, label: "공개" },
            { value: false, label: "비공개" },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setIsPublic(opt.value)}
              className="h-7 px-4 text-xs rounded-sm transition-all"
              style={{
                backgroundColor: isPublic === opt.value ? "rgba(212,75,32,0.08)" : "#F5F1EB",
                border: `1px solid ${isPublic === opt.value ? "rgba(212,75,32,0.25)" : "#E8E2D9"}`,
                color: isPublic === opt.value ? "#D44B20" : "#6B6560",
                fontWeight: isPublic === opt.value ? 500 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-1.5 h-9 px-5 text-sm font-medium rounded-sm transition-colors"
        style={{
          backgroundColor: "#D44B20",
          color: "#FFFFFF",
          opacity: saving ? 0.6 : 1,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8401A")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D44B20")}
      >
        <Save className="h-3.5 w-3.5" />
        {saving ? "저장 중..." : "저장"}
      </button>

      {/* Danger zone */}
      <div className="pt-6 mt-6" style={{ borderTop: "1px solid #E8E2D9" }}>
        <p className="text-xs font-medium mb-2" style={{ color: "#DC2626" }}>
          위험 영역
        </p>
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex items-center gap-1.5 h-8 px-4 text-xs rounded-sm transition-colors"
          style={{ border: "1px solid #FCA5A5", color: "#DC2626", backgroundColor: "rgba(220,38,38,0.04)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.04)")}
        >
          <Trash2 className="h-3.5 w-3.5" />
          소설 삭제
        </button>
      </div>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ color: "#DC2626" }}>소설 삭제</DialogTitle>
            <DialogDescription>
              &quot;{novel.title}&quot;을(를) 삭제합니다. 모든 챕터와 설정이 영구 삭제됩니다.
              <br />
              삭제를 확인하려면 소설 제목을 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={novel.title}
            className="w-full h-9 px-3 text-sm rounded-sm outline-none"
            style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
          />
          <DialogFooter>
            <button
              onClick={() => { setDeleteOpen(false); setDeleteConfirm(""); }}
              className="h-8 px-4 text-xs rounded-sm transition-colors"
              style={{ border: "1px solid #E8E2D9", color: "#6B6560" }}
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteConfirm !== novel.title || deleting}
              className="h-8 px-4 text-xs font-medium rounded-sm transition-colors"
              style={{
                backgroundColor: deleteConfirm === novel.title ? "#DC2626" : "#E8E2D9",
                color: "#FFFFFF",
                opacity: deleting ? 0.6 : 1,
              }}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Settings DB Tab ────────────────────────────────── */
function SettingsDbTab({ novelId }: { novelId: string }) {
  const [activeType, setActiveType] = useState<DbType>("characters");
  const [entries, setEntries] = useState<Record<DbType, DbEntry[]>>({
    characters: [],
    locations: [],
    factions: [],
    items: [],
  });
  const [loading, setLoading] = useState(true);

  // Edit/Create dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DbEntry | null>(null);
  const [formName, setFormName] = useState("");
  const [formFields, setFormFields] = useState<{ key: string; value: string }[]>([]);
  const [formSaving, setFormSaving] = useState(false);

  // Delete dialog
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
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, [novelId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openCreate = () => {
    setEditTarget(null);
    setFormName("");
    setFormFields([{ key: "", value: "" }]);
    setDialogOpen(true);
  };

  const openEdit = (entry: DbEntry) => {
    setEditTarget(entry);
    setFormName(entry.name);
    const fields = Object.entries(entry.fields).map(([key, value]) => ({ key, value }));
    setFormFields(fields.length > 0 ? fields : [{ key: "", value: "" }]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setFormSaving(true);
    try {
      const fields: Record<string, string> = {};
      for (const f of formFields) {
        if (f.key.trim()) fields[f.key.trim()] = f.value;
      }
      if (editTarget) {
        const res = await settingsApi.update(novelId, activeType, editTarget.id, {
          name: formName.trim(),
          fields,
        });
        setEntries((prev) => ({
          ...prev,
          [activeType]: prev[activeType].map((e) =>
            e.id === editTarget.id ? res.data : e
          ),
        }));
      } else {
        const res = await settingsApi.create(novelId, activeType, {
          name: formName.trim(),
          fields,
        });
        setEntries((prev) => ({
          ...prev,
          [activeType]: [...prev[activeType], res.data],
        }));
      }
      setDialogOpen(false);
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
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-4">
        {DB_TABS.map((tab) => {
          const isActive = tab.type === activeType;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveType(tab.type)}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-sm transition-all"
              style={{
                backgroundColor: isActive ? "rgba(212,75,32,0.08)" : "#F5F1EB",
                border: `1px solid ${isActive ? "rgba(212,75,32,0.25)" : "#E8E2D9"}`,
                color: isActive ? "#D44B20" : "#6B6560",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Add button */}
      <button
        onClick={openCreate}
        className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-sm transition-all mb-4"
        style={{
          backgroundColor: "rgba(212,75,32,0.06)",
          border: "1px solid rgba(212,75,32,0.15)",
          color: "#D44B20",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.12)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.06)")}
      >
        <Plus className="h-3.5 w-3.5" />
        새 항목 추가
      </button>

      {/* Entries list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-sm animate-pulse"
              style={{ backgroundColor: "#F5F1EB" }}
            />
          ))}
        </div>
      ) : entries[activeType].length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 rounded-sm"
          style={{ border: "2px dashed #E8E2D9" }}
        >
          <p className="text-xs" style={{ color: "#8A8478" }}>
            등록된 항목이 없습니다
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries[activeType].map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between px-4 py-3 rounded-sm transition-all"
              style={{ border: "1px solid #E8E2D9", backgroundColor: "#FDFBF7" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#D4C9B8")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
            >
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-medium mb-1"
                  style={{ fontFamily: "'Noto Serif KR', serif", color: "#1A1814" }}
                >
                  {entry.name}
                </p>
                {Object.keys(entry.fields).length > 0 && (
                  <p className="text-[11px] truncate" style={{ color: "#8A8478" }}>
                    {Object.keys(entry.fields).join(", ")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => openEdit(entry)}
                  className="h-6 w-6 flex items-center justify-center rounded-sm transition-colors"
                  style={{ color: "#8A8478" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setDeleteTarget(entry)}
                  className="h-6 w-6 flex items-center justify-center rounded-sm transition-colors"
                  style={{ color: "#8A8478" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Noto Serif KR', serif" }}>
              {editTarget ? "항목 수정" : "새 항목 추가"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#1A1814" }}>
                이름
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="항목 이름"
                className="w-full h-9 px-3 text-sm rounded-sm outline-none"
                style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#1A1814" }}>
                필드
              </label>
              <div className="space-y-1.5">
                {formFields.map((field, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input
                      value={field.key}
                      onChange={(e) => {
                        const next = [...formFields];
                        next[i] = { ...next[i], key: e.target.value };
                        setFormFields(next);
                      }}
                      placeholder="키"
                      className="w-28 h-8 px-2 text-xs rounded-sm outline-none"
                      style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
                    />
                    <input
                      value={field.value}
                      onChange={(e) => {
                        const next = [...formFields];
                        next[i] = { ...next[i], value: e.target.value };
                        setFormFields(next);
                      }}
                      placeholder="값"
                      className="flex-1 h-8 px-2 text-xs rounded-sm outline-none"
                      style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
                    />
                    <button
                      onClick={() => {
                        setFormFields(formFields.filter((_, j) => j !== i));
                      }}
                      className="h-8 w-8 shrink-0 flex items-center justify-center rounded-sm transition-colors"
                      style={{ color: "#C5BDB2" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#C5BDB2")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setFormFields([...formFields, { key: "", value: "" }])}
                className="flex items-center gap-1 mt-2 text-[11px] transition-colors"
                style={{ color: "#8A8478" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
              >
                <Plus className="h-3 w-3" />
                필드 추가
              </button>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="h-8 px-4 text-xs rounded-sm"
              style={{ border: "1px solid #E8E2D9", color: "#6B6560" }}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={formSaving || !formName.trim()}
              className="h-8 px-4 text-xs font-medium rounded-sm transition-colors"
              style={{
                backgroundColor: "#D44B20",
                color: "#FFFFFF",
                opacity: formSaving || !formName.trim() ? 0.6 : 1,
              }}
            >
              {formSaving ? "저장 중..." : "저장"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>항목 삭제</DialogTitle>
            <DialogDescription>
              &quot;{deleteTarget?.name}&quot;을(를) 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteTarget(null)}
              className="h-8 px-4 text-xs rounded-sm"
              style={{ border: "1px solid #E8E2D9", color: "#6B6560" }}
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="h-8 px-4 text-xs font-medium rounded-sm transition-colors"
              style={{ backgroundColor: "#DC2626", color: "#FFFFFF", opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Macros Tab ─────────────────────────────────────── */
function MacrosTab({ novelId }: { novelId: string }) {
  const [macros, setMacros] = useState<Macro[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Macro | null>(null);
  const [formLabel, setFormLabel] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formShortcut, setFormShortcut] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Macro | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMacros = useCallback(async () => {
    setLoading(true);
    try {
      const res = await macrosApi.list(novelId);
      setMacros(res.data);
    } catch (err) {
      console.error("Failed to load macros:", err);
    } finally {
      setLoading(false);
    }
  }, [novelId]);

  useEffect(() => {
    fetchMacros();
  }, [fetchMacros]);

  const openCreate = () => {
    setEditTarget(null);
    setFormLabel("");
    setFormContent("");
    setFormShortcut("");
    setDialogOpen(true);
  };

  const openEdit = (macro: Macro) => {
    setEditTarget(macro);
    setFormLabel(macro.label);
    setFormContent(macro.content);
    setFormShortcut(macro.shortcut ?? "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formLabel.trim() || !formContent.trim()) return;
    setFormSaving(true);
    try {
      const payload = {
        label: formLabel.trim(),
        content: formContent,
        shortcut: formShortcut || undefined,
      };
      if (editTarget) {
        const res = await macrosApi.update(novelId, editTarget.id, payload);
        setMacros((prev) => prev.map((m) => (m.id === editTarget.id ? res.data : m)));
      } else {
        const res = await macrosApi.create(novelId, payload);
        setMacros((prev) => [...prev, res.data]);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to save macro:", err);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await macrosApi.delete(novelId, deleteTarget.id);
      setMacros((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete macro:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Add button */}
      <button
        onClick={openCreate}
        className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-sm transition-all mb-4"
        style={{
          backgroundColor: "rgba(212,75,32,0.06)",
          border: "1px solid rgba(212,75,32,0.15)",
          color: "#D44B20",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.12)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.06)")}
      >
        <Plus className="h-3.5 w-3.5" />
        새 매크로
      </button>

      {/* Macros list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-sm animate-pulse"
              style={{ backgroundColor: "#F5F1EB" }}
            />
          ))}
        </div>
      ) : macros.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 rounded-sm"
          style={{ border: "2px dashed #E8E2D9" }}
        >
          <p className="text-xs" style={{ color: "#8A8478" }}>
            등록된 매크로가 없습니다
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {macros.map((macro) => (
            <div
              key={macro.id}
              className="flex items-start justify-between px-4 py-3 rounded-sm transition-all"
              style={{ border: "1px solid #E8E2D9", backgroundColor: "#FDFBF7" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#D4C9B8")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium" style={{ color: "#1A1814" }}>
                    {macro.label}
                  </p>
                  {macro.shortcut && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-sm font-mono"
                      style={{
                        color: "#6B6560",
                        backgroundColor: "#F5F1EB",
                        border: "1px solid #E8E2D9",
                      }}
                    >
                      {macro.shortcut.split("+").map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join("+")}
                    </span>
                  )}
                </div>
                <p className="text-[11px] truncate" style={{ color: "#8A8478" }}>
                  {macro.content}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => openEdit(macro)}
                  className="h-6 w-6 flex items-center justify-center rounded-sm transition-colors"
                  style={{ color: "#8A8478" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setDeleteTarget(macro)}
                  className="h-6 w-6 flex items-center justify-center rounded-sm transition-colors"
                  style={{ color: "#8A8478" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Noto Serif KR', serif" }}>
              {editTarget ? "매크로 수정" : "새 매크로"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#1A1814" }}>
                라벨
              </label>
              <input
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="매크로 이름"
                className="w-full h-9 px-3 text-sm rounded-sm outline-none"
                style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#1A1814" }}>
                단축키
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={formShortcut ? formShortcut.split("+").map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join("+") : ""}
                  readOnly
                  placeholder="클릭 후 키 입력"
                  className="flex-1 h-9 px-3 text-sm rounded-sm outline-none cursor-pointer font-mono"
                  style={{ border: "1px solid #E8E2D9", color: "#1A1814", backgroundColor: "#FDFBF7" }}
                  onKeyDown={(e) => {
                    e.preventDefault();
                    if (e.key === "Escape") return;
                    if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) return;
                    const parts: string[] = [];
                    if (e.ctrlKey || e.metaKey) parts.push("ctrl");
                    if (e.altKey) parts.push("alt");
                    if (e.shiftKey) parts.push("shift");
                    parts.push(e.key.toLowerCase());
                    setFormShortcut(parts.join("+"));
                  }}
                />
                {formShortcut && (
                  <button
                    type="button"
                    onClick={() => setFormShortcut("")}
                    className="h-9 px-2 text-xs rounded-sm transition-colors"
                    style={{ border: "1px solid #E8E2D9", color: "#8A8478" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] mt-1" style={{ color: "#8A8478" }}>
                입력란을 클릭한 뒤 원하는 키 조합을 누르세요 (예: Ctrl+R)
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#1A1814" }}>
                내용
              </label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={5}
                placeholder="매크로 내용을 입력하세요"
                className="w-full px-3 py-2 text-sm rounded-sm outline-none resize-none"
                style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="h-8 px-4 text-xs rounded-sm"
              style={{ border: "1px solid #E8E2D9", color: "#6B6560" }}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={formSaving || !formLabel.trim() || !formContent.trim()}
              className="h-8 px-4 text-xs font-medium rounded-sm transition-colors"
              style={{
                backgroundColor: "#D44B20",
                color: "#FFFFFF",
                opacity: formSaving || !formLabel.trim() || !formContent.trim() ? 0.6 : 1,
              }}
            >
              {formSaving ? "저장 중..." : "저장"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>매크로 삭제</DialogTitle>
            <DialogDescription>
              &quot;{deleteTarget?.label}&quot; 매크로를 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteTarget(null)}
              className="h-8 px-4 text-xs rounded-sm"
              style={{ border: "1px solid #E8E2D9", color: "#6B6560" }}
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="h-8 px-4 text-xs font-medium rounded-sm transition-colors"
              style={{ backgroundColor: "#DC2626", color: "#FFFFFF", opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Notices Tab ────────────────────────────────────── */
function NoticesTab({ novelId }: { novelId: string }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Notice | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPinned, setFormPinned] = useState(false);
  const [formSaving, setFormSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await noticesApi.list(novelId);
      setNotices(res.data);
    } catch (err) {
      console.error("Failed to load notices:", err);
    } finally {
      setLoading(false);
    }
  }, [novelId]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const openCreate = () => {
    setEditTarget(null);
    setFormTitle("");
    setFormContent("");
    setFormPinned(false);
    setDialogOpen(true);
  };

  const openEdit = (notice: Notice) => {
    setEditTarget(notice);
    setFormTitle(notice.title);
    setFormContent(notice.content);
    setFormPinned(notice.is_pinned);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formContent.trim()) return;
    setFormSaving(true);
    try {
      if (editTarget) {
        const res = await noticesApi.update(novelId, editTarget.id, {
          title: formTitle.trim(),
          content: formContent,
          is_pinned: formPinned,
        });
        setNotices((prev) => prev.map((n) => (n.id === editTarget.id ? res.data : n)));
      } else {
        const res = await noticesApi.create(novelId, {
          title: formTitle.trim(),
          content: formContent,
          is_pinned: formPinned,
        });
        setNotices((prev) => [res.data, ...prev]);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to save notice:", err);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await noticesApi.delete(novelId, deleteTarget.id);
      setNotices((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete notice:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Add button */}
      <button
        onClick={openCreate}
        className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-sm transition-all mb-4"
        style={{
          backgroundColor: "rgba(212,75,32,0.06)",
          border: "1px solid rgba(212,75,32,0.15)",
          color: "#D44B20",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.12)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(212,75,32,0.06)")}
      >
        <Plus className="h-3.5 w-3.5" />
        새 공지사항
      </button>

      {/* Notices list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-sm animate-pulse"
              style={{ backgroundColor: "#F5F1EB" }}
            />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 rounded-sm"
          style={{ border: "2px dashed #E8E2D9" }}
        >
          <p className="text-xs" style={{ color: "#8A8478" }}>
            등록된 공지사항이 없습니다
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="flex items-start justify-between px-4 py-3 rounded-sm transition-all"
              style={{ border: "1px solid #E8E2D9", backgroundColor: "#FDFBF7" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#D4C9B8")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {notice.is_pinned && (
                    <Pin className="h-3 w-3 shrink-0" style={{ color: "#D44B20" }} />
                  )}
                  <p className="text-sm font-medium truncate" style={{ color: "#1A1814" }}>
                    {notice.title}
                  </p>
                </div>
                <p className="text-[11px] truncate" style={{ color: "#8A8478" }}>
                  {notice.content}
                </p>
                <p className="text-[10px] mt-1" style={{ color: "#C5BDB2" }}>
                  {new Date(notice.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => openEdit(notice)}
                  className="h-6 w-6 flex items-center justify-center rounded-sm transition-colors"
                  style={{ color: "#8A8478" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setDeleteTarget(notice)}
                  className="h-6 w-6 flex items-center justify-center rounded-sm transition-colors"
                  style={{ color: "#8A8478" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Noto Serif KR', serif" }}>
              {editTarget ? "공지사항 수정" : "새 공지사항"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#1A1814" }}>
                제목
              </label>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="공지사항 제목"
                className="w-full h-9 px-3 text-sm rounded-sm outline-none"
                style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#1A1814" }}>
                내용
              </label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={6}
                placeholder="공지 내용을 입력하세요"
                className="w-full px-3 py-2 text-sm rounded-sm outline-none resize-none"
                style={{ border: "1px solid #E8E2D9", color: "#1A1814" }}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formPinned}
                onChange={(e) => setFormPinned(e.target.checked)}
                className="rounded"
              />
              <span className="text-xs" style={{ color: "#6B6560" }}>
                상단 고정
              </span>
            </label>
          </div>
          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="h-8 px-4 text-xs rounded-sm"
              style={{ border: "1px solid #E8E2D9", color: "#6B6560" }}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={formSaving || !formTitle.trim() || !formContent.trim()}
              className="h-8 px-4 text-xs font-medium rounded-sm transition-colors"
              style={{
                backgroundColor: "#D44B20",
                color: "#FFFFFF",
                opacity: formSaving || !formTitle.trim() || !formContent.trim() ? 0.6 : 1,
              }}
            >
              {formSaving ? "저장 중..." : "저장"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>공지사항 삭제</DialogTitle>
            <DialogDescription>
              &quot;{deleteTarget?.title}&quot; 공지를 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteTarget(null)}
              className="h-8 px-4 text-xs rounded-sm"
              style={{ border: "1px solid #E8E2D9", color: "#6B6560" }}
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="h-8 px-4 text-xs font-medium rounded-sm transition-colors"
              style={{ backgroundColor: "#DC2626", color: "#FFFFFF", opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Settings Page ──────────────────────────────────── */
export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const novelId = params.novelId as string;
  const defaultTab = searchParams.get("tab") ?? "basic";
  const { user, loading: authLoading } = useAuth();

  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/studio/${novelId}/settings`);
      return;
    }

    novelsApi
      .get(novelId)
      .then((res) => setNovel(res.data))
      .catch((err) => console.error("Failed to load novel:", err))
      .finally(() => setLoading(false));
  }, [novelId, user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <>
        <Header />
        <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#D44B20" }} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!novel) {
    return (
      <>
        <Header />
        <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-8">
          <p className="text-center text-sm" style={{ color: "#8A8478" }}>
            소설을 찾을 수 없습니다.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-8">
        {/* Back + title */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/studio/${novelId}`}
            className="inline-flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: "#8A8478" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            에디터로 돌아가기
          </Link>
          <span className="text-[10px]" style={{ color: "#E8E2D9" }}>|</span>
          <h1
            className="text-sm font-semibold truncate"
            style={{ fontFamily: "'Noto Serif KR', serif", color: "#1A1814" }}
          >
            {novel.title}
          </h1>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab}>
          <TabsList variant="line" className="mb-6">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="db">설정 DB</TabsTrigger>
            <TabsTrigger value="macros">매크로</TabsTrigger>
            <TabsTrigger value="notices">공지사항</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <BasicInfoTab
              novel={novel}
              novelId={novelId}
              onNovelUpdate={(updated) => setNovel(updated)}
              onNovelDelete={() => router.push("/studio")}
            />
          </TabsContent>

          <TabsContent value="db">
            <SettingsDbTab novelId={novelId} />
          </TabsContent>

          <TabsContent value="macros">
            <MacrosTab novelId={novelId} />
          </TabsContent>

          <TabsContent value="notices">
            <NoticesTab novelId={novelId} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </>
  );
}

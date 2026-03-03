"use client";

import { useState, useEffect, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { Search, Users, MapPin, Shield, Package } from "lucide-react";
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

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#FDFBF7" }}>
      {/* Header */}
      <div className="px-3 pt-4 pb-2">
        <p
          className="text-[9px] font-semibold tracking-[0.14em] uppercase mb-2"
          style={{ color: "#8A8478" }}
        >
          설정 DB
        </p>
      </div>

      {/* Type tabs */}
      <div className="px-2 flex gap-0.5">
        {TABS.map((tab) => {
          const isActive = tab.type === activeType;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveType(tab.type)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-sm text-[10px] font-medium transition-all flex-1 justify-center"
              style={{
                backgroundColor: isActive ? "rgba(212,75,32,0.08)" : "transparent",
                color: isActive ? "#D44B20" : "#8A8478",
              }}
              title={tab.label}
            >
              {tab.icon}
              <span className="hidden xl:inline">{tab.label}</span>
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

      {/* Entries */}
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4 space-y-0.5">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 rounded-sm animate-pulse"
                  style={{ backgroundColor: "#F5F1EB" }}
                />
              ))}
            </>
          ) : filtered.length === 0 ? (
            <p className="text-center text-[11px] py-6" style={{ color: "#8A8478" }}>
              {search ? "검색 결과 없음" : "등록된 항목 없음"}
            </p>
          ) : (
            filtered.map((entry) => (
              <button
                key={entry.id}
                onClick={() => insertName(entry.name)}
                className="flex items-center w-full text-left px-2.5 py-1.5 rounded-sm text-xs transition-all"
                style={{ color: "#6B6560" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F5F1EB";
                  e.currentTarget.style.color = "#1A1814";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#6B6560";
                }}
                title={`클릭하여 "${entry.name}" 삽입`}
              >
                {entry.name}
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

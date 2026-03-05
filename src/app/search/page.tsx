"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NovelCard, type NovelCardData } from "@/components/novel/NovelCard";
import { novelsApi, type Novel, type NovelsParams } from "@/lib/api";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

const GENRES  = ["전체", "판타지", "로맨스", "현대", "무협", "SF", "공포", "기타"];
const STATUSES = [
  { label: "전체",   value: "" },
  { label: "연재중", value: "ongoing" },
  { label: "완결",   value: "completed" },
  { label: "휴재",   value: "hiatus" },
];
const SORTS = [
  { label: "인기순",    value: "popular" },
  { label: "최신순",    value: "latest" },
  { label: "업데이트",  value: "updated" },
];

function toCardData(n: Novel): NovelCardData {
  return {
    id: n.id,
    title: n.title,
    author_name: n.author_name,
    cover_url: n.cover_url,
    genre: n.genre,
    status: n.status,
    chapter_count: n.chapter_count,
    view_count: n.view_count,
    latest_chapter: n.latest_chapter ?? undefined,
  };
}

/* ─── Filter Chip ─────────────────────────────────── */
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-7 px-3 text-xs rounded-sm transition-all whitespace-nowrap"
      style={{
        backgroundColor: active ? "rgba(212,75,32,0.08)" : "#FFFFFF",
        border: active ? "1px solid rgba(212,75,32,0.25)" : "1px solid #E8E2D9",
        color: active ? "#D44B20" : "#6B6560",
        fontWeight: active ? 500 : 400,
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = "#C5BDB2"; e.currentTarget.style.color = "#1A1814"; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "#E8E2D9"; e.currentTarget.style.color = "#6B6560"; } }}
    >
      {label}
    </button>
  );
}

/* ─── Sort Button ─────────────────────────────────── */
function SortButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-7 px-2.5 text-xs rounded-sm transition-all"
      style={{
        backgroundColor: active ? "#FFFFFF" : "transparent",
        color: active ? "#1A1814" : "#8A8478",
        fontWeight: active ? 500 : 400,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "#6B6560"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "#8A8478"; }}
    >
      {label}
    </button>
  );
}

/* ─── Novel Grid (memoized card data) ────────────── */
function NovelGrid({ novels }: { novels: Novel[] }) {
  const cards = useMemo(() => novels.map(toCardData), [novels]);
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
      {cards.map((card, idx) => (
        <NovelCard key={card.id} novel={card} priority={idx < 7} />
      ))}
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-sm mb-2" style={{ backgroundColor: "#EDE8E0" }} />
      <div className="h-3 rounded-sm mb-1" style={{ backgroundColor: "#EDE8E0", width: "80%" }} />
      <div className="h-2.5 rounded-sm" style={{ backgroundColor: "#F5F1EB", width: "50%" }} />
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────── */
function SearchPageContent() {
  const searchParams = useSearchParams();

  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");
  const [query,  setQuery]  = useState(searchParams.get("q") ?? "");
  const [genre,  setGenre]  = useState(searchParams.get("genre") ?? "전체");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [sort,   setSort]   = useState<NovelsParams["sort"]>(
    (searchParams.get("sort") as NovelsParams["sort"]) ?? "popular"
  );

  const [novels,  setNovels]  = useState<Novel[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync state when URL search params change (e.g. Header genre nav clicks)
  useEffect(() => {
    const urlGenre  = searchParams.get("genre") ?? "전체";
    const urlStatus = searchParams.get("status") ?? "";
    const urlSort   = (searchParams.get("sort") as NovelsParams["sort"]) ?? "popular";
    const urlQ      = searchParams.get("q") ?? "";

    setGenre(urlGenre);
    setStatus(urlStatus);
    setSort(urlSort);
    setQuery(urlQ);
    setInputValue(urlQ);
  }, [searchParams]);

  const fetchNovels = useCallback(async () => {
    setLoading(true);
    try {
      const params: NovelsParams = {
        sort,
        limit: 60,
      };
      if (genre  !== "전체") params.genre  = genre;
      if (status)             params.status = status as NovelsParams["status"];
      if (query.trim())       params.q      = query.trim();

      const res = await novelsApi.list(params);
      setNovels(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sort, genre, status, query]);

  // Debounce text search
  useEffect(() => {
    const timer = setTimeout(() => setQuery(inputValue), 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => { fetchNovels(); }, [fetchNovels]);

  const activeFilters = [
    ...(genre !== "전체" ? [{ label: genre, clear: () => setGenre("전체") }] : []),
    ...(status ? [{ label: STATUSES.find((s) => s.value === status)?.label ?? status, clear: () => setStatus("") }] : []),
    ...(query  ? [{ label: `"${query}"`, clear: () => { setQuery(""); setInputValue(""); } }] : []),
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
  };

  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1
            className="text-xl font-bold mb-1"
            style={{ fontFamily: "'Cormorant', Georgia, serif", color: "#1A1814", fontSize: "1.5rem" }}
          >
            소설 검색
          </h1>
          {!loading && (
            <p className="text-xs" style={{ color: "#8A8478" }}>
              {total.toLocaleString()}개의 작품
            </p>
          )}
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#8A8478" }} />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="제목, 작가명으로 검색..."
              className="w-full h-10 pl-10 pr-14 rounded-sm text-sm outline-none transition-all"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E2D9",
                color: "#1A1814",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.35)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "#E8E2D9")}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2.5 text-xs rounded-sm font-medium transition-colors"
              style={{ backgroundColor: "#D44B20", color: "#FFFFFF" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8401A")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D44B20")}
            >
              검색
            </button>
          </div>
        </form>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="shrink-0 hidden md:block w-44">
            <div className="sticky top-[100px] rounded-sm overflow-hidden" style={{ border: "1px solid #E8E2D9" }}>
              {/* Genre */}
              <div className="px-3 py-2 border-b" style={{ borderColor: "#E8E2D9", backgroundColor: "#F5F1EB" }}>
                <p className="text-[9px] font-semibold tracking-[0.14em] uppercase" style={{ color: "#8A8478" }}>장르</p>
              </div>
              <div className="py-1" style={{ backgroundColor: "#FDFBF7" }}>
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenre(g)}
                    className="w-full text-left px-3 py-1.5 text-xs transition-all flex items-center justify-between"
                    style={{
                      color: genre === g ? "#D44B20" : "#6B6560",
                      backgroundColor: genre === g ? "rgba(212,75,32,0.05)" : "transparent",
                      fontWeight: genre === g ? 500 : 400,
                    }}
                    onMouseEnter={(e) => { if (genre !== g) e.currentTarget.style.color = "#1A1814"; }}
                    onMouseLeave={(e) => { if (genre !== g) e.currentTarget.style.color = "#6B6560"; }}
                  >
                    {g}
                    {genre === g && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "#D44B20" }} />}
                  </button>
                ))}
              </div>

              {/* Status */}
              <div className="px-3 py-2 border-t border-b" style={{ borderColor: "#E8E2D9", backgroundColor: "#F5F1EB" }}>
                <p className="text-[9px] font-semibold tracking-[0.14em] uppercase" style={{ color: "#8A8478" }}>연재 상태</p>
              </div>
              <div className="py-1" style={{ backgroundColor: "#FDFBF7" }}>
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStatus(s.value)}
                    className="w-full text-left px-3 py-1.5 text-xs transition-all flex items-center justify-between"
                    style={{
                      color: status === s.value ? "#D44B20" : "#6B6560",
                      backgroundColor: status === s.value ? "rgba(212,75,32,0.05)" : "transparent",
                      fontWeight: status === s.value ? 500 : 400,
                    }}
                    onMouseEnter={(e) => { if (status !== s.value) e.currentTarget.style.color = "#1A1814"; }}
                    onMouseLeave={(e) => { if (status !== s.value) e.currentTarget.style.color = "#6B6560"; }}
                  >
                    {s.label}
                    {status === s.value && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "#D44B20" }} />}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Controls row */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs" style={{ color: "#6B6560" }}>
                  <span className="font-medium" style={{ color: "#1A1814" }}>{novels.length.toLocaleString()}</span>개
                </p>
                {activeFilters.map((f) => (
                  <button
                    key={f.label}
                    onClick={f.clear}
                    className="flex items-center gap-1 h-5 px-2 text-[10px] rounded-sm transition-colors"
                    style={{
                      backgroundColor: "rgba(212,75,32,0.06)",
                      border: "1px solid rgba(212,75,32,0.15)",
                      color: "#D44B20",
                    }}
                  >
                    {f.label}
                    <X className="h-2.5 w-2.5" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  className="md:hidden flex items-center gap-1.5 h-7 px-2.5 text-xs rounded-sm mr-1"
                  style={{ border: "1px solid #E8E2D9", color: "#6B6560" }}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  필터
                </button>
                <div
                  className="flex items-center gap-0.5 rounded-sm overflow-hidden"
                  style={{ border: "1px solid #E8E2D9", backgroundColor: "#F5F1EB" }}
                >
                  {SORTS.map((s) => (
                    <SortButton
                      key={s.value}
                      label={s.label}
                      active={sort === s.value}
                      onClick={() => setSort(s.value as NovelsParams["sort"])}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile filter chips */}
            {sidebarOpen && (
              <div className="md:hidden mb-4 p-3 rounded-sm" style={{ border: "1px solid #E8E2D9", backgroundColor: "#F5F1EB" }}>
                <p className="text-[9px] font-semibold tracking-[0.14em] uppercase mb-2" style={{ color: "#8A8478" }}>장르</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {GENRES.map((g) => (
                    <FilterChip key={g} label={g} active={genre === g} onClick={() => setGenre(g)} />
                  ))}
                </div>
                <p className="text-[9px] font-semibold tracking-[0.14em] uppercase mb-2" style={{ color: "#8A8478" }}>연재 상태</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <FilterChip key={s.value} label={s.label} active={status === s.value} onClick={() => setStatus(s.value)} />
                  ))}
                </div>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {Array.from({ length: 21 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : novels.length === 0 ? (
              <div className="py-24 text-center">
                <p
                  className="text-base font-medium mb-2"
                  style={{ fontFamily: "'Cormorant', Georgia, serif", color: "#8A8478" }}
                >
                  검색 결과가 없습니다
                </p>
                <p className="text-sm" style={{ color: "#8A8478" }}>
                  다른 검색어나 필터를 사용해 보세요.
                </p>
              </div>
            ) : (
              <NovelGrid novels={novels} />

            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}

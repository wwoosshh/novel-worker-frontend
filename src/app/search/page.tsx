"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NovelCard, type NovelCardData } from "@/components/novel/NovelCard";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Mock data ─────────────────────────────────────── */
const ALL_NOVELS: NovelCardData[] = Array.from({ length: 80 }, (_, i) => ({
  id: String(i + 1),
  title: [
    "검제가 되어버린 나",
    "황후의 두 번째 삶",
    "전지적 독자 시점",
    "나 혼자만 레벨업",
    "어느 날 공주가 되어버렸다",
    "회귀한 마법사의 탑",
    "최강 재벌의 숨겨진 아들",
    "빙의한 악역의 최후",
    "무너진 세계의 끝에서",
    "사신을 제자로 들이다",
    "천마의 제자가 된 사연",
    "귀환자의 마법은 특별해",
    "세계 최강의 무신",
    "던전 속 마왕의 비밀",
    "연애 불가능 황제",
    "악녀로 살아남기",
  ][i % 16],
  author_name: ["김철수", "이영희", "박지성", "최수진", "정민우"][i % 5],
  cover_url: null,
  genre: ["판타지", "로맨스", "현대", "무협", "SF", "공포"][i % 6],
  status: (["ongoing", "ongoing", "completed", "ongoing", "hiatus", "ongoing"] as const)[i % 6],
  chapter_count: 20 + i * 8,
  view_count: 5000 + i * 18234,
  latest_chapter: 20 + i * 8,
}));

const GENRES = ["전체", "판타지", "로맨스", "현대", "무협", "SF", "공포", "기타"];
const STATUSES = [
  { label: "전체", value: "" },
  { label: "연재중", value: "ongoing" },
  { label: "완결", value: "completed" },
  { label: "휴재", value: "hiatus" },
];
const SORTS = [
  { label: "인기순", value: "popular" },
  { label: "최신순", value: "latest" },
  { label: "조회순", value: "views" },
  { label: "업데이트", value: "updated" },
];

/* ─── Filter Chip ────────────────────────────────────── */
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="h-7 px-3 text-xs rounded-sm transition-all whitespace-nowrap"
      style={{
        backgroundColor: active ? "rgba(191,151,66,0.12)" : "#141210",
        border: active ? "1px solid rgba(191,151,66,0.35)" : "1px solid #302B22",
        color: active ? "#D4AF5F" : "#9E9688",
        fontWeight: active ? 500 : 400,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = "#5A544A";
          e.currentTarget.style.color = "#EDE8DC";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = "#302B22";
          e.currentTarget.style.color = "#9E9688";
        }
      }}
    >
      {label}
    </button>
  );
}

/* ─── Sort Button ────────────────────────────────────── */
function SortButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="h-7 px-2.5 text-xs rounded-sm transition-all"
      style={{
        backgroundColor: active ? "#1C1914" : "transparent",
        color: active ? "#EDE8DC" : "#5A544A",
        fontWeight: active ? 500 : 400,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = "#9E9688";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = "#5A544A";
      }}
    >
      {label}
    </button>
  );
}

/* ─── Page ─────────────────────────────────────────── */
export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [genre, setGenre] = useState("전체");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("popular");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...ALL_NOVELS];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.author_name.toLowerCase().includes(q)
      );
    }

    if (genre !== "전체") {
      result = result.filter((n) => n.genre === genre);
    }

    if (status) {
      result = result.filter((n) => n.status === status);
    }

    if (sort === "popular" || sort === "views") {
      result.sort((a, b) => b.view_count - a.view_count);
    } else if (sort === "latest" || sort === "updated") {
      result.sort((a, b) => b.chapter_count - a.chapter_count);
    }

    return result;
  }, [query, genre, status, sort]);

  const activeFilters = [
    ...(genre !== "전체" ? [{ label: genre, clear: () => setGenre("전체") }] : []),
    ...(status
      ? [
          {
            label: STATUSES.find((s) => s.value === status)?.label ?? status,
            clear: () => setStatus(""),
          },
        ]
      : []),
    ...(query ? [{ label: `"${query}"`, clear: () => { setQuery(""); setInputValue(""); } }] : []),
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
  };

  return (
    <>
      <Header user={null} />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1
            className="text-xl font-bold mb-1"
            style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              color: "#EDE8DC",
            }}
          >
            소설 검색
          </h1>
          <p className="text-xs" style={{ color: "#5A544A" }}>
            {ALL_NOVELS.length.toLocaleString()}개의 작품이 등록되어 있습니다
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="relative max-w-xl">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: "#5A544A" }}
            />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="제목, 작가명으로 검색..."
              className="w-full h-10 pl-10 pr-14 rounded-sm text-sm outline-none transition-all"
              style={{
                backgroundColor: "#141210",
                border: "1px solid #302B22",
                color: "#EDE8DC",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(191,151,66,0.4)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#302B22")
              }
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2.5 text-xs rounded-sm font-medium transition-colors"
              style={{ backgroundColor: "#BF9742", color: "#0C0A08" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#D4AF5F")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#BF9742")
              }
            >
              검색
            </button>
          </div>
        </form>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside
            className={cn(
              "shrink-0 hidden md:block",
              "w-44"
            )}
          >
            <div
              className="sticky top-[100px] rounded-sm overflow-hidden"
              style={{ border: "1px solid #302B22" }}
            >
              {/* Genre */}
              <div
                className="px-3 py-2 border-b"
                style={{ borderColor: "#302B22", backgroundColor: "#141210" }}
              >
                <p
                  className="text-[9px] font-semibold tracking-[0.14em] uppercase"
                  style={{ color: "#5A544A" }}
                >
                  장르
                </p>
              </div>
              <div className="py-1" style={{ backgroundColor: "#0C0A08" }}>
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenre(g)}
                    className="w-full text-left px-3 py-1.5 text-xs transition-all flex items-center justify-between"
                    style={{
                      color: genre === g ? "#D4AF5F" : "#9E9688",
                      backgroundColor:
                        genre === g ? "rgba(191,151,66,0.08)" : "transparent",
                      fontWeight: genre === g ? 500 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (genre !== g)
                        e.currentTarget.style.color = "#EDE8DC";
                    }}
                    onMouseLeave={(e) => {
                      if (genre !== g)
                        e.currentTarget.style.color = "#9E9688";
                    }}
                  >
                    {g}
                    {genre === g && (
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: "#BF9742" }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Status */}
              <div
                className="px-3 py-2 border-t border-b"
                style={{
                  borderColor: "#302B22",
                  backgroundColor: "#141210",
                }}
              >
                <p
                  className="text-[9px] font-semibold tracking-[0.14em] uppercase"
                  style={{ color: "#5A544A" }}
                >
                  연재 상태
                </p>
              </div>
              <div className="py-1" style={{ backgroundColor: "#0C0A08" }}>
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStatus(s.value)}
                    className="w-full text-left px-3 py-1.5 text-xs transition-all flex items-center justify-between"
                    style={{
                      color: status === s.value ? "#D4AF5F" : "#9E9688",
                      backgroundColor:
                        status === s.value
                          ? "rgba(191,151,66,0.08)"
                          : "transparent",
                      fontWeight: status === s.value ? 500 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (status !== s.value)
                        e.currentTarget.style.color = "#EDE8DC";
                    }}
                    onMouseLeave={(e) => {
                      if (status !== s.value)
                        e.currentTarget.style.color = "#9E9688";
                    }}
                  >
                    {s.label}
                    {status === s.value && (
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: "#BF9742" }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Controls row */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              {/* Active filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs" style={{ color: "#9E9688" }}>
                  <span
                    className="font-medium"
                    style={{ color: "#EDE8DC" }}
                  >
                    {filtered.length.toLocaleString()}
                  </span>
                  개
                </p>
                {activeFilters.map((f) => (
                  <button
                    key={f.label}
                    onClick={f.clear}
                    className="flex items-center gap-1 h-5 px-2 text-[10px] rounded-sm transition-colors"
                    style={{
                      backgroundColor: "rgba(191,151,66,0.1)",
                      border: "1px solid rgba(191,151,66,0.2)",
                      color: "#BF9742",
                    }}
                  >
                    {f.label}
                    <X className="h-2.5 w-2.5" />
                  </button>
                ))}
              </div>

              {/* Sort + mobile filter */}
              <div className="flex items-center gap-1">
                <button
                  className="md:hidden flex items-center gap-1.5 h-7 px-2.5 text-xs rounded-sm mr-1"
                  style={{ border: "1px solid #302B22", color: "#9E9688" }}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  필터
                </button>
                <div
                  className="flex items-center gap-0.5 rounded-sm overflow-hidden"
                  style={{ border: "1px solid #302B22", backgroundColor: "#0C0A08" }}
                >
                  {SORTS.map((s) => (
                    <SortButton
                      key={s.value}
                      label={s.label}
                      active={sort === s.value}
                      onClick={() => setSort(s.value)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile filter chips */}
            {sidebarOpen && (
              <div
                className="md:hidden mb-4 p-3 rounded-sm"
                style={{ border: "1px solid #302B22", backgroundColor: "#141210" }}
              >
                <p
                  className="text-[9px] font-semibold tracking-[0.14em] uppercase mb-2"
                  style={{ color: "#5A544A" }}
                >
                  장르
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {GENRES.map((g) => (
                    <FilterChip
                      key={g}
                      label={g}
                      active={genre === g}
                      onClick={() => setGenre(g)}
                    />
                  ))}
                </div>
                <p
                  className="text-[9px] font-semibold tracking-[0.14em] uppercase mb-2"
                  style={{ color: "#5A544A" }}
                >
                  연재 상태
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <FilterChip
                      key={s.value}
                      label={s.label}
                      active={status === s.value}
                      onClick={() => setStatus(s.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="py-24 text-center">
                <p
                  className="text-base font-medium mb-2"
                  style={{
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    color: "#5A544A",
                  }}
                >
                  검색 결과가 없습니다
                </p>
                <p className="text-sm" style={{ color: "#5A544A" }}>
                  다른 검색어나 필터를 사용해 보세요.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {filtered.map((novel, idx) => (
                  <NovelCard key={novel.id} novel={novel} priority={idx < 7} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

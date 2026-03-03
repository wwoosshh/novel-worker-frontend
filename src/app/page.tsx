"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NovelCard, type NovelCardData } from "@/components/novel/NovelCard";
import { novelsApi, type Novel } from "@/lib/api";
import { ChevronRight, TrendingUp, Clock, BookCheck, Zap } from "lucide-react";

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

/* ─── Skeleton ─────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div
        className="aspect-[3/4] rounded-sm mb-2"
        style={{ backgroundColor: "#EDE8E0" }}
      />
      <div className="h-3 rounded-sm mb-1" style={{ backgroundColor: "#EDE8E0", width: "80%" }} />
      <div className="h-2.5 rounded-sm" style={{ backgroundColor: "#F5F1EB", width: "50%" }} />
    </div>
  );
}

/* ─── Section ─────────────────────────────────────── */
function Section({
  title,
  icon,
  moreHref,
  novels,
  loading,
}: {
  title: string;
  icon?: React.ReactNode;
  moreHref: string;
  novels: NovelCardData[];
  loading: boolean;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span style={{ color: "#D44B20" }}>{icon}</span>}
          <h2
            className="text-[15px] font-semibold"
            style={{ fontFamily: "'Cormorant', Georgia, serif", color: "#1A1814", fontSize: "1.15rem" }}
          >
            {title}
          </h2>
          <div className="h-px w-6" style={{ backgroundColor: "rgba(212,75,32,0.25)" }} />
        </div>
        <Link
          href={moreHref}
          className="flex items-center gap-0.5 text-xs transition-colors"
          style={{ color: "#8A8478" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
        >
          더보기
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 gap-3">
        {loading
          ? Array.from({ length: 11 }).map((_, idx) => (
              <div
                key={idx}
                className={
                  idx >= 9
                    ? "hidden xl:block"
                    : idx >= 7
                    ? "hidden lg:block"
                    : idx >= 5
                    ? "hidden md:block"
                    : idx >= 4
                    ? "hidden sm:block"
                    : ""
                }
              >
                <CardSkeleton />
              </div>
            ))
          : novels.slice(0, 11).map((novel, idx) => (
              <div
                key={novel.id}
                className={
                  idx >= 9
                    ? "hidden xl:block"
                    : idx >= 7
                    ? "hidden lg:block"
                    : idx >= 5
                    ? "hidden md:block"
                    : idx >= 4
                    ? "hidden sm:block"
                    : ""
                }
              >
                <NovelCard novel={novel} priority={idx < 4} />
              </div>
            ))}
      </div>
    </section>
  );
}

/* ─── Hero ─────────────────────────────────────────── */
function Hero({ novel, loading }: { novel: Novel | null; loading: boolean }) {
  if (loading || !novel) {
    return (
      <section
        className="relative w-full overflow-hidden rounded-md animate-pulse"
        style={{ minHeight: "320px", backgroundColor: "#F5F1EB", border: "1px solid #E8E2D9" }}
      />
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden rounded-md"
      style={{
        minHeight: "320px",
        background: "linear-gradient(150deg, #F5F1EB 0%, #FDFBF7 50%, #F5F1EB 100%)",
        border: "1px solid #E8E2D9",
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, #D44B20 30%, #D44B20 70%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(ellipse at 70% 50%, rgba(212,75,32,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row min-h-[320px]">
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-10">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-px w-5" style={{ backgroundColor: "#D44B20" }} />
            <span className="text-[9px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#D44B20" }}>
              이주의 추천
            </span>
          </div>

          <div className="mb-3">
            <span
              className="text-[10px] px-2 py-0.5 rounded-sm font-medium"
              style={{
                backgroundColor: "rgba(212,75,32,0.06)",
                border: "1px solid rgba(212,75,32,0.15)",
                color: "#D44B20",
              }}
            >
              {novel.genre}
            </span>
          </div>

          <h1
            className="font-bold leading-tight mb-4"
            style={{
              fontFamily: "'Cormorant', 'Noto Serif KR', Georgia, serif",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              color: "#1A1814",
              maxWidth: "520px",
            }}
          >
            {novel.title}
          </h1>

          <p className="text-sm mb-4" style={{ color: "#6B6560" }}>
            {novel.author_name}
            <span className="mx-2 inline-block w-px h-3 align-middle" style={{ backgroundColor: "#E8E2D9" }} />
            {novel.chapter_count}화
          </p>

          {novel.synopsis && (
            <p
              className="text-sm leading-relaxed mb-8 line-clamp-2 md:line-clamp-3"
              style={{ color: "#6B6560", maxWidth: "400px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {novel.synopsis}
            </p>
          )}

          <div className="flex items-center gap-2.5">
            <Link
              href={`/novel/${novel.id}`}
              className="inline-flex items-center h-9 px-5 text-sm font-medium rounded-sm transition-colors"
              style={{ backgroundColor: "#D44B20", color: "#FFFFFF" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8401A")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D44B20")}
            >
              첫화 읽기
            </Link>
            <Link
              href={`/novel/${novel.id}`}
              className="inline-flex items-center h-9 px-4 text-sm rounded-sm transition-all"
              style={{ border: "1px solid #E8E2D9", color: "#6B6560" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,75,32,0.25)";
                e.currentTarget.style.color = "#1A1814";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E8E2D9";
                e.currentTarget.style.color = "#6B6560";
              }}
            >
              작품 소개
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center px-12 py-10">
          <div
            className="relative w-[148px] h-[197px] rounded-sm overflow-hidden"
            style={{
              border: "1px solid #E8E2D9",
              boxShadow: "0 24px 64px rgba(26,24,20,0.08), 0 0 0 1px rgba(212,75,32,0.06)",
              transform: "rotate(2deg) translateY(-4px)",
            }}
          >
            <div
              className="w-full h-full flex items-end p-3"
              style={{ background: "linear-gradient(150deg, #E8E2D9 0%, #D4C9B8 60%, #E8E2D9 100%)" }}
            >
              <span
                className="text-[11px] font-medium leading-snug"
                style={{ fontFamily: "'Noto Serif KR', serif", color: "rgba(26,24,20,0.5)" }}
              >
                {novel.title}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 flex items-center gap-5 px-8 md:px-12 py-2.5 border-t text-[11px]"
        style={{ borderColor: "#E8E2D9", color: "#8A8478" }}
      >
        <span>{novel.view_count.toLocaleString()} 조회</span>
        <span className="w-px h-3 inline-block" style={{ backgroundColor: "#E8E2D9" }} />
        <span>{novel.chapter_count}화</span>
        <span className="w-px h-3 inline-block" style={{ backgroundColor: "#E8E2D9" }} />
        <span style={{ color: "#2D7A3A" }}>연재 중</span>
      </div>
    </section>
  );
}

/* ─── Stats Bar ────────────────────────────────────── */
function StatsBar({ total }: { total: number | null }) {
  const stats = [
    { label: "누적 작품",    value: total != null ? total.toLocaleString() : "—" },
    { label: "연재 중",      value: "—" },
    { label: "등록 작가",    value: "—" },
    { label: "오늘 업데이트", value: "—" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 rounded-md overflow-hidden" style={{ border: "1px solid #E8E2D9" }}>
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="flex flex-col items-center justify-center py-4 gap-1"
          style={{
            backgroundColor: "#F5F1EB",
            borderRight: i < stats.length - 1 ? "1px solid #E8E2D9" : undefined,
          }}
        >
          <span
            className="text-lg font-bold"
            style={{ fontFamily: "'Cormorant', Georgia, serif", color: "#D44B20" }}
          >
            {stat.value}
          </span>
          <span className="text-[10px]" style={{ color: "#8A8478" }}>
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Writer CTA ─────────────────────────────────────  */
function WriterCTA() {
  return (
    <div
      className="relative overflow-hidden rounded-md px-8 py-12 text-center"
      style={{
        background: "linear-gradient(135deg, rgba(212,75,32,0.04) 0%, transparent 50%, rgba(212,75,32,0.02) 100%)",
        border: "1px solid rgba(212,75,32,0.12)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(212,75,32,0.06) 0%, transparent 65%)" }}
      />
      <div className="relative z-10">
        <p className="text-[9px] tracking-[0.22em] uppercase mb-3" style={{ color: "#D44B20" }}>
          작가 여러분께
        </p>
        <h2
          className="font-bold mb-3"
          style={{
            fontFamily: "'Cormorant', 'Noto Serif KR', Georgia, serif",
            fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
            color: "#1A1814",
          }}
        >
          당신의 이야기를 시작하세요
        </h2>
        <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "#6B6560", lineHeight: 1.85 }}>
          캐릭터 설정, 세계관 DB, 스마트 편집기까지.<br />
          작가에게 최적화된 창작 환경을 무료로 제공합니다.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center h-10 px-7 text-sm font-medium rounded-sm transition-colors"
          style={{ backgroundColor: "#D44B20", color: "#FFFFFF" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8401A")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D44B20")}
        >
          무료로 시작하기
        </Link>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function MainPage() {
  const [popular,   setPopular]   = useState<Novel[]>([]);
  const [latest,    setLatest]    = useState<Novel[]>([]);
  const [updated,   setUpdated]   = useState<Novel[]>([]);
  const [completed, setCompleted] = useState<Novel[]>([]);
  const [total,     setTotal]     = useState<number | null>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      novelsApi.list({ sort: "popular", limit: 12 }),
      novelsApi.list({ sort: "latest",  limit: 12 }),
      novelsApi.list({ sort: "updated", limit: 12 }),
      novelsApi.list({ sort: "popular", status: "completed", limit: 12 }),
    ]).then(([pop, lat, upd, comp]) => {
      setPopular(pop.data);
      setLatest(lat.data);
      setUpdated(upd.data);
      setCompleted(comp.data);
      setTotal(pop.total);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const featured = popular[0] ?? null;
  const divider  = <div className="border-t" style={{ borderColor: "#EDE8E0" }} />;

  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-10">
        <Hero novel={featured} loading={loading} />
        <StatsBar total={total} />
        <Section
          title="지금 인기 있는 소설"
          icon={<TrendingUp className="h-4 w-4" />}
          moreHref="/search?sort=popular"
          novels={popular.map(toCardData)}
          loading={loading}
        />
        {divider}
        <Section
          title="신규 연재"
          icon={<Zap className="h-4 w-4" />}
          moreHref="/search?sort=latest"
          novels={latest.map(toCardData)}
          loading={loading}
        />
        {divider}
        <Section
          title="빠른 업로드"
          icon={<Clock className="h-4 w-4" />}
          moreHref="/search?sort=updated"
          novels={updated.map(toCardData)}
          loading={loading}
        />
        {divider}
        <Section
          title="완결 추천"
          icon={<BookCheck className="h-4 w-4" />}
          moreHref="/search?status=completed"
          novels={completed.map(toCardData)}
          loading={loading}
        />
        <WriterCTA />
      </main>
      <Footer />
    </>
  );
}

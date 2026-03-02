"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NovelCard, type NovelCardData } from "@/components/novel/NovelCard";
import { ChevronRight, TrendingUp, Clock, BookCheck, Zap } from "lucide-react";

/* ─── Mock data (replace with DB queries) ─────────── */
const MOCK_NOVELS: NovelCardData[] = Array.from({ length: 32 }, (_, i) => ({
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
  genre: ["판타지", "로맨스", "현대", "무협", "SF"][i % 5],
  status: (["ongoing", "ongoing", "ongoing", "completed", "hiatus"] as const)[i % 5],
  chapter_count: 50 + i * 12,
  view_count: 100000 + i * 23456,
  latest_chapter: 50 + i * 12,
}));

const FEATURED = {
  ...MOCK_NOVELS[0],
  synopsis:
    "한 번 죽었다 살아난 검사 이준혁. 눈을 뜨니 그는 소설 속 조연이었다. 최약체로 설정된 캐릭터, 그러나 전생의 기억을 가진 채로 이 세계의 최강자가 되기 위한 여정이 시작된다.",
};

/* ─── Section ─────────────────────────────────────── */
function Section({
  title,
  icon,
  moreHref,
  novels,
}: {
  title: string;
  icon?: React.ReactNode;
  moreHref: string;
  novels: NovelCardData[];
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span style={{ color: "#BF9742" }}>{icon}</span>}
          <h2
            className="text-[15px] font-semibold"
            style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              color: "#EDE8DC",
            }}
          >
            {title}
          </h2>
          <div
            className="h-px w-6"
            style={{ backgroundColor: "rgba(191,151,66,0.3)" }}
          />
        </div>
        <Link
          href={moreHref}
          className="flex items-center gap-0.5 text-xs transition-colors"
          style={{ color: "#5A544A" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#BF9742")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#5A544A")}
        >
          더보기
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 gap-3">
        {novels.slice(0, 11).map((novel, idx) => (
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
function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden rounded-md"
      style={{
        minHeight: "320px",
        background: "linear-gradient(150deg, #131008 0%, #1a1612 50%, #0e0c0a 100%)",
        border: "1px solid #302B22",
      }}
    >
      {/* Gold left rule */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, #BF9742 30%, #BF9742 70%, transparent 100%)",
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 70% 50%, rgba(191,151,66,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row min-h-[320px]">
        {/* Text */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-10">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-px w-5" style={{ backgroundColor: "#BF9742" }} />
            <span
              className="text-[9px] font-semibold tracking-[0.18em] uppercase"
              style={{ color: "#BF9742" }}
            >
              이주의 추천
            </span>
          </div>

          {/* Genre tag */}
          <div className="mb-3">
            <span
              className="text-[10px] px-2 py-0.5 rounded-sm font-medium"
              style={{
                backgroundColor: "rgba(191,151,66,0.08)",
                border: "1px solid rgba(191,151,66,0.18)",
                color: "#D4AF5F",
              }}
            >
              {FEATURED.genre}
            </span>
          </div>

          {/* Big title */}
          <h1
            className="font-bold leading-tight mb-4"
            style={{
              fontFamily: "'Libre Baskerville', 'Noto Serif KR', Georgia, serif",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              color: "#EDE8DC",
              maxWidth: "520px",
            }}
          >
            {FEATURED.title}
          </h1>

          {/* Meta */}
          <p className="text-sm mb-4" style={{ color: "#9E9688" }}>
            {FEATURED.author_name}
            <span
              className="mx-2 inline-block w-px h-3 align-middle"
              style={{ backgroundColor: "#302B22" }}
            />
            {FEATURED.chapter_count}화
          </p>

          {/* Synopsis */}
          <p
            className="text-sm leading-relaxed mb-8 line-clamp-2 md:line-clamp-3"
            style={{
              color: "#9E9688",
              maxWidth: "400px",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {FEATURED.synopsis}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href={`/novel/${FEATURED.id}`}
              className="inline-flex items-center h-9 px-5 text-sm font-medium rounded-sm transition-colors"
              style={{ backgroundColor: "#BF9742", color: "#0C0A08" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#D4AF5F")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#BF9742")
              }
            >
              첫화 읽기
            </Link>
            <Link
              href={`/novel/${FEATURED.id}`}
              className="inline-flex items-center h-9 px-4 text-sm rounded-sm transition-all"
              style={{ border: "1px solid #302B22", color: "#9E9688" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(191,151,66,0.3)";
                e.currentTarget.style.color = "#EDE8DC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#302B22";
                e.currentTarget.style.color = "#9E9688";
              }}
            >
              작품 소개
            </Link>
          </div>
        </div>

        {/* Tilted cover */}
        <div className="hidden md:flex items-center justify-center px-12 py-10">
          <div
            className="relative w-[148px] h-[197px] rounded-sm overflow-hidden"
            style={{
              border: "1px solid rgba(191,151,66,0.2)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(191,151,66,0.08)",
              transform: "rotate(2deg) translateY(-4px)",
            }}
          >
            <div
              className="w-full h-full flex items-end p-3"
              style={{
                background:
                  "linear-gradient(150deg, #1a1210 0%, #2c1f16 60%, #1a1210 100%)",
              }}
            >
              <span
                className="text-[11px] font-medium leading-snug"
                style={{
                  fontFamily: "'Noto Serif KR', serif",
                  color: "rgba(237,232,220,0.65)",
                }}
              >
                {FEATURED.title}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="relative z-10 flex items-center gap-5 px-8 md:px-12 py-2.5 border-t text-[11px]"
        style={{ borderColor: "#252018", color: "#5A544A" }}
      >
        <span>{FEATURED.view_count.toLocaleString()} 조회</span>
        <span
          className="w-px h-3 inline-block"
          style={{ backgroundColor: "#302B22" }}
        />
        <span>{FEATURED.chapter_count}화</span>
        <span
          className="w-px h-3 inline-block"
          style={{ backgroundColor: "#302B22" }}
        />
        <span style={{ color: "#58A064" }}>연재 중</span>
      </div>
    </section>
  );
}

/* ─── Stats Bar ────────────────────────────────────── */
function StatsBar() {
  const stats = [
    { label: "누적 작품", value: "12,847" },
    { label: "연재 중", value: "4,203" },
    { label: "등록 작가", value: "8,621" },
    { label: "오늘 업데이트", value: "342" },
  ];

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 rounded-md overflow-hidden"
      style={{ border: "1px solid #302B22" }}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="flex flex-col items-center justify-center py-4 gap-1"
          style={{
            backgroundColor: "#141210",
            borderRight: i < stats.length - 1 ? "1px solid #302B22" : undefined,
          }}
        >
          <span
            className="text-lg font-bold"
            style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              color: "#BF9742",
            }}
          >
            {stat.value}
          </span>
          <span className="text-[10px]" style={{ color: "#5A544A" }}>
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
        background:
          "linear-gradient(135deg, rgba(191,151,66,0.05) 0%, transparent 50%, rgba(191,151,66,0.03) 100%)",
        border: "1px solid rgba(191,151,66,0.12)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(191,151,66,0.08) 0%, transparent 65%)",
        }}
      />
      <div className="relative z-10">
        <p
          className="text-[9px] tracking-[0.22em] uppercase mb-3"
          style={{ color: "#BF9742" }}
        >
          작가 여러분께
        </p>
        <h2
          className="font-bold mb-3"
          style={{
            fontFamily: "'Libre Baskerville', 'Noto Serif KR', Georgia, serif",
            fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
            color: "#EDE8DC",
          }}
        >
          당신의 이야기를 시작하세요
        </h2>
        <p
          className="text-sm mb-8 max-w-md mx-auto"
          style={{ color: "#9E9688", lineHeight: 1.85 }}
        >
          캐릭터 설정, 세계관 DB, 스마트 편집기까지.<br />
          작가에게 최적화된 창작 환경을 무료로 제공합니다.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center h-10 px-7 text-sm font-medium rounded-sm transition-colors"
          style={{ backgroundColor: "#BF9742", color: "#0C0A08" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#D4AF5F")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#BF9742")
          }
        >
          무료로 시작하기
        </Link>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function MainPage() {
  const divider = (
    <div className="border-t" style={{ borderColor: "#1C1914" }} />
  );

  return (
    <>
      <Header user={null} />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-10">
        <Hero />
        <StatsBar />
        <Section
          title="지금 인기 있는 소설"
          icon={<TrendingUp className="h-4 w-4" />}
          moreHref="/search?sort=popular"
          novels={MOCK_NOVELS.slice(0, 11)}
        />
        {divider}
        <Section
          title="신규 연재"
          icon={<Zap className="h-4 w-4" />}
          moreHref="/search?sort=latest"
          novels={[...MOCK_NOVELS].reverse().slice(0, 11)}
        />
        {divider}
        <Section
          title="빠른 업로드"
          icon={<Clock className="h-4 w-4" />}
          moreHref="/search?sort=fast"
          novels={MOCK_NOVELS.filter((_, i) => i % 2 === 0).slice(0, 11)}
        />
        {divider}
        <Section
          title="완결 추천"
          icon={<BookCheck className="h-4 w-4" />}
          moreHref="/search?status=completed"
          novels={MOCK_NOVELS.slice(5, 16)}
        />
        <WriterCTA />
      </main>
      <Footer />
    </>
  );
}

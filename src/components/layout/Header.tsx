"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Search, PenLine, User, Menu, X } from "lucide-react";

const GENRE_NAV = [
  { label: "판타지", href: "/search?genre=판타지" },
  { label: "로맨스", href: "/search?genre=로맨스" },
  { label: "현대",   href: "/search?genre=현대" },
  { label: "무협",   href: "/search?genre=무협" },
  { label: "SF",     href: "/search?genre=SF" },
  { label: "공포",   href: "/search?genre=공포" },
  { label: "완결",   href: "/search?status=completed" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const isLoggedIn = !loading && !!user;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main bar */}
      <div
        className="border-b"
        style={{
          backgroundColor: "rgba(12, 10, 8, 0.92)",
          borderColor: "#302B22",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex h-14 items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-0 shrink-0 group">
              <span
                className="text-lg font-bold tracking-tight"
                style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  color: "#EDE8DC",
                }}
              >
                Novel
              </span>
              <span
                className="text-lg font-bold tracking-tight"
                style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  color: "#BF9742",
                }}
              >
                Worker
              </span>
            </Link>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-sm hidden sm:block"
            >
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none transition-colors"
                  style={{
                    color: searchFocused ? "#BF9742" : "#5A544A",
                  }}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="제목, 작가 검색..."
                  className="w-full h-8 pl-9 pr-3 text-sm rounded-md transition-all outline-none"
                  style={{
                    backgroundColor: searchFocused ? "#1C1914" : "#141210",
                    border: `1px solid ${searchFocused ? "rgba(191,151,66,0.4)" : "#302B22"}`,
                    color: "#EDE8DC",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>
            </form>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-1">
              {loading ? (
                <div className="h-8 w-20 rounded-md animate-pulse" style={{ backgroundColor: "#141210" }} />
              ) : isLoggedIn ? (
                <>
                  <Link
                    href="/studio"
                    className={cn("hidden sm:flex items-center gap-1.5 h-8 px-3 text-sm rounded-md transition-all border font-medium")}
                    style={{
                      backgroundColor: pathname.startsWith("/studio") ? "rgba(191,151,66,0.12)" : "transparent",
                      borderColor:     pathname.startsWith("/studio") ? "rgba(191,151,66,0.35)" : "#302B22",
                      color:           pathname.startsWith("/studio") ? "#BF9742" : "#9E9688",
                    }}
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    연재 관리
                  </Link>
                  <Link
                    href="/mypage"
                    className="flex items-center justify-center h-8 w-8 rounded-md transition-colors"
                    style={{
                      backgroundColor: pathname.startsWith("/mypage") ? "rgba(191,151,66,0.12)" : "transparent",
                      border: "1px solid #302B22",
                      color:  pathname.startsWith("/mypage") ? "#BF9742" : "#9E9688",
                    }}
                    aria-label="마이페이지"
                  >
                    <User className="h-3.5 w-3.5" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:flex h-8 px-3 text-sm items-center rounded-md transition-colors"
                    style={{ color: "#9E9688" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#EDE8DC")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#9E9688")}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="hidden sm:flex h-8 px-3 text-sm items-center rounded-md font-medium transition-all"
                    style={{ backgroundColor: "#BF9742", color: "#0C0A08" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D4AF5F")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#BF9742")}
                  >
                    회원가입
                  </Link>
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                className="sm:hidden flex items-center justify-center h-8 w-8 rounded-md"
                style={{ color: "#9E9688" }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="메뉴"
              >
                {mobileOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Genre nav */}
          <nav className="flex h-9 items-center gap-0.5 overflow-x-auto hide-scrollbar">
            {GENRE_NAV.map((item) => {
              const isActive = pathname + (typeof window !== "undefined" ? window.location.search : "") === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 px-3 h-7 flex items-center text-xs rounded transition-all whitespace-nowrap"
                  style={{
                    color: isActive ? "#BF9742" : "#9E9688",
                    backgroundColor: isActive
                      ? "rgba(191,151,66,0.1)"
                      : "transparent",
                    fontWeight: isActive ? 500 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#EDE8DC";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#9E9688";
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="sm:hidden border-b"
          style={{
            backgroundColor: "#141210",
            borderColor: "#302B22",
          }}
        >
          <div className="px-4 py-3 space-y-2">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "#5A544A" }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="검색..."
                  className="w-full h-9 pl-9 pr-3 text-sm rounded-md outline-none"
                  style={{
                    backgroundColor: "#1C1914",
                    border: "1px solid #302B22",
                    color: "#EDE8DC",
                  }}
                />
              </div>
            </form>
            {!isLoggedIn ? (
              <div className="flex gap-2 pt-1">
                <Link
                  href="/login"
                  className="flex-1 h-9 flex items-center justify-center text-sm rounded-md"
                  style={{ border: "1px solid #302B22", color: "#9E9688" }}
                  onClick={() => setMobileOpen(false)}
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 h-9 flex items-center justify-center text-sm rounded-md font-medium"
                  style={{ backgroundColor: "#BF9742", color: "#0C0A08" }}
                  onClick={() => setMobileOpen(false)}
                >
                  회원가입
                </Link>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  href="/studio"
                  className="flex-1 h-9 flex items-center justify-center gap-1.5 text-sm rounded-md"
                  style={{ border: "1px solid #302B22", color: "#9E9688" }}
                  onClick={() => setMobileOpen(false)}
                >
                  <PenLine className="h-3.5 w-3.5" /> 연재 관리
                </Link>
                <Link
                  href="/mypage"
                  className="flex-1 h-9 flex items-center justify-center gap-1.5 text-sm rounded-md"
                  style={{ border: "1px solid #302B22", color: "#9E9688" }}
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="h-3.5 w-3.5" /> 마이페이지
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

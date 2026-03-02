import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="mt-24 border-t"
      style={{ borderColor: "#302B22" }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div>
            <div className="flex items-baseline gap-0 mb-2">
              <span
                className="text-base font-bold"
                style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  color: "#EDE8DC",
                }}
              >
                Novel
              </span>
              <span
                className="text-base font-bold"
                style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  color: "#BF9742",
                }}
              >
                Worker
              </span>
            </div>
            <p className="text-xs" style={{ color: "#5A544A" }}>
              작가를 위한 창작 플랫폼
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              { label: "이용약관", href: "/terms" },
              { label: "개인정보처리방침", href: "/privacy" },
              { label: "문의하기", href: "/contact" },
              { label: "공지사항", href: "/notice" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs transition-colors"
                style={{ color: "#5A544A" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#9E9688")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#5A544A")
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t"
          style={{ borderColor: "#1C1914" }}
        >
          <p className="text-xs" style={{ color: "#5A544A" }}>
            © 2026 NovelWorker. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "#5A544A" }}>
            작가와 독자를 연결하는 공간
          </p>
        </div>
      </div>
    </footer>
  );
}

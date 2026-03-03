"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Megaphone } from "lucide-react";

export default function NoticesPage() {
  return (
    <>
      <Header />
      <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors"
          style={{ color: "#8A8478" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#D44B20")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8478")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          연재 관리로 돌아가기
        </Link>

        <div
          className="flex flex-col items-center justify-center py-24 rounded-sm"
          style={{ border: "2px dashed #E8E2D9" }}
        >
          <Megaphone className="h-8 w-8 mb-4" style={{ color: "#C5BDB2" }} />
          <p
            className="text-base font-medium mb-1"
            style={{ fontFamily: "'Cormorant', Georgia, serif", color: "#8A8478" }}
          >
            공지사항 관리
          </p>
          <p className="text-xs" style={{ color: "#C5BDB2" }}>
            이 기능은 준비 중입니다
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { novelsApi, type Novel } from "@/lib/api";
import { ArrowLeft, Megaphone, ChevronRight, Loader2 } from "lucide-react";

export default function NoticesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login?redirect=/studio/notices"); return; }

    novelsApi.mine()
      .then((res) => setNovels(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

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

        <h1
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Cormorant', Georgia, serif", color: "#1A1814", fontSize: "1.5rem" }}
        >
          공지사항 관리
        </h1>
        <p className="text-xs mb-6" style={{ color: "#8A8478" }}>
          공지를 작성할 소설을 선택하세요
        </p>

        {loading || authLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#D44B20" }} />
          </div>
        ) : novels.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-sm"
            style={{ border: "2px dashed #E8E2D9" }}
          >
            <Megaphone className="h-8 w-8 mb-4" style={{ color: "#C5BDB2" }} />
            <p className="text-xs" style={{ color: "#8A8478" }}>
              아직 작성한 소설이 없습니다
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {novels.map((novel) => (
              <Link
                key={novel.id}
                href={`/studio/${novel.id}/settings?tab=notices`}
                className="flex items-center justify-between px-4 py-3 rounded-sm transition-all group"
                style={{ border: "1px solid #E8E2D9", backgroundColor: "#FDFBF7" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#D4C9B8";
                  e.currentTarget.style.backgroundColor = "#F5F1EB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E8E2D9";
                  e.currentTarget.style.backgroundColor = "#FDFBF7";
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Megaphone className="h-4 w-4 shrink-0" style={{ color: "#8A8478" }} />
                  <span
                    className="text-sm font-medium truncate"
                    style={{ fontFamily: "'Noto Serif KR', serif", color: "#1A1814" }}
                  >
                    {novel.title}
                  </span>
                </div>
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                  style={{ color: "#C5BDB2" }}
                />
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

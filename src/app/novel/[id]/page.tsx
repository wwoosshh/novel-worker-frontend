"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import {
  novelsApi,
  chaptersApi,
  usersApi,
  noticesApi,
  type Novel,
  type Chapter,
  type Notice,
} from "@/lib/api";
import {
  BookOpen,
  Eye,
  Users,
  Clock,
  ChevronRight,
  Bell,
  BellOff,
  Loader2,
  Megaphone,
  Pin,
} from "lucide-react";

const STATUS_CONFIG = {
  ongoing:   { label: "연재중", color: "#2D7A3A", bg: "rgba(45,122,58,0.06)",  border: "rgba(45,122,58,0.15)" },
  hiatus:    { label: "휴재",   color: "#A07830", bg: "rgba(160,120,48,0.06)",  border: "rgba(160,120,48,0.15)" },
  completed: { label: "완결",   color: "#3A6FA0", bg: "rgba(58,111,160,0.06)", border: "rgba(58,111,160,0.15)" },
} as const;

export default function NovelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = params.id as string;
  const { user } = useAuth();

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [novelRes, chaptersRes, noticesRes] = await Promise.all([
          novelsApi.get(novelId),
          chaptersApi.list(novelId),
          noticesApi.list(novelId),
        ]);
        setNovel(novelRes.data);
        setChapters(
          chaptersRes.data
            .filter((ch) => ch.is_public)
            .sort((a, b) => a.number - b.number)
        );
        setNotices(noticesRes.data);

        // Check subscription status
        if (user) {
          try {
            const subsRes = await usersApi.subscriptions();
            setSubscribed(subsRes.data.some((n) => n.id === novelId));
          } catch {
            // not subscribed or not logged in
          }
        }
      } catch (err) {
        console.error("Failed to load novel:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [novelId, user]);

  const toggleSubscribe = async () => {
    if (!user) {
      router.push(`/login?redirect=/novel/${novelId}`);
      return;
    }
    setSubLoading(true);
    try {
      if (subscribed) {
        await usersApi.unsubscribe(novelId);
        setSubscribed(false);
      } else {
        await usersApi.subscribe(novelId);
        setSubscribed(true);
      }
    } catch (err) {
      console.error("Subscription error:", err);
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#D44B20" }} />
            <p className="text-xs" style={{ color: "#8A8478" }}>불러오는 중...</p>
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
        <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-sm" style={{ color: "#8A8478" }}>소설을 찾을 수 없습니다.</p>
        </main>
        <Footer />
      </>
    );
  }

  const status = STATUS_CONFIG[novel.status] ?? STATUS_CONFIG.ongoing;
  const updatedDate = new Date(novel.updated_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Header />
      <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-8">
        {/* Hero section */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          {/* Cover placeholder */}
          <div
            className="shrink-0 w-32 h-44 rounded-sm self-center sm:self-start"
            style={{
              background: "linear-gradient(150deg, #E8E2D9 0%, #D4C9B8 100%)",
              border: "1px solid #E8E2D9",
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-8 w-8" style={{ color: "#C5BDB2" }} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ fontFamily: "'Cormorant', 'Noto Serif KR', Georgia, serif", color: "#1A1814" }}
            >
              {novel.title}
            </h1>

            <p className="text-sm mb-3" style={{ color: "#6B6560" }}>
              {novel.author_name}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className="text-[10px] px-2 py-0.5 rounded-sm font-medium"
                style={{ color: status.color, backgroundColor: status.bg, border: `1px solid ${status.border}` }}
              >
                {status.label}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-sm"
                style={{ color: "#8A8478", backgroundColor: "#F5F1EB", border: "1px solid #E8E2D9" }}
              >
                {novel.genre}
              </span>
              {novel.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-sm"
                  style={{ color: "#8A8478", backgroundColor: "#F5F1EB", border: "1px solid #E8E2D9" }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            {novel.synopsis && (
              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: "#6B6560", fontFamily: "'Noto Serif KR', serif" }}
              >
                {novel.synopsis}
              </p>
            )}

            {/* Subscribe button */}
            <button
              onClick={toggleSubscribe}
              disabled={subLoading}
              className="flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-sm transition-all"
              style={{
                backgroundColor: subscribed ? "#F5F1EB" : "#D44B20",
                color: subscribed ? "#6B6560" : "#FFFFFF",
                border: subscribed ? "1px solid #E8E2D9" : "1px solid #D44B20",
                opacity: subLoading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!subscribed) e.currentTarget.style.backgroundColor = "#B8401A";
              }}
              onMouseLeave={(e) => {
                if (!subscribed) e.currentTarget.style.backgroundColor = "#D44B20";
              }}
            >
              {subscribed ? (
                <>
                  <BellOff className="h-3.5 w-3.5" />
                  구독 중
                </>
              ) : (
                <>
                  <Bell className="h-3.5 w-3.5" />
                  구독하기
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="grid grid-cols-4 rounded-sm overflow-hidden mb-8"
          style={{ border: "1px solid #E8E2D9" }}
        >
          {[
            { icon: <BookOpen className="h-3.5 w-3.5" />, label: "총 화수", value: `${novel.chapter_count}화` },
            { icon: <Eye className="h-3.5 w-3.5" />,      label: "조회수",  value: novel.view_count.toLocaleString() },
            { icon: <Users className="h-3.5 w-3.5" />,    label: "구독자",  value: (novel.subscriber_count ?? 0).toLocaleString() },
            { icon: <Clock className="h-3.5 w-3.5" />,    label: "최근 업데이트", value: updatedDate },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-3 gap-1"
              style={{
                backgroundColor: "#F5F1EB",
                borderRight: i < 3 ? "1px solid #E8E2D9" : undefined,
              }}
            >
              <div className="flex items-center gap-1" style={{ color: "#D44B20" }}>
                {stat.icon}
                <span
                  className="text-sm font-bold"
                  style={{ fontFamily: "'Cormorant', Georgia, serif" }}
                >
                  {stat.value}
                </span>
              </div>
              <span className="text-[9px]" style={{ color: "#8A8478" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Notices section */}
        {notices.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <p
                className="text-[9px] font-semibold tracking-[0.14em] uppercase"
                style={{ color: "#8A8478" }}
              >
                공지사항
              </p>
              <div className="flex-1 h-px" style={{ backgroundColor: "#EDE8E0" }} />
            </div>
            <div className="space-y-1">
              {notices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/novel/${novelId}/notice/${notice.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-sm transition-all group"
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
                  <span className="shrink-0" style={{ color: "#D44B20" }}>
                    {notice.is_pinned ? (
                      <Pin className="h-3.5 w-3.5" />
                    ) : (
                      <Megaphone className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span
                    className="text-sm flex-1 truncate"
                    style={{ color: "#1A1814", fontFamily: "'Noto Serif KR', serif" }}
                  >
                    {notice.title}
                  </span>
                  <span className="text-[10px] shrink-0" style={{ color: "#C5BDB2" }}>
                    {new Date(notice.created_at).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                    style={{ color: "#C5BDB2" }}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Chapter list */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <p
              className="text-[9px] font-semibold tracking-[0.14em] uppercase"
              style={{ color: "#8A8478" }}
            >
              목차
            </p>
            <div className="flex-1 h-px" style={{ backgroundColor: "#EDE8E0" }} />
            <span className="text-[10px]" style={{ color: "#8A8478" }}>
              {chapters.length}화
            </span>
          </div>

          {chapters.length === 0 ? (
            <div
              className="flex items-center justify-center py-12 rounded-sm"
              style={{ border: "2px dashed #E8E2D9" }}
            >
              <p className="text-xs" style={{ color: "#8A8478" }}>
                아직 공개된 화가 없습니다
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {chapters.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/novel/${novelId}/chapter/${ch.number}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-sm transition-all group"
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
                  <span
                    className="text-xs font-medium shrink-0 w-8 text-center"
                    style={{ color: "#D44B20" }}
                  >
                    {ch.number}화
                  </span>
                  <span
                    className="text-sm flex-1 truncate"
                    style={{ color: "#1A1814", fontFamily: "'Noto Serif KR', serif" }}
                  >
                    {ch.title || "제목 없음"}
                  </span>
                  <span className="text-[10px] shrink-0" style={{ color: "#C5BDB2" }}>
                    {new Date(ch.created_at).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                    style={{ color: "#C5BDB2" }}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

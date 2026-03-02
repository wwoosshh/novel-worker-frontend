"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  User,
  BookOpen,
  Eye,
  Heart,
  Bell,
  Lock,
  LogOut,
  ChevronRight,
  Edit3,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Mock data ─────────────────────────────────────── */
const MOCK_USER = {
  id: "u1",
  username: "cheolsu_writes",
  display_name: "김철수",
  bio: "판타지와 무협을 주로 쓰는 작가입니다. 독자 여러분의 응원에 감사드립니다.",
  email: "cheolsu@example.com",
  joined: "2024년 3월",
  avatar_initial: "김",
};

const MOCK_STATS = {
  novels: 3,
  total_views: 5375825,
  total_chapters: 391,
  subscribers: 34451,
};

const MOCK_SUBSCRIPTIONS = [
  { id: "s1", title: "전지적 독자 시점", author: "싱숑", latest: "551화", genre: "판타지", updated: "3시간 전" },
  { id: "s2", title: "나 혼자만 레벨업", author: "추공", latest: "270화", genre: "판타지", updated: "어제" },
  { id: "s3", title: "황후의 두 번째 삶", author: "이영희", latest: "88화", genre: "로맨스", updated: "2일 전" },
];

/* ─── Tab types ─────────────────────────────────────── */
type Tab = "profile" | "subscriptions" | "notifications" | "account";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "profile",       label: "프로필",     icon: <User className="h-3.5 w-3.5" /> },
  { key: "subscriptions", label: "구독 중인 소설", icon: <BookOpen className="h-3.5 w-3.5" /> },
  { key: "notifications", label: "알림 설정",   icon: <Bell className="h-3.5 w-3.5" /> },
  { key: "account",       label: "계정 관리",   icon: <Lock className="h-3.5 w-3.5" /> },
];

/* ─── Profile Tab ────────────────────────────────────── */
function ProfileTab() {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(MOCK_USER.display_name);
  const [bio, setBio] = useState(MOCK_USER.bio);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Avatar + name */}
      <div className="flex items-start gap-5">
        <div
          className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
          style={{
            background: "linear-gradient(135deg, rgba(191,151,66,0.15) 0%, rgba(191,151,66,0.06) 100%)",
            border: "2px solid rgba(191,151,66,0.2)",
            fontFamily: "'Noto Serif KR', serif",
            color: "#BF9742",
          }}
        >
          {MOCK_USER.avatar_initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2
              className="text-lg font-bold"
              style={{
                fontFamily: "'Libre Baskerville', 'Noto Serif KR', serif",
                color: "#EDE8DC",
              }}
            >
              {displayName}
            </h2>
            <span
              className="text-xs px-1.5 py-0.5 rounded-sm"
              style={{ backgroundColor: "#1C1914", color: "#5A544A" }}
            >
              작가
            </span>
          </div>
          <p className="text-xs" style={{ color: "#5A544A" }}>
            @{MOCK_USER.username} · {MOCK_USER.joined} 가입
          </p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1.5 h-7 px-3 text-xs rounded-sm transition-all shrink-0"
          style={{
            border: "1px solid #302B22",
            color: editing ? "#BF9742" : "#9E9688",
            borderColor: editing ? "rgba(191,151,66,0.3)" : "#302B22",
          }}
        >
          <Edit3 className="h-3 w-3" />
          {editing ? "취소" : "수정"}
        </button>
      </div>

      {/* Edit form */}
      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-wide uppercase" style={{ color: "#5A544A" }}>
              표시 이름
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-sm outline-none transition-all"
              style={{
                backgroundColor: "#141210",
                border: "1px solid #302B22",
                color: "#EDE8DC",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(191,151,66,0.4)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#302B22")}
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-wide uppercase" style={{ color: "#5A544A" }}>
              소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-sm outline-none transition-all resize-none"
              style={{
                backgroundColor: "#141210",
                border: "1px solid #302B22",
                color: "#EDE8DC",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.7,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(191,151,66,0.4)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#302B22")}
            />
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 h-8 px-4 text-xs font-medium rounded-sm transition-colors"
            style={{ backgroundColor: "#BF9742", color: "#0C0A08" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D4AF5F")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#BF9742")}
          >
            저장
          </button>
        </div>
      ) : (
        <div
          className="rounded-sm p-4"
          style={{ backgroundColor: "#141210", border: "1px solid #302B22" }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "#9E9688",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.75,
            }}
          >
            {bio || "소개가 없습니다."}
          </p>
        </div>
      )}

      {saved && (
        <div
          className="flex items-center gap-2 h-8 px-3 rounded-sm text-xs"
          style={{ backgroundColor: "rgba(88,160,100,0.1)", border: "1px solid rgba(88,160,100,0.2)", color: "#58A064" }}
        >
          <Check className="h-3.5 w-3.5" />
          프로필이 저장되었습니다.
        </div>
      )}

      {/* Activity stats */}
      <div>
        <p
          className="text-[9px] font-semibold tracking-[0.14em] uppercase mb-3"
          style={{ color: "#5A544A" }}
        >
          활동 요약
        </p>
        <div
          className="grid grid-cols-2 sm:grid-cols-4 rounded-sm overflow-hidden"
          style={{ border: "1px solid #302B22" }}
        >
          {[
            { icon: <BookOpen className="h-3.5 w-3.5" />, label: "연재 소설", value: `${MOCK_STATS.novels}편` },
            { icon: <Eye className="h-3.5 w-3.5" />, label: "총 조회수", value: MOCK_STATS.total_views.toLocaleString() },
            { icon: <BookOpen className="h-3.5 w-3.5" />, label: "총 화수", value: `${MOCK_STATS.total_chapters}화` },
            { icon: <Heart className="h-3.5 w-3.5" />, label: "총 구독자", value: MOCK_STATS.subscribers.toLocaleString() },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-3.5 gap-1"
              style={{
                backgroundColor: "#141210",
                borderRight: i < 3 ? "1px solid #302B22" : undefined,
              }}
            >
              <div className="flex items-center gap-1.5">
                <span style={{ color: "#5A544A" }}>{stat.icon}</span>
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    color: "#EDE8DC",
                  }}
                >
                  {stat.value}
                </span>
              </div>
              <span className="text-[10px]" style={{ color: "#5A544A" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Subscriptions Tab ──────────────────────────────── */
function SubscriptionsTab() {
  return (
    <div className="space-y-2">
      <p className="text-xs mb-4" style={{ color: "#5A544A" }}>
        구독 중인 소설 {MOCK_SUBSCRIPTIONS.length}편
      </p>
      {MOCK_SUBSCRIPTIONS.map((sub) => (
        <Link
          key={sub.id}
          href={`/novel/${sub.id}`}
          className="flex items-center gap-3 px-4 py-3 rounded-sm transition-all"
          style={{
            backgroundColor: "#141210",
            border: "1px solid #302B22",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3C362C")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#302B22")}
        >
          <div
            className="shrink-0 w-8 h-11 rounded-sm"
            style={{ background: "linear-gradient(150deg, #1a1210 0%, #2c1f16 100%)", border: "1px solid #302B22" }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate mb-0.5" style={{ fontFamily: "'Noto Serif KR', serif", color: "#EDE8DC" }}>
              {sub.title}
            </p>
            <p className="text-[11px]" style={{ color: "#5A544A" }}>
              {sub.author} · {sub.latest} · {sub.updated}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "#5A544A" }} />
        </Link>
      ))}
    </div>
  );
}

/* ─── Notifications Tab ──────────────────────────────── */
function NotificationsTab() {
  const [settings, setSettings] = useState({
    new_chapter: true,
    comments: false,
    announcements: true,
    marketing: false,
  });

  const ITEMS = [
    { key: "new_chapter" as const, label: "새 화 알림", desc: "구독 소설에 새 화가 올라오면 알림을 받습니다" },
    { key: "comments" as const, label: "댓글 알림", desc: "내 소설에 댓글이 달리면 알림을 받습니다" },
    { key: "announcements" as const, label: "공지사항", desc: "서비스 공지사항을 알림으로 받습니다" },
    { key: "marketing" as const, label: "이벤트/마케팅", desc: "이벤트 및 프로모션 정보를 받습니다" },
  ];

  return (
    <div className="space-y-2">
      {ITEMS.map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between px-4 py-3.5 rounded-sm"
          style={{ backgroundColor: "#141210", border: "1px solid #302B22" }}
        >
          <div>
            <p className="text-sm font-medium mb-0.5" style={{ color: "#EDE8DC" }}>
              {item.label}
            </p>
            <p className="text-[11px]" style={{ color: "#5A544A" }}>
              {item.desc}
            </p>
          </div>
          <button
            onClick={() => setSettings((s) => ({ ...s, [item.key]: !s[item.key] }))}
            className="relative shrink-0 w-10 h-5 rounded-full transition-all"
            style={{
              backgroundColor: settings[item.key]
                ? "rgba(191,151,66,0.7)"
                : "#302B22",
            }}
            aria-checked={settings[item.key]}
            role="switch"
          >
            <span
              className="absolute top-0.5 h-4 w-4 rounded-full transition-transform"
              style={{
                backgroundColor: settings[item.key] ? "#BF9742" : "#5A544A",
                transform: settings[item.key] ? "translateX(20px)" : "translateX(2px)",
              }}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Account Tab ────────────────────────────────────── */
function AccountTab() {
  return (
    <div className="space-y-4">
      <div
        className="rounded-sm overflow-hidden"
        style={{ border: "1px solid #302B22" }}
      >
        <div
          className="px-4 py-2 border-b"
          style={{ borderColor: "#302B22", backgroundColor: "#141210" }}
        >
          <p className="text-[9px] font-semibold tracking-[0.14em] uppercase" style={{ color: "#5A544A" }}>
            계정 정보
          </p>
        </div>
        <div style={{ backgroundColor: "#0C0A08" }}>
          <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: "#302B22" }}>
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: "#9E9688" }}>이메일</p>
              <p className="text-sm" style={{ color: "#EDE8DC" }}>{MOCK_USER.email}</p>
            </div>
            <button className="text-xs h-6 px-2 rounded-sm" style={{ border: "1px solid #302B22", color: "#5A544A" }}>
              변경
            </button>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: "#9E9688" }}>비밀번호</p>
              <p className="text-sm" style={{ color: "#5A544A" }}>••••••••••</p>
            </div>
            <button className="text-xs h-6 px-2 rounded-sm" style={{ border: "1px solid #302B22", color: "#5A544A" }}>
              변경
            </button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        className="flex items-center gap-2 w-full px-4 py-3 text-sm rounded-sm transition-all"
        style={{
          border: "1px solid rgba(192,84,74,0.2)",
          backgroundColor: "rgba(192,84,74,0.05)",
          color: "#C0544A",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(192,84,74,0.1)";
          e.currentTarget.style.borderColor = "rgba(192,84,74,0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(192,84,74,0.05)";
          e.currentTarget.style.borderColor = "rgba(192,84,74,0.2)";
        }}
      >
        <LogOut className="h-4 w-4" />
        로그아웃
      </button>

      {/* Danger zone */}
      <div
        className="rounded-sm overflow-hidden"
        style={{ border: "1px solid #302B22" }}
      >
        <div
          className="px-4 py-2 border-b"
          style={{ borderColor: "#302B22", backgroundColor: "#141210" }}
        >
          <p className="text-[9px] font-semibold tracking-[0.14em] uppercase" style={{ color: "#5A544A" }}>
            위험 구역
          </p>
        </div>
        <div className="px-4 py-3" style={{ backgroundColor: "#0C0A08" }}>
          <p className="text-xs mb-3" style={{ color: "#5A544A" }}>
            계정을 삭제하면 모든 소설과 데이터가 영구적으로 삭제됩니다.
          </p>
          <button
            className="text-xs h-7 px-3 rounded-sm transition-all"
            style={{ border: "1px solid #302B22", color: "#5A544A" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(192,84,74,0.3)";
              e.currentTarget.style.color = "#C0544A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#302B22";
              e.currentTarget.style.color = "#5A544A";
            }}
          >
            계정 삭제
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function MyPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const TAB_CONTENT: Record<Tab, React.ReactNode> = {
    profile:       <ProfileTab />,
    subscriptions: <SubscriptionsTab />,
    notifications: <NotificationsTab />,
    account:       <AccountTab />,
  };

  return (
    <>
      <Header user={MOCK_USER} />
      <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1
            className="text-xl font-bold"
            style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              color: "#EDE8DC",
            }}
          >
            마이페이지
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-5">
          {/* Tab sidebar */}
          <aside className="shrink-0 sm:w-44">
            <nav className="flex sm:flex-col gap-1 overflow-x-auto hide-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-2.5 h-9 px-3 text-xs rounded-sm transition-all whitespace-nowrap"
                  style={{
                    backgroundColor:
                      activeTab === tab.key
                        ? "rgba(191,151,66,0.1)"
                        : "transparent",
                    border:
                      activeTab === tab.key
                        ? "1px solid rgba(191,151,66,0.2)"
                        : "1px solid transparent",
                    color: activeTab === tab.key ? "#D4AF5F" : "#9E9688",
                    fontWeight: activeTab === tab.key ? 500 : 400,
                  }}
                >
                  <span
                    style={{
                      color: activeTab === tab.key ? "#BF9742" : "#5A544A",
                    }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Tab content */}
          <div className="flex-1 min-w-0">
            {TAB_CONTENT[activeTab]}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

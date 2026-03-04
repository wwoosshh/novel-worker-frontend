"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { usersApi, novelsApi, type Profile, type Novel } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import {
  User, BookOpen, Eye, Heart, Bell, Lock, LogOut,
  ChevronRight, Edit3, Check,
} from "lucide-react";

type Tab = "profile" | "subscriptions" | "notifications" | "account";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "profile",       label: "프로필",       icon: <User className="h-3.5 w-3.5" /> },
  { key: "subscriptions", label: "구독 중인 소설", icon: <BookOpen className="h-3.5 w-3.5" /> },
  { key: "notifications", label: "알림 설정",     icon: <Bell className="h-3.5 w-3.5" /> },
  { key: "account",       label: "계정 관리",     icon: <Lock className="h-3.5 w-3.5" /> },
];

/* ─── Profile Tab ─────────────────────────────────── */
function ProfileTab({
  profile,
  novels,
  userEmail,
  onUpdated,
}: {
  profile: Profile;
  novels: Novel[];
  userEmail: string;
  onUpdated: (p: Profile) => void;
}) {
  const [editing,       setEditing]       = useState(false);
  const [displayName,   setDisplayName]   = useState(profile.display_name);
  const [bio,           setBio]           = useState(profile.bio ?? "");
  const [donationLink,  setDonationLink]  = useState(profile.donation_link ?? "");
  const [donationLabel, setDonationLabel] = useState(profile.donation_label ?? "");
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await usersApi.updateMe({
        display_name: displayName,
        bio,
        donation_link: donationLink.trim() || null,
        donation_label: donationLabel.trim() || null,
      });
      onUpdated(res.data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const totalViews    = novels.reduce((s, n) => s + n.view_count, 0);
  const totalChapters = novels.reduce((s, n) => s + n.chapter_count, 0);
  const totalSubs     = novels.reduce((s, n) => s + (n.subscriber_count ?? 0), 0);
  const avatarInitial = profile.display_name?.[0] ?? profile.username?.[0] ?? "?";

  return (
    <div className="space-y-6">
      {/* Avatar + name */}
      <div className="flex items-start gap-5">
        <div
          className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
          style={{
            background: "linear-gradient(135deg, rgba(212,75,32,0.1) 0%, rgba(212,75,32,0.04) 100%)",
            border: "2px solid rgba(212,75,32,0.15)",
            fontFamily: "'Noto Serif KR', serif",
            color: "#D44B20",
          }}
        >
          {avatarInitial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: "'Cormorant', 'Noto Serif KR', serif", color: "#1A1814" }}
            >
              {profile.display_name}
            </h2>
            <span className="text-xs px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: "#F5F1EB", color: "#8A8478" }}>
              작가
            </span>
          </div>
          <p className="text-xs" style={{ color: "#8A8478" }}>
            @{profile.username} · {new Date(profile.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long" })} 가입
          </p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1.5 h-7 px-3 text-xs rounded-sm transition-all shrink-0"
          style={{
            border: "1px solid #E8E2D9",
            color: editing ? "#D44B20" : "#6B6560",
            borderColor: editing ? "rgba(212,75,32,0.25)" : "#E8E2D9",
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
            <label className="block text-[10px] font-medium mb-1.5 tracking-wide uppercase" style={{ color: "#8A8478" }}>
              표시 이름
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-sm outline-none transition-all"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E2D9", color: "#1A1814", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.35)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "#E8E2D9")}
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium mb-1.5 tracking-wide uppercase" style={{ color: "#8A8478" }}>
              소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-sm outline-none transition-all resize-none"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E2D9", color: "#1A1814", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.7 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.35)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "#E8E2D9")}
            />
          </div>
          {/* 응원 링크 설정 */}
          <div className="pt-2 mt-2" style={{ borderTop: "1px solid #E8E2D9" }}>
            <label className="block text-[10px] font-medium mb-1.5 tracking-wide uppercase" style={{ color: "#8A8478" }}>
              응원 링크
            </label>
            <input
              value={donationLink}
              onChange={(e) => setDonationLink(e.target.value)}
              placeholder="https://toss.me/닉네임"
              className="w-full h-9 px-3 text-sm rounded-sm outline-none transition-all mb-3"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E2D9", color: "#1A1814", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.35)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "#E8E2D9")}
            />
            <label className="block text-[10px] font-medium mb-1.5 tracking-wide uppercase" style={{ color: "#8A8478" }}>
              버튼 이름
            </label>
            <input
              value={donationLabel}
              onChange={(e) => setDonationLabel(e.target.value)}
              placeholder="토스로 응원하기"
              className="w-full h-9 px-3 text-sm rounded-sm outline-none transition-all mb-2"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E2D9", color: "#1A1814", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.35)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "#E8E2D9")}
            />
            <p className="text-[11px] leading-relaxed" style={{ color: "#8A8478" }}>
              독자들이 챕터를 읽은 후 이 링크로 응원할 수 있습니다
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 h-8 px-4 text-xs font-medium rounded-sm transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#D44B20", color: "#FFFFFF" }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#B8401A"; }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#D44B20"; }}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      ) : (
        <div className="rounded-sm p-4" style={{ backgroundColor: "#F5F1EB", border: "1px solid #E8E2D9" }}>
          <p className="text-sm leading-relaxed" style={{ color: "#6B6560", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.75 }}>
            {profile.bio || "소개가 없습니다."}
          </p>
        </div>
      )}

      {saved && (
        <div
          className="flex items-center gap-2 h-8 px-3 rounded-sm text-xs"
          style={{ backgroundColor: "rgba(45,122,58,0.06)", border: "1px solid rgba(45,122,58,0.15)", color: "#2D7A3A" }}
        >
          <Check className="h-3.5 w-3.5" />
          프로필이 저장되었습니다.
        </div>
      )}

      {/* Activity stats */}
      <div>
        <p className="text-[9px] font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: "#8A8478" }}>
          활동 요약
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 rounded-sm overflow-hidden" style={{ border: "1px solid #E8E2D9" }}>
          {[
            { icon: <BookOpen className="h-3.5 w-3.5" />, label: "연재 소설", value: `${novels.length}편` },
            { icon: <Eye className="h-3.5 w-3.5" />,      label: "총 조회수", value: totalViews.toLocaleString() },
            { icon: <BookOpen className="h-3.5 w-3.5" />, label: "총 화수",   value: `${totalChapters}화` },
            { icon: <Heart className="h-3.5 w-3.5" />,    label: "총 구독자", value: totalSubs.toLocaleString() },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-3.5 gap-1"
              style={{ backgroundColor: "#F5F1EB", borderRight: i < 3 ? "1px solid #E8E2D9" : undefined }}
            >
              <div className="flex items-center gap-1.5">
                <span style={{ color: "#8A8478" }}>{stat.icon}</span>
                <span className="text-sm font-bold" style={{ fontFamily: "'Cormorant', Georgia, serif", color: "#1A1814" }}>
                  {stat.value}
                </span>
              </div>
              <span className="text-[10px]" style={{ color: "#8A8478" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Subscriptions Tab ──────────────────────────────── */
function SubscriptionsTab({ subs }: { subs: Novel[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs mb-4" style={{ color: "#8A8478" }}>
        구독 중인 소설 {subs.length}편
      </p>
      {subs.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: "#8A8478" }}>
          구독 중인 소설이 없습니다.
        </p>
      ) : subs.map((sub) => (
        <Link
          key={sub.id}
          href={`/novel/${sub.id}`}
          className="flex items-center gap-3 px-4 py-3 rounded-sm transition-all"
          style={{ backgroundColor: "#F5F1EB", border: "1px solid #E8E2D9" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#D4C9B8")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
        >
          <div className="shrink-0 w-8 h-11 rounded-sm" style={{ background: "linear-gradient(150deg, #E8E2D9 0%, #D4C9B8 100%)", border: "1px solid #E8E2D9" }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate mb-0.5" style={{ fontFamily: "'Noto Serif KR', serif", color: "#1A1814" }}>
              {sub.title}
            </p>
            <p className="text-[11px]" style={{ color: "#8A8478" }}>
              {sub.author_name} · {sub.latest_chapter ? `${sub.latest_chapter}화` : `${sub.chapter_count}화`}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "#8A8478" }} />
        </Link>
      ))}
    </div>
  );
}

/* ─── Notifications Tab ──────────────────────────────── */
function NotificationsTab() {
  const [settings, setSettings] = useState({
    new_chapter: true, comments: false, announcements: true, marketing: false,
  });

  const ITEMS = [
    { key: "new_chapter"   as const, label: "새 화 알림",     desc: "구독 소설에 새 화가 올라오면 알림을 받습니다" },
    { key: "comments"      as const, label: "댓글 알림",      desc: "내 소설에 댓글이 달리면 알림을 받습니다" },
    { key: "announcements" as const, label: "공지사항",        desc: "서비스 공지사항을 알림으로 받습니다" },
    { key: "marketing"     as const, label: "이벤트/마케팅",   desc: "이벤트 및 프로모션 정보를 받습니다" },
  ];

  return (
    <div className="space-y-2">
      {ITEMS.map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between px-4 py-3.5 rounded-sm"
          style={{ backgroundColor: "#F5F1EB", border: "1px solid #E8E2D9" }}
        >
          <div>
            <p className="text-sm font-medium mb-0.5" style={{ color: "#1A1814" }}>{item.label}</p>
            <p className="text-[11px]" style={{ color: "#8A8478" }}>{item.desc}</p>
          </div>
          <button
            onClick={() => setSettings((s) => ({ ...s, [item.key]: !s[item.key] }))}
            className="relative shrink-0 w-10 h-5 rounded-full transition-all"
            style={{ backgroundColor: settings[item.key] ? "rgba(212,75,32,0.6)" : "#E8E2D9" }}
            aria-checked={settings[item.key]}
            role="switch"
          >
            <span
              className="absolute top-0.5 h-4 w-4 rounded-full transition-transform"
              style={{
                backgroundColor: settings[item.key] ? "#D44B20" : "#8A8478",
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
function AccountTab({ userEmail }: { userEmail: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-sm overflow-hidden" style={{ border: "1px solid #E8E2D9" }}>
        <div className="px-4 py-2 border-b" style={{ borderColor: "#E8E2D9", backgroundColor: "#F5F1EB" }}>
          <p className="text-[9px] font-semibold tracking-[0.14em] uppercase" style={{ color: "#8A8478" }}>계정 정보</p>
        </div>
        <div style={{ backgroundColor: "#FDFBF7" }}>
          <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: "#E8E2D9" }}>
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: "#6B6560" }}>이메일</p>
              <p className="text-sm" style={{ color: "#1A1814" }}>{userEmail}</p>
            </div>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: "#6B6560" }}>비밀번호</p>
              <p className="text-sm" style={{ color: "#8A8478" }}>••••••••••</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 w-full px-4 py-3 text-sm rounded-sm transition-all"
        style={{ border: "1px solid rgba(192,84,74,0.15)", backgroundColor: "rgba(192,84,74,0.04)", color: "#C0544A" }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(192,84,74,0.08)"; e.currentTarget.style.borderColor = "rgba(192,84,74,0.25)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(192,84,74,0.04)"; e.currentTarget.style.borderColor = "rgba(192,84,74,0.15)"; }}
      >
        <LogOut className="h-4 w-4" />
        로그아웃
      </button>

      <div className="rounded-sm overflow-hidden" style={{ border: "1px solid #E8E2D9" }}>
        <div className="px-4 py-2 border-b" style={{ borderColor: "#E8E2D9", backgroundColor: "#F5F1EB" }}>
          <p className="text-[9px] font-semibold tracking-[0.14em] uppercase" style={{ color: "#8A8478" }}>위험 구역</p>
        </div>
        <div className="px-4 py-3" style={{ backgroundColor: "#FDFBF7" }}>
          <p className="text-xs mb-3" style={{ color: "#8A8478" }}>
            계정을 삭제하면 모든 소설과 데이터가 영구적으로 삭제됩니다.
          </p>
          <button
            className="text-xs h-7 px-3 rounded-sm transition-all"
            style={{ border: "1px solid #E8E2D9", color: "#8A8478" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(192,84,74,0.25)"; e.currentTarget.style.color = "#C0544A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E8E2D9"; e.currentTarget.style.color = "#8A8478"; }}
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
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile,   setProfile]   = useState<Profile | null>(null);
  const [novels,    setNovels]    = useState<Novel[]>([]);
  const [subs,      setSubs]      = useState<Novel[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login?redirect=/mypage"); return; }

    Promise.all([
      usersApi.me(),
      novelsApi.mine(),
      usersApi.subscriptions(),
    ]).then(([profileRes, novelsRes, subsRes]) => {
      setProfile(profileRes.data);
      setNovels(novelsRes.data);
      setSubs(subsRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading || !profile) {
    return (
      <>
        <Header />
        <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-7 rounded-sm w-32" style={{ backgroundColor: "#EDE8E0" }} />
            <div className="h-40 rounded-sm" style={{ backgroundColor: "#F5F1EB" }} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  const tabContent: Record<Tab, React.ReactNode> = {
    profile:       <ProfileTab profile={profile} novels={novels} userEmail={user.email ?? ""} onUpdated={setProfile} />,
    subscriptions: <SubscriptionsTab subs={subs} />,
    notifications: <NotificationsTab />,
    account:       <AccountTab userEmail={user.email ?? ""} />,
  };

  return (
    <>
      <Header />
      <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1
            className="text-xl font-bold"
            style={{ fontFamily: "'Cormorant', Georgia, serif", color: "#1A1814", fontSize: "1.5rem" }}
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
                    backgroundColor: activeTab === tab.key ? "rgba(212,75,32,0.06)"       : "transparent",
                    border:          activeTab === tab.key ? "1px solid rgba(212,75,32,0.15)" : "1px solid transparent",
                    color:           activeTab === tab.key ? "#D44B20" : "#6B6560",
                    fontWeight:      activeTab === tab.key ? 500 : 400,
                  }}
                >
                  <span style={{ color: activeTab === tab.key ? "#D44B20" : "#8A8478" }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Tab content */}
          <div className="flex-1 min-w-0">
            {tabContent[activeTab]}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError("아이디는 영문 소문자, 숫자, 밑줄(_)로 3~20자여야 합니다.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setError("이미 사용 중인 이메일입니다.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm text-center">
            <div
              className="rounded-sm p-8"
              style={{ border: "1px solid rgba(45,122,58,0.15)", backgroundColor: "rgba(45,122,58,0.03)" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(45,122,58,0.06)", border: "1px solid rgba(45,122,58,0.15)" }}
              >
                <span style={{ color: "#2D7A3A", fontSize: "1.25rem" }}>✓</span>
              </div>
              <h2
                className="text-lg font-bold mb-2"
                style={{ fontFamily: "'Cormorant', Georgia, serif", color: "#1A1814" }}
              >
                가입 완료
              </h2>
              <p className="text-sm mb-6" style={{ color: "#6B6560" }}>
                {email}로 인증 메일을 발송했습니다.<br />
                메일을 확인 후 로그인해 주세요.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center h-9 px-6 text-sm font-medium rounded-sm transition-colors"
                style={{ backgroundColor: "#D44B20", color: "#FFFFFF" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8401A")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D44B20")}
              >
                로그인하기
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "'Cormorant', Georgia, serif", color: "#1A1814", fontSize: "1.75rem" }}
            >
              회원가입
            </h1>
            <p className="text-sm" style={{ color: "#8A8478" }}>
              당신의 이야기를 시작하세요
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSignup}
            className="rounded-sm overflow-hidden"
            style={{ border: "1px solid #E8E2D9", backgroundColor: "#FFFFFF" }}
          >
            <div className="p-6 space-y-4">
              {/* Username */}
              <div>
                <label
                  className="block text-[10px] font-semibold tracking-[0.14em] uppercase mb-1.5"
                  style={{ color: "#8A8478" }}
                >
                  아이디
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  required
                  autoComplete="username"
                  placeholder="영문 소문자, 숫자, _ (3~20자)"
                  className="w-full h-9 px-3 text-sm rounded-sm outline-none transition-all"
                  style={{
                    backgroundColor: "#FDFBF7",
                    border: "1px solid #E8E2D9",
                    color: "#1A1814",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.35)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-[10px] font-semibold tracking-[0.14em] uppercase mb-1.5"
                  style={{ color: "#8A8478" }}
                >
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="w-full h-9 px-3 text-sm rounded-sm outline-none transition-all"
                  style={{
                    backgroundColor: "#FDFBF7",
                    border: "1px solid #E8E2D9",
                    color: "#1A1814",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.35)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-[10px] font-semibold tracking-[0.14em] uppercase mb-1.5"
                  style={{ color: "#8A8478" }}
                >
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="8자 이상"
                  className="w-full h-9 px-3 text-sm rounded-sm outline-none transition-all"
                  style={{
                    backgroundColor: "#FDFBF7",
                    border: "1px solid #E8E2D9",
                    color: "#1A1814",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,75,32,0.35)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E2D9")}
                />
              </div>

              {/* Error */}
              {error && (
                <p
                  className="text-xs px-3 py-2 rounded-sm"
                  style={{
                    backgroundColor: "rgba(192,84,74,0.05)",
                    border: "1px solid rgba(192,84,74,0.15)",
                    color: "#C0544A",
                  }}
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-9 text-sm font-medium rounded-sm transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#D44B20", color: "#FFFFFF" }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#B8401A"; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#D44B20"; }}
              >
                {loading ? "가입 중..." : "가입하기"}
              </button>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 border-t text-center text-xs"
              style={{ borderColor: "#E8E2D9", color: "#8A8478" }}
            >
              이미 계정이 있으신가요?{" "}
              <Link
                href="/login"
                className="transition-colors"
                style={{ color: "#D44B20" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#B8401A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#D44B20")}
              >
                로그인
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

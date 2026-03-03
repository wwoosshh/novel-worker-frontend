"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

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
              로그인
            </h1>
            <p className="text-sm" style={{ color: "#8A8478" }}>
              Novel Worker에 오신 것을 환영합니다
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="rounded-sm overflow-hidden"
            style={{ border: "1px solid #E8E2D9", backgroundColor: "#FFFFFF" }}
          >
            <div className="p-6 space-y-4">
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
                  autoComplete="current-password"
                  placeholder="••••••••"
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
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 border-t text-center text-xs"
              style={{ borderColor: "#E8E2D9", color: "#8A8478" }}
            >
              계정이 없으신가요?{" "}
              <Link
                href="/signup"
                className="transition-colors"
                style={{ color: "#D44B20" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#B8401A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#D44B20")}
              >
                회원가입
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

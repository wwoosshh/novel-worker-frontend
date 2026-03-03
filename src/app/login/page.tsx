"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function LoginPage() {
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
              style={{ fontFamily: "'Libre Baskerville', Georgia, serif", color: "#EDE8DC" }}
            >
              로그인
            </h1>
            <p className="text-sm" style={{ color: "#5A544A" }}>
              Novel Worker에 오신 것을 환영합니다
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="rounded-sm overflow-hidden"
            style={{ border: "1px solid #302B22", backgroundColor: "#0C0A08" }}
          >
            <div className="p-6 space-y-4">
              {/* Email */}
              <div>
                <label
                  className="block text-[10px] font-semibold tracking-[0.14em] uppercase mb-1.5"
                  style={{ color: "#5A544A" }}
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
                    backgroundColor: "#141210",
                    border: "1px solid #302B22",
                    color: "#EDE8DC",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(191,151,66,0.4)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#302B22")}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-[10px] font-semibold tracking-[0.14em] uppercase mb-1.5"
                  style={{ color: "#5A544A" }}
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
                    backgroundColor: "#141210",
                    border: "1px solid #302B22",
                    color: "#EDE8DC",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(191,151,66,0.4)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#302B22")}
                />
              </div>

              {/* Error */}
              {error && (
                <p
                  className="text-xs px-3 py-2 rounded-sm"
                  style={{
                    backgroundColor: "rgba(192,84,74,0.08)",
                    border: "1px solid rgba(192,84,74,0.2)",
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
                style={{ backgroundColor: "#BF9742", color: "#0C0A08" }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#D4AF5F"; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#BF9742"; }}
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 border-t text-center text-xs"
              style={{ borderColor: "#302B22", color: "#5A544A" }}
            >
              계정이 없으신가요?{" "}
              <Link
                href="/signup"
                className="transition-colors"
                style={{ color: "#BF9742" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#D4AF5F")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#BF9742")}
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

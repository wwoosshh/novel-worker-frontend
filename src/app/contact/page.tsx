"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Mail, MessageCircle, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-10">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ fontFamily: "'Cormorant', 'Noto Serif KR', Georgia, serif", color: "#1A1814" }}
        >
          문의하기
        </h1>
        <p className="text-sm mb-8" style={{ color: "#8A8478" }}>
          NovelWorker 이용 중 궁금한 점이나 불편사항이 있으시면 아래 방법으로 문의해 주세요.
        </p>

        <div className="space-y-4">
          <div
            className="flex items-start gap-4 p-5 rounded-sm"
            style={{ backgroundColor: "#F5F1EB", border: "1px solid #E8E2D9" }}
          >
            <Mail className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#D44B20" }} />
            <div>
              <h2
                className="text-sm font-semibold mb-1"
                style={{ fontFamily: "'Noto Serif KR', serif", color: "#1A1814" }}
              >
                이메일 문의
              </h2>
              <p className="text-sm mb-2" style={{ color: "#6B6560" }}>
                일반 문의, 버그 신고, 제휴 제안 등 모든 문의를 받고 있습니다.
              </p>
              <a
                href="mailto:support@novelworker.com"
                className="text-sm font-medium transition-colors"
                style={{ color: "#D44B20" }}
              >
                support@novelworker.com
              </a>
            </div>
          </div>

          <div
            className="flex items-start gap-4 p-5 rounded-sm"
            style={{ backgroundColor: "#F5F1EB", border: "1px solid #E8E2D9" }}
          >
            <MessageCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#D44B20" }} />
            <div>
              <h2
                className="text-sm font-semibold mb-1"
                style={{ fontFamily: "'Noto Serif KR', serif", color: "#1A1814" }}
              >
                신고 및 권리 침해
              </h2>
              <p className="text-sm mb-2" style={{ color: "#6B6560" }}>
                저작권 침해, 불법 콘텐츠, 이용자 신고 등은 아래 이메일로 접수해 주세요.
                신고 시 관련 URL과 구체적인 내용을 함께 보내주시면 빠르게 처리됩니다.
              </p>
              <a
                href="mailto:report@novelworker.com"
                className="text-sm font-medium transition-colors"
                style={{ color: "#D44B20" }}
              >
                report@novelworker.com
              </a>
            </div>
          </div>

          <div
            className="flex items-start gap-4 p-5 rounded-sm"
            style={{ backgroundColor: "#F5F1EB", border: "1px solid #E8E2D9" }}
          >
            <Clock className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#D44B20" }} />
            <div>
              <h2
                className="text-sm font-semibold mb-1"
                style={{ fontFamily: "'Noto Serif KR', serif", color: "#1A1814" }}
              >
                응답 안내
              </h2>
              <p className="text-sm" style={{ color: "#6B6560" }}>
                문의 접수 후 영업일 기준 1~2일 이내에 답변드리고 있습니다.
                주말 및 공휴일에는 응답이 지연될 수 있으니 양해 부탁드립니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6" style={{ borderTop: "1px solid #E8E2D9" }}>
          <h2
            className="text-sm font-semibold mb-3"
            style={{ fontFamily: "'Noto Serif KR', serif", color: "#1A1814" }}
          >
            자주 묻는 질문
          </h2>
          <div className="space-y-3">
            {[
              { q: "회원 탈퇴는 어떻게 하나요?", a: "마이페이지 > 프로필 설정에서 탈퇴를 진행할 수 있습니다." },
              { q: "연재한 소설을 삭제하고 싶어요.", a: "연재 관리 > 소설 설정에서 소설 삭제가 가능합니다. 삭제된 소설은 복구할 수 없습니다." },
              { q: "비밀번호를 잊어버렸어요.", a: "로그인 페이지에서 '비밀번호 찾기'를 통해 재설정할 수 있습니다." },
              { q: "다른 작가의 작품이 제 저작물을 침해하고 있어요.", a: "report@novelworker.com으로 해당 작품 URL과 원본 증거를 함께 보내주세요." },
            ].map((faq) => (
              <div key={faq.q}>
                <p className="text-sm font-medium" style={{ color: "#1A1814" }}>
                  Q. {faq.q}
                </p>
                <p className="text-sm mt-0.5" style={{ color: "#6B6560" }}>
                  A. {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

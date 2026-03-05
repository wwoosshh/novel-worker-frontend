"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-10">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ fontFamily: "'Cormorant', 'Noto Serif KR', Georgia, serif", color: "#1A1814" }}
        >
          개인정보처리방침
        </h1>
        <p className="text-xs mb-8" style={{ color: "#8A8478" }}>
          최종 수정일: 2026년 3월 1일
        </p>

        <div className="space-y-8" style={{ color: "#6B6560" }}>
          <Section title="1. 수집하는 개인정보 항목">
            <p className="mb-2">NovelWorker(이하 &quot;서비스&quot;)는 회원가입 및 서비스 이용을 위해 아래 항목을 수집합니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: "#1A1814" }}>필수 항목</strong>: 이메일 주소, 비밀번호, 닉네임(표시 이름)</li>
              <li><strong style={{ color: "#1A1814" }}>자동 수집</strong>: 서비스 이용 기록, 접속 로그, IP 주소, 브라우저 정보</li>
            </ul>
          </Section>

          <Section title="2. 개인정보 수집·이용 목적">
            <ul className="list-disc pl-5 space-y-1">
              <li>회원 식별 및 가입 의사 확인</li>
              <li>서비스 제공 및 이용자 맞춤 콘텐츠 제공</li>
              <li>서비스 개선, 통계 분석</li>
              <li>불법·부정 이용 방지</li>
              <li>고지사항 전달 및 민원 처리</li>
            </ul>
          </Section>

          <Section title="3. 개인정보 보유 및 이용 기간">
            <p className="mb-2">
              회원 탈퇴 시 지체 없이 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
              <li>소비자 불만 또는 분쟁 처리에 관한 기록: 3년</li>
              <li>웹사이트 방문 기록: 3개월</li>
            </ul>
          </Section>

          <Section title="4. 개인정보의 제3자 제공">
            서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우 예외로 합니다.
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령에 의하거나 수사 기관의 요청이 있는 경우</li>
            </ul>
          </Section>

          <Section title="5. 개인정보의 파기 절차 및 방법">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: "#1A1814" }}>전자적 파일</strong>: 복구 불가능한 방법으로 영구 삭제</li>
              <li><strong style={{ color: "#1A1814" }}>종이 문서</strong>: 분쇄기로 분쇄하거나 소각</li>
            </ul>
          </Section>

          <Section title="6. 개인정보 보호를 위한 기술적·관리적 대책">
            <ul className="list-disc pl-5 space-y-1">
              <li>비밀번호 암호화 저장 (bcrypt/argon2)</li>
              <li>SSL/TLS 암호화 통신</li>
              <li>접근 권한 최소화 및 정기적 보안 점검</li>
              <li>개인정보 취급 담당자 최소화</li>
            </ul>
          </Section>

          <Section title="7. 쿠키(Cookie) 사용">
            서비스는 로그인 세션 유지 및 사용자 인증을 위해 쿠키를 사용합니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.
          </Section>

          <Section title="8. 이용자의 권리">
            <ul className="list-disc pl-5 space-y-1">
              <li>이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있습니다.</li>
              <li>회원 탈퇴를 통해 개인정보 처리 정지를 요청할 수 있습니다.</li>
              <li>개인정보 관련 문의는 아래 연락처를 통해 접수할 수 있습니다.</li>
            </ul>
          </Section>

          <Section title="9. 개인정보 보호 책임자">
            <div
              className="rounded-sm p-4 mt-2"
              style={{ backgroundColor: "#F5F1EB", border: "1px solid #E8E2D9" }}
            >
              <p className="text-sm"><strong style={{ color: "#1A1814" }}>담당</strong>: NovelWorker 운영팀</p>
              <p className="text-sm"><strong style={{ color: "#1A1814" }}>이메일</strong>: nunconnect1@gmail.com</p>
            </div>
          </Section>

          <Section title="10. 개정 이력">
            본 개인정보처리방침은 2026년 3월 1일부터 시행됩니다.
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="text-base font-semibold mb-2"
        style={{ fontFamily: "'Noto Serif KR', serif", color: "#1A1814" }}
      >
        {title}
      </h2>
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}

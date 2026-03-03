"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-10">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ fontFamily: "'Cormorant', 'Noto Serif KR', Georgia, serif", color: "#1A1814" }}
        >
          이용약관
        </h1>
        <p className="text-xs mb-8" style={{ color: "#8A8478" }}>
          최종 수정일: 2026년 3월 1일
        </p>

        <div className="space-y-8" style={{ color: "#6B6560" }}>
          <Section title="제1조 (목적)">
            본 약관은 NovelWorker(이하 &quot;서비스&quot;)가 제공하는 웹소설 창작 및 열람 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
          </Section>

          <Section title="제2조 (정의)">
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>&quot;서비스&quot;란 NovelWorker가 제공하는 웹소설 창작, 연재, 열람 및 관련 부가 서비스를 의미합니다.</li>
              <li>&quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
              <li>&quot;회원&quot;이란 서비스에 가입하여 이용자 계정을 부여받은 자를 말합니다.</li>
              <li>&quot;작가&quot;란 서비스를 통해 창작물을 등록·연재하는 회원을 말합니다.</li>
              <li>&quot;콘텐츠&quot;란 회원이 서비스에 게시한 소설, 공지사항, 설정 자료 등 일체의 정보를 말합니다.</li>
            </ol>
          </Section>

          <Section title="제3조 (약관의 효력 및 변경)">
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>본 약관은 서비스 화면에 게시하거나 기타 방법으로 공지함으로써 효력이 발생합니다.</li>
              <li>서비스는 관련 법령에 위배되지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일 7일 전부터 공지합니다.</li>
              <li>변경된 약관에 동의하지 않는 회원은 탈퇴할 수 있으며, 계속 이용 시 동의한 것으로 간주합니다.</li>
            </ol>
          </Section>

          <Section title="제4조 (회원가입 및 계정)">
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>이용자는 서비스가 정한 양식에 따라 회원 정보를 기입하고 약관에 동의함으로써 회원가입을 신청합니다.</li>
              <li>회원은 자신의 계정 정보를 정확하게 유지해야 하며, 관리 소홀로 인한 불이익은 회원 본인이 부담합니다.</li>
              <li>회원은 타인의 계정을 사용하거나 양도할 수 없습니다.</li>
            </ol>
          </Section>

          <Section title="제5조 (서비스 이용)">
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>서비스는 연중무휴 24시간 제공을 원칙으로 하되, 시스템 점검 등의 사유로 일시 중단될 수 있습니다.</li>
              <li>서비스는 무료로 제공되며, 향후 유료 서비스가 추가될 경우 별도로 안내합니다.</li>
              <li>이용자는 서비스를 통해 얻은 정보를 서비스의 사전 동의 없이 상업적으로 이용할 수 없습니다.</li>
            </ol>
          </Section>

          <Section title="제6조 (콘텐츠의 권리와 책임)">
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>작가가 게시한 콘텐츠의 저작권은 해당 작가에게 귀속됩니다.</li>
              <li>서비스는 콘텐츠를 서비스 내에서 노출, 배포, 프로모션 목적으로 사용할 수 있는 이용 허락을 가집니다.</li>
              <li>이용자는 타인의 저작권, 상표권 등 지식재산권을 침해하는 행위를 해서는 안 됩니다.</li>
              <li>법령에 위반되거나 공공질서·미풍양속에 반하는 콘텐츠는 사전 통보 없이 삭제될 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제7조 (이용 제한)">
            서비스는 다음 각 호에 해당하는 경우 이용을 제한하거나 계정을 해지할 수 있습니다.
            <ol className="list-decimal pl-5 space-y-1.5 mt-2">
              <li>타인의 정보를 도용하거나 허위 정보를 기재한 경우</li>
              <li>서비스의 운영을 방해하거나 안정성을 저해하는 행위를 한 경우</li>
              <li>법령 또는 본 약관을 위반한 경우</li>
              <li>기타 서비스가 합리적으로 판단하여 필요하다고 인정하는 경우</li>
            </ol>
          </Section>

          <Section title="제8조 (면책 조항)">
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>서비스는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
              <li>이용자 간 또는 이용자와 제3자 간에 서비스를 매개로 발생한 분쟁에 대해 서비스는 개입 의무를 지지 않습니다.</li>
            </ol>
          </Section>

          <Section title="제9조 (준거법 및 관할)">
            본 약관에 관한 분쟁은 대한민국 법령을 준거법으로 하며, 서울중앙지방법원을 전속적 합의 관할 법원으로 합니다.
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

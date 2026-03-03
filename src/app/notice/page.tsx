"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Megaphone } from "lucide-react";

const NOTICES = [
  {
    id: 1,
    date: "2026.03.01",
    title: "NovelWorker 서비스 오픈 안내",
    content:
      "안녕하세요, NovelWorker입니다.\n\nNovelWorker는 작가를 위한 웹소설 창작 플랫폼으로, 누구나 자유롭게 소설을 연재하고 독자와 소통할 수 있는 공간입니다.\n\n주요 기능:\n• 웹 기반 소설 에디터 (서식, 장면전환 등 지원)\n• 챕터 관리 및 공개/비공개 설정\n• 설정 DB (인물, 지역, 세력, 아이템) 관리\n• 매크로를 통한 반복 문구 자동 삽입\n• 독자 구독 및 공지사항 기능\n\n앞으로도 작가 여러분의 창작 활동을 지원하기 위해 지속적으로 기능을 개선해 나가겠습니다.\n\n감사합니다.",
  },
];

export default function NoticePage() {
  return (
    <>
      <Header />
      <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-10">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ fontFamily: "'Cormorant', 'Noto Serif KR', Georgia, serif", color: "#1A1814" }}
        >
          공지사항
        </h1>
        <p className="text-sm mb-8" style={{ color: "#8A8478" }}>
          NovelWorker 서비스 관련 안내사항을 알려드립니다.
        </p>

        <div className="space-y-4">
          {NOTICES.map((notice) => (
            <article
              key={notice.id}
              className="rounded-sm overflow-hidden"
              style={{ border: "1px solid #E8E2D9" }}
            >
              <div
                className="flex items-center gap-3 px-5 py-3"
                style={{ backgroundColor: "#F5F1EB", borderBottom: "1px solid #E8E2D9" }}
              >
                <Megaphone className="h-4 w-4 shrink-0" style={{ color: "#D44B20" }} />
                <h2
                  className="text-sm font-semibold flex-1"
                  style={{ fontFamily: "'Noto Serif KR', serif", color: "#1A1814" }}
                >
                  {notice.title}
                </h2>
                <span className="text-[10px] shrink-0" style={{ color: "#8A8478" }}>
                  {notice.date}
                </span>
              </div>
              <div className="px-5 py-4">
                <p
                  className="text-sm leading-relaxed whitespace-pre-line"
                  style={{ color: "#6B6560" }}
                >
                  {notice.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

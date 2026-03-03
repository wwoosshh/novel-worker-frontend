import type { Metadata } from "next";
import { DM_Sans, Libre_Baskerville, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const notoSerifKR = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NovelWorker — 작가를 위한 창작 플랫폼",
    template: "%s | NovelWorker",
  },
  description:
    "작가에게 최적화된 창작 환경과 연재 플랫폼. 설정 DB, 스마트 편집기, 독자와의 연결.",
  keywords: ["소설", "웹소설", "연재", "작가", "창작", "판타지", "로맨스"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={cn(
          dmSans.variable,
          libreBaskerville.variable,
          notoSerifKR.variable,
          "antialiased min-h-screen bg-[#0C0A08] text-[#EDE8DC]"
        )}
      >
        {children}
      </body>
    </html>
  );
}

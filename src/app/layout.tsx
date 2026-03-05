import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cormorant, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
          plusJakartaSans.variable,
          cormorant.variable,
          notoSerifKR.variable,
          "antialiased min-h-screen bg-[#FDFBF7] text-[#1A1814]"
        )}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}

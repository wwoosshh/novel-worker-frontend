"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface NovelCardData {
  id: string;
  title: string;
  author_name: string;
  cover_url: string | null;
  genre: string;
  status: "ongoing" | "completed" | "hiatus";
  chapter_count: number;
  view_count: number;
  latest_chapter?: number;
}

const STATUS_CONFIG = {
  ongoing:   { label: "연재중",  color: "#58A064", bg: "rgba(88,160,100,0.12)" },
  completed: { label: "완결",    color: "#6B9FD4", bg: "rgba(107,159,212,0.12)" },
  hiatus:    { label: "휴재",    color: "#C0954A", bg: "rgba(192,149,74,0.12)" },
};

const PLACEHOLDER_GRADIENTS = [
  "cover-gradient-1",
  "cover-gradient-2",
  "cover-gradient-3",
  "cover-gradient-4",
  "cover-gradient-5",
];

function getPlaceholderGradient(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return PLACEHOLDER_GRADIENTS[Math.abs(hash) % PLACEHOLDER_GRADIENTS.length];
}

interface NovelCardProps {
  novel: NovelCardData;
  className?: string;
  priority?: boolean;
}

export function NovelCard({ novel, className, priority }: NovelCardProps) {
  const status = STATUS_CONFIG[novel.status] ?? STATUS_CONFIG.ongoing;
  const gradientClass = getPlaceholderGradient(novel.id);

  return (
    <Link
      href={`/novel/${novel.id}`}
      className={cn("group block", className)}
    >
      {/* Cover */}
      <div
        className="relative aspect-[3/4] rounded-sm overflow-hidden mb-2"
        style={{ border: "1px solid #302B22" }}
      >
        {novel.cover_url ? (
          <Image
            src={novel.cover_url}
            alt={novel.title}
            fill
            priority={priority}
            sizes="(max-width:640px) 33vw,(max-width:1024px) 20vw,12vw"
            className="object-cover transition-transform duration-400 group-hover:scale-105"
          />
        ) : (
          <div
            className={cn("w-full h-full flex items-end p-2", gradientClass)}
          >
            <span
              className="text-[11px] leading-tight font-medium line-clamp-3 w-full"
              style={{
                fontFamily: "'Noto Serif KR', serif",
                color: "rgba(237,232,220,0.6)",
              }}
            >
              {novel.title}
            </span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-1.5 left-1.5">
          <span
            className="text-[9px] font-medium px-1.5 py-0.5 rounded-sm"
            style={{
              color: status.color,
              backgroundColor: status.bg,
              backdropFilter: "blur(4px)",
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to top, rgba(191,151,66,0.15) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <h3
          className="text-xs font-medium line-clamp-2 leading-snug transition-colors"
          style={{
            fontFamily: "'Noto Serif KR', serif",
            color: "#EDE8DC",
          }}
        >
          {novel.title}
        </h3>
        <p
          className="text-[10px]"
          style={{ color: "#5A544A" }}
        >
          {novel.author_name}
          {novel.latest_chapter && (
            <span className="ml-1" style={{ color: "#5A544A" }}>
              · {novel.latest_chapter}화
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}

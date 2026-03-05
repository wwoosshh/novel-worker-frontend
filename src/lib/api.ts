import { createClient } from "@/lib/supabase/client";
import type { MacroAction } from "@/lib/macroTypes";

const BASE = process.env.NEXT_PUBLIC_API_URL!;

async function getToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const isWrite = init?.method && init.method !== "GET";
  const maxRetries = isWrite ? 0 : 2;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${BASE}${path}`, {
        ...init,
        signal: init?.signal ?? controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init?.headers ?? {}),
        },
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        const err = new Error(body?.error ?? res.statusText);
        // Don't retry 4xx client errors
        if (res.status >= 400 && res.status < 500) throw err;
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
          continue;
        }
        throw err;
      }

      return res.json() as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError.name === "AbortError") {
        throw new Error("요청 시간이 초과되었습니다.");
      }
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error("요청에 실패했습니다.");
}

/* ─── Types ─────────────────────────────────────────── */

export interface Novel {
  id: string;
  title: string;
  cover_url: string | null;
  genre: string;
  tags: string[];
  status: "ongoing" | "completed" | "hiatus";
  chapter_count: number;
  view_count: number;
  author_name: string;
  author_username: string;
  author_donation_link?: string | null;
  author_donation_label?: string | null;
  latest_chapter: number | null;
  synopsis?: string;
  is_public?: boolean;
  subscriber_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  donation_link: string | null;
  donation_label: string | null;
  notification_settings: Record<string, boolean> | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  chapter_id: string;
  author_id: string;
  content: string;
  author_name: string;
  author_username: string;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  novel_id: string;
  number: number;
  title: string;
  content: Record<string, unknown>;
  content_text: string | null;
  is_public: boolean;
  is_paid: boolean;
  scheduled_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  novel_title?: string;
  novel_chapter_count?: number;
  author_name?: string;
  author_donation_link?: string | null;
  author_donation_label?: string | null;
}

export interface Macro {
  id: string;
  novel_id: string;
  label: string;
  content: string;
  shortcut?: string;
  actions?: MacroAction[] | null;
  created_at: string;
}

export interface DbEntry {
  id: string;
  novel_id: string;
  name: string;
  fields: Record<string, string>;
  created_at: string;
}

/* ─── Novels API ─────────────────────────────────────── */

export interface NovelsParams {
  sort?: "popular" | "latest" | "updated";
  genre?: string;
  status?: "ongoing" | "completed" | "hiatus";
  q?: string;
  limit?: number;
  offset?: number;
}

export const novelsApi = {
  list(params?: NovelsParams) {
    const qs = new URLSearchParams();
    if (params?.sort)   qs.set("sort",   params.sort);
    if (params?.genre)  qs.set("genre",  params.genre);
    if (params?.status) qs.set("status", params.status);
    if (params?.q)      qs.set("q",      params.q);
    if (params?.limit)  qs.set("limit",  String(params.limit));
    if (params?.offset) qs.set("offset", String(params.offset));
    const query = qs.toString();
    return apiFetch<{ data: Novel[]; total: number }>(`/api/novels${query ? `?${query}` : ""}`);
  },

  get(id: string) {
    return apiFetch<{ data: Novel }>(`/api/novels/${id}`);
  },

  mine() {
    return apiFetch<{ data: Novel[] }>(`/api/novels/me/list`);
  },

  create(data: { title: string; synopsis?: string; genre: string; tags?: string[] }) {
    return apiFetch<{ data: Novel }>(`/api/novels`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Partial<Pick<Novel, "title" | "synopsis" | "genre" | "tags" | "status" | "cover_url" | "is_public">>) {
    return apiFetch<{ data: Novel }>(`/api/novels/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return apiFetch<{ message: string }>(`/api/novels/${id}`, { method: "DELETE" });
  },
};

/* ─── Chapters API ───────────────────────────────────── */

export const chaptersApi = {
  list(novelId: string) {
    return apiFetch<{ data: Chapter[] }>(`/api/novels/${novelId}/chapters`);
  },

  get(novelId: string, number: number) {
    return apiFetch<{ data: Chapter }>(`/api/novels/${novelId}/chapters/${number}`);
  },

  create(novelId: string) {
    return apiFetch<{ data: Chapter }>(`/api/novels/${novelId}/chapters`, { method: "POST" });
  },

  save(novelId: string, id: string, data: { title: string; content: Record<string, unknown>; content_text?: string; is_public: boolean; scheduled_at?: string | null }) {
    return apiFetch<{ data: Chapter }>(`/api/novels/${novelId}/chapters/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(novelId: string, id: string) {
    return apiFetch<{ message: string }>(`/api/novels/${novelId}/chapters/${id}`, { method: "DELETE" });
  },
};

/* ─── Settings DB API ────────────────────────────────── */

type DbType = "characters" | "locations" | "factions" | "items";

export const settingsApi = {
  list(novelId: string, type: DbType) {
    return apiFetch<{ data: DbEntry[] }>(`/api/novels/${novelId}/settings/${type}`);
  },

  create(novelId: string, type: DbType, data: { name: string; fields?: Record<string, string> }) {
    return apiFetch<{ data: DbEntry }>(`/api/novels/${novelId}/settings/${type}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(novelId: string, type: DbType, id: string, data: { name: string; fields?: Record<string, string> }) {
    return apiFetch<{ data: DbEntry }>(`/api/novels/${novelId}/settings/${type}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(novelId: string, type: DbType, id: string) {
    return apiFetch<{ message: string }>(`/api/novels/${novelId}/settings/${type}/${id}`, { method: "DELETE" });
  },
};

/* ─── Macros API ─────────────────────────────────────── */

export const macrosApi = {
  list(novelId: string) {
    return apiFetch<{ data: Macro[] }>(`/api/novels/${novelId}/macros`);
  },

  create(novelId: string, data: { label: string; content?: string; shortcut?: string; actions?: MacroAction[] | null }) {
    return apiFetch<{ data: Macro }>(`/api/novels/${novelId}/macros`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(novelId: string, id: string, data: { label: string; content?: string; shortcut?: string; actions?: MacroAction[] | null }) {
    return apiFetch<{ data: Macro }>(`/api/novels/${novelId}/macros/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(novelId: string, id: string) {
    return apiFetch<{ message: string }>(`/api/novels/${novelId}/macros/${id}`, { method: "DELETE" });
  },
};

/* ─── Notices API ────────────────────────────────────── */

export interface Notice {
  id: string;
  novel_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  novel_title?: string;
}

export const noticesApi = {
  list(novelId: string) {
    return apiFetch<{ data: Notice[] }>(`/api/novels/${novelId}/notices`);
  },

  get(novelId: string, id: string) {
    return apiFetch<{ data: Notice }>(`/api/novels/${novelId}/notices/${id}`);
  },

  create(novelId: string, data: { title: string; content: string; is_pinned?: boolean }) {
    return apiFetch<{ data: Notice }>(`/api/novels/${novelId}/notices`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(novelId: string, id: string, data: { title: string; content: string; is_pinned?: boolean }) {
    return apiFetch<{ data: Notice }>(`/api/novels/${novelId}/notices/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(novelId: string, id: string) {
    return apiFetch<{ message: string }>(`/api/novels/${novelId}/notices/${id}`, { method: "DELETE" });
  },
};

/* ─── Comments API ───────────────────────────────────── */

export const commentsApi = {
  list(novelId: string, chapterId: string) {
    return apiFetch<{ data: Comment[] }>(`/api/novels/${novelId}/chapters/${chapterId}/comments`);
  },

  create(novelId: string, chapterId: string, data: { content: string }) {
    return apiFetch<{ data: Comment }>(`/api/novels/${novelId}/chapters/${chapterId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  delete(novelId: string, chapterId: string, id: string) {
    return apiFetch<{ message: string }>(`/api/novels/${novelId}/chapters/${chapterId}/comments/${id}`, {
      method: "DELETE",
    });
  },
};

/* ─── Users API ──────────────────────────────────────── */

export const usersApi = {
  me() {
    return apiFetch<{ data: Profile }>(`/api/users/me`);
  },

  updateMe(data: { display_name?: string; bio?: string; donation_link?: string | null; donation_label?: string | null; notification_settings?: Record<string, boolean> }) {
    return apiFetch<{ data: Profile }>(`/api/users/me`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  subscriptions() {
    return apiFetch<{ data: Novel[] }>(`/api/users/me/subscriptions`);
  },

  subscribe(novelId: string) {
    return apiFetch<{ message: string }>(`/api/users/me/subscriptions/${novelId}`, { method: "POST" });
  },

  unsubscribe(novelId: string) {
    return apiFetch<{ message: string }>(`/api/users/me/subscriptions/${novelId}`, { method: "DELETE" });
  },
};

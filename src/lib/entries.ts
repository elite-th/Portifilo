// src/lib/entries.ts
// ───────────────────────────────────────────────────────────────────────────
// توشه‌ی مغز — types + type guards + pure helpers + client-side fetch helpers.
//
// این فایل **client-safe** است: هیچ import از Prisma در آن نیست.
// Worker B مستقیماً از این فایل import می‌کند (type-only یا runtime).
//
// توابع server-only (دسترسی DB، validation، toEntryDTO) در
// `src/lib/entries.server.ts` هستند — API routes از آن فایل import می‌کنند.
// ───────────────────────────────────────────────────────────────────────────

// (هیچ import از Prisma در این فایل نیست — کاملاً client-safe.)

// ─── Types ──────────────────────────────────────────────────────────────────

export type EntryType = "TOSHEH" | "ARTICLE" | "POEM";

export const ENTRY_TYPES: readonly EntryType[] = [
  "TOSHEH",
  "ARTICLE",
  "POEM",
] as const;

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  TOSHEH: "توشه",
  ARTICLE: "مقاله",
  POEM: "شعر",
};

export interface EntryDTO {
  id: string;
  type: EntryType;
  title: string;
  content: string;
  excerpt: string | null;
  tags: string[];
  mood: string | null; // TOSHEH
  source: string | null; // TOSHEH
  emotion: string | null; // POEM
  dedicatedTo: string | null; // POEM
  readingTime: number | null; // ARTICLE (minutes)
  isPublished: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface StatsDTO {
  total: number;
  byType: { TOSHEH: number; ARTICLE: number; POEM: number };
  thisMonth: number;
  currentMonthLabel: string;
}

export interface EntriesListResponse {
  entries: EntryDTO[];
  stats: StatsDTO;
}

export interface EntryCreateInput {
  type: EntryType;
  title: string;
  content: string;
  excerpt?: string | null;
  tags?: string[];
  mood?: string | null;
  source?: string | null;
  emotion?: string | null;
  dedicatedTo?: string | null;
  isPublished?: boolean;
}

export type EntryUpdateInput = Partial<Omit<EntryCreateInput, "type">>;

/**
 * Structural type سازگار با Prisma `Entry` row (بدون import از @prisma/client).
 * این فایل را client-safe نگه می‌دارد. در entries.server.ts استفاده می‌شود.
 */
export interface EntryRow {
  id: string;
  type: string;
  title: string;
  content: string;
  excerpt: string | null;
  tags: string | null;
  mood: string | null;
  source: string | null;
  emotion: string | null;
  dedicatedTo: string | null;
  readingTime: number | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Type guards (pure, client-safe) ────────────────────────────────────────

export function isEntryType(value: unknown): value is EntryType {
  return (
    typeof value === "string" &&
    (value === "TOSHEH" || value === "ARTICLE" || value === "POEM")
  );
}

export function isTosheh(e: EntryDTO): boolean {
  return e.type === "TOSHEH";
}

export function isArticle(e: EntryDTO): boolean {
  return e.type === "ARTICLE";
}

export function isPoem(e: EntryDTO): boolean {
  return e.type === "POEM";
}

// ─── Pure helpers (client-safe) ─────────────────────────────────────────────

/** tags در DB به‌صورت JSON string ذخیره می‌شود. این تابع آن را به string[] برمی‌گرداند. */
export function parseTags(tagsJson: string | null | undefined): string[] {
  if (!tagsJson) return [];
  try {
    const parsed: unknown = JSON.parse(tagsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === "string");
  } catch {
    return [];
  }
}

/**
 * زمان خواندن (دقیقه) — کلمه/۲۰۰، حداقل ۱.
 * کاربرد: ARTICLE. برای TOSHEH/POEM در API محاسبه نمی‌شود (null).
 */
export function computeReadingTime(content: string): number {
  const words = content
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * excerpt از content — strip ساده‌ی markdown + first N کاراکتر.
 * `maxLen` پیش‌فرض ۱۲۰. برای متن‌های کوتاه، کل متن برمی‌گردد (بدون …).
 */
export function computeExcerpt(content: string, maxLen = 120): string {
  // strip markdown-ish: headers, emphasis, links, footnotes
  const cleaned = content
    .replace(/^#{1,6}\s+/gm, "") // headers
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/\*(.+?)\*/g, "$1") // italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // links
    .replace(/^\s*>\s+/gm, "") // blockquote
    .replace(/\[\^\d+\]/g, "") // footnote refs
    .replace(/^\[\^\d+\]:.*/gm, "") // footnote definitions
    .replace(/\n{2,}/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= maxLen) return cleaned;
  // cut on word boundary if possible
  const cut = cleaned.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  const end = lastSpace > maxLen * 0.6 ? lastSpace : maxLen;
  return `${cleaned.slice(0, end).trim()}…`;
}

// ─── Client-side fetch helpers ──────────────────────────────────────────────

/**
 * GET /api/entries?type=... → EntriesListResponse.
 * `filter: "all"` (default) → همه. در غیر این‌صورت، filter by type.
 */
export async function fetchEntries(
  filter: "all" | EntryType = "all",
): Promise<EntriesListResponse> {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("type", filter);
  const url = `/api/entries${params.size > 0 ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`fetchEntries failed: ${res.status}`);
  }
  return (await res.json()) as EntriesListResponse;
}

/** GET /api/entries/:id → EntryDTO. */
export async function fetchEntry(id: string): Promise<EntryDTO> {
  const res = await fetch(`/api/entries/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`fetchEntry failed: ${res.status}`);
  }
  return (await res.json()) as EntryDTO;
}

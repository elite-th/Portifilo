// src/lib/entries.server.ts
// ───────────────────────────────────────────────────────────────────────────
// توشه‌ی مغز — server-only helpers (Prisma + validation + DTO converter).
//
// این فایل **server-only** است: `db` (Prisma) را import می‌کند.
// Worker B هرگز نباید این فایل را import کند — وگرنه Prisma در client bundle می‌رود.
// فقط API routes از این فایل import می‌کنند.
// ───────────────────────────────────────────────────────────────────────────

import "server-only";
import { db } from "@/lib/db";
import {
  currentShamsiMonthLabel,
  isCurrentShamsiMonth,
} from "@/lib/shamsi";
import {
  computeExcerpt,
  computeReadingTime,
  ENTRY_TYPES,
  isEntryType,
  parseTags,
  type EntryCreateInput,
  type EntryDTO,
  type EntriesListResponse,
  type EntryRow,
  type EntryType,
  type EntryUpdateInput,
  type StatsDTO,
} from "@/lib/entries";

// ─── DTO converter ──────────────────────────────────────────────────────────

/**
 * Prisma row → EntryDTO. tags را parse می‌کند (با fallback به []).
 * type را به EntryType cast می‌کند (با assert قبلی در API layer).
 */
export function toEntryDTO(row: EntryRow): EntryDTO {
  return {
    id: row.id,
    type: row.type as EntryType,
    title: row.title,
    content: row.content,
    excerpt: row.excerpt,
    tags: parseTags(row.tags),
    mood: row.mood,
    source: row.source,
    emotion: row.emotion,
    dedicatedTo: row.dedicatedTo,
    readingTime: row.readingTime,
    isPublished: row.isPublished,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ─── DB helpers ─────────────────────────────────────────────────────────────

/**
 * گرفتن entries از DB با فیلتر اختیاری type + محاسبه‌ی stats.
 * stats فیلتر نمی‌شود (کل DB) — طبق §۰.۳ نقشه راه.
 * ترتیب: createdAt DESC.
 */
export async function getEntriesFromDb(
  type: EntryType | null,
): Promise<EntriesListResponse> {
  const where = type ? { type } : {};
  const [rows, totalCount, byTypeRows, allDates] = await Promise.all([
    db.entry.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    db.entry.count(),
    db.entry.groupBy({
      by: ["type"],
      _count: true,
    }),
    // fetch all createdAt و count در ماه جاری شمسی (SQLite cannot do this natively)
    db.entry.findMany({ select: { createdAt: true } }),
  ]);

  const byType: StatsDTO["byType"] = { TOSHEH: 0, ARTICLE: 0, POEM: 0 };
  for (const r of byTypeRows) {
    if (r.type === "TOSHEH" || r.type === "ARTICLE" || r.type === "POEM") {
      byType[r.type] = r._count;
    }
  }

  const thisMonth = allDates.filter((e) =>
    isCurrentShamsiMonth(e.createdAt),
  ).length;

  return {
    entries: rows.map((r) => toEntryDTO(r as unknown as EntryRow)),
    stats: {
      total: totalCount,
      byType,
      thisMonth,
      currentMonthLabel: currentShamsiMonthLabel(),
    },
  };
}

/** گرفتن یک entry با id. null اگر پیدا نشد. */
export async function getEntryFromDb(id: string): Promise<EntryDTO | null> {
  const row = await db.entry.findUnique({ where: { id } });
  if (!row) return null;
  return toEntryDTO(row as unknown as EntryRow);
}

// ─── Validation ─────────────────────────────────────────────────────────────

export class EntryValidationError extends Error {
  readonly details: string | undefined;
  readonly allowed: string[] | undefined;
  constructor(message: string, details?: string, allowed?: string[]) {
    super(message);
    this.name = "EntryValidationError";
    this.details = details;
    this.allowed = allowed;
  }
}

/**
 * اعتبارسنجی body برای POST. در صورت نامعتبر بودن، EntryValidationError پرتاب می‌کند.
 * `readingTime` در input وجود ندارد — برای ARTICLE در API محاسبه می‌شود.
 */
export function assertEntryCreateInput(input: unknown): EntryCreateInput {
  if (!input || typeof input !== "object") {
    throw new EntryValidationError("Invalid body", "expected JSON object");
  }
  const obj = input as Record<string, unknown>;

  // type
  if (!isEntryType(obj.type)) {
    throw new EntryValidationError(
      "Invalid type",
      `got ${JSON.stringify(obj.type)}`,
      [...ENTRY_TYPES],
    );
  }
  const type: EntryType = obj.type;

  // title
  if (typeof obj.title !== "string" || obj.title.trim().length === 0) {
    throw new EntryValidationError("title is required", "non-empty string");
  }
  if (obj.title.length > 200) {
    throw new EntryValidationError("title too long", "max 200 chars");
  }
  const title = obj.title;

  // content
  if (typeof obj.content !== "string" || obj.content.trim().length === 0) {
    throw new EntryValidationError("content is required", "non-empty string");
  }
  const content = obj.content;

  // excerpt (optional, max 280)
  let excerpt: string | null | undefined;
  if (obj.excerpt !== undefined && obj.excerpt !== null) {
    if (typeof obj.excerpt !== "string") {
      throw new EntryValidationError("excerpt must be string or null");
    }
    if (obj.excerpt.length > 280) {
      throw new EntryValidationError("excerpt too long", "max 280 chars");
    }
    excerpt = obj.excerpt;
  }

  // tags (optional, max 10, each 1-30)
  let tags: string[] | undefined;
  if (obj.tags !== undefined && obj.tags !== null) {
    if (!Array.isArray(obj.tags)) {
      throw new EntryValidationError("tags must be array");
    }
    if (obj.tags.length > 10) {
      throw new EntryValidationError("too many tags", "max 10");
    }
    const validated: string[] = [];
    for (const t of obj.tags) {
      if (typeof t !== "string") {
        throw new EntryValidationError("each tag must be string");
      }
      const trimmed = t.trim();
      if (trimmed.length === 0 || trimmed.length > 30) {
        throw new EntryValidationError(
          "tag length invalid",
          "each tag 1-30 chars",
        );
      }
      validated.push(trimmed);
    }
    tags = validated;
  }

  // string-or-null optional fields
  const optStr = (
    key: "mood" | "source" | "emotion" | "dedicatedTo",
  ): string | null | undefined => {
    if (obj[key] === undefined || obj[key] === null) return undefined;
    if (typeof obj[key] !== "string") {
      throw new EntryValidationError(`${key} must be string or null`);
    }
    return obj[key];
  };

  // isPublished (optional, default true)
  let isPublished: boolean | undefined;
  if (obj.isPublished !== undefined && obj.isPublished !== null) {
    if (typeof obj.isPublished !== "boolean") {
      throw new EntryValidationError("isPublished must be boolean");
    }
    isPublished = obj.isPublished;
  }

  return {
    type,
    title,
    content,
    excerpt,
    tags,
    mood: optStr("mood"),
    source: optStr("source"),
    emotion: optStr("emotion"),
    dedicatedTo: optStr("dedicatedTo"),
    isPublished,
  };
}

/**
 * اعتبارسنجی body برای PUT. مانند create ولی همه‌ی فیلدها optional.
 * `type` در body ignored.
 */
export function assertEntryUpdateInput(input: unknown): EntryUpdateInput {
  if (!input || typeof input !== "object") {
    throw new EntryValidationError("Invalid body", "expected JSON object");
  }
  const obj = { ...(input as Record<string, unknown>) };
  delete obj.type; // type در PUT قابل تغییر نیست — ignored
  const out: EntryUpdateInput = {};

  if (obj.title !== undefined) {
    if (typeof obj.title !== "string" || obj.title.trim().length === 0) {
      throw new EntryValidationError("title must be non-empty string");
    }
    if (obj.title.length > 200) {
      throw new EntryValidationError("title too long", "max 200 chars");
    }
    out.title = obj.title;
  }
  if (obj.content !== undefined) {
    if (typeof obj.content !== "string" || obj.content.trim().length === 0) {
      throw new EntryValidationError("content must be non-empty string");
    }
    out.content = obj.content;
  }
  if (obj.excerpt !== undefined) {
    if (obj.excerpt === null) out.excerpt = null;
    else if (typeof obj.excerpt === "string") {
      if (obj.excerpt.length > 280) {
        throw new EntryValidationError("excerpt too long", "max 280 chars");
      }
      out.excerpt = obj.excerpt;
    } else {
      throw new EntryValidationError("excerpt must be string or null");
    }
  }
  if (obj.tags !== undefined) {
    if (obj.tags === null) {
      out.tags = [];
    } else if (Array.isArray(obj.tags)) {
      if (obj.tags.length > 10) {
        throw new EntryValidationError("too many tags", "max 10");
      }
      const validated: string[] = [];
      for (const t of obj.tags) {
        if (typeof t !== "string") {
          throw new EntryValidationError("each tag must be string");
        }
        const trimmed = t.trim();
        if (trimmed.length === 0 || trimmed.length > 30) {
          throw new EntryValidationError(
            "tag length invalid",
            "each tag 1-30 chars",
          );
        }
        validated.push(trimmed);
      }
      out.tags = validated;
    } else {
      throw new EntryValidationError("tags must be array");
    }
  }
  for (const key of ["mood", "source", "emotion", "dedicatedTo"] as const) {
    if (obj[key] !== undefined) {
      if (obj[key] === null) {
        out[key] = null;
      } else if (typeof obj[key] === "string") {
        out[key] = obj[key];
      } else {
        throw new EntryValidationError(`${key} must be string or null`);
      }
    }
  }
  if (obj.isPublished !== undefined) {
    if (typeof obj.isPublished !== "boolean") {
      throw new EntryValidationError("isPublished must be boolean");
    }
    out.isPublished = obj.isPublished;
  }
  return out;
}

// ─── Build Prisma row data from validated input ────────────────────────────

/**
 * ساخت data object برای `db.entry.create` از validated input.
 * excerpt را اگر null/undefined باشد، از content می‌سازد.
 * tags را به JSON string تبدیل می‌کند.
 * readingTime را برای ARTICLE محاسبه می‌کند (برای TOSHEH/POEM null).
 */
export function buildCreateData(
  input: EntryCreateInput,
): {
  type: string;
  title: string;
  content: string;
  excerpt: string | null;
  tags: string;
  mood: string | null;
  source: string | null;
  emotion: string | null;
  dedicatedTo: string | null;
  readingTime: number | null;
  isPublished: boolean;
} {
  const isArticle = input.type === "ARTICLE";
  return {
    type: input.type,
    title: input.title,
    content: input.content,
    excerpt:
      input.excerpt === undefined
        ? computeExcerpt(input.content)
        : input.excerpt,
    tags: JSON.stringify(input.tags ?? []),
    mood: input.mood ?? null,
    source: input.source ?? null,
    emotion: input.emotion ?? null,
    dedicatedTo: input.dedicatedTo ?? null,
    readingTime: isArticle ? computeReadingTime(input.content) : null,
    isPublished: input.isPublished ?? true,
  };
}

/**
 * ساخت data object برای `db.entry.update` از validated update input.
 * اگر content تغییر کرده و type ARTICLE است، readingTime را دوباره محاسبه می‌کند.
 */
export async function buildUpdateData(
  id: string,
  input: EntryUpdateInput,
): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.content !== undefined) {
    data.content = input.content;
    // re-compute excerpt و readingTime (اگر ARTICLE)
    const existing = await db.entry.findUnique({
      where: { id },
      select: { type: true },
    });
    if (existing?.type === "ARTICLE") {
      data.readingTime = computeReadingTime(input.content);
    }
    // اگر excerpt صراحتاً set نشده، از content جدید محاسبه کن
    if (input.excerpt === undefined) {
      data.excerpt = computeExcerpt(input.content);
    }
  }
  if (input.excerpt !== undefined) data.excerpt = input.excerpt;
  if (input.tags !== undefined) data.tags = JSON.stringify(input.tags);
  if (input.mood !== undefined) data.mood = input.mood;
  if (input.source !== undefined) data.source = input.source;
  if (input.emotion !== undefined) data.emotion = input.emotion;
  if (input.dedicatedTo !== undefined) data.dedicatedTo = input.dedicatedTo;
  if (input.isPublished !== undefined) data.isPublished = input.isPublished;

  return data;
}

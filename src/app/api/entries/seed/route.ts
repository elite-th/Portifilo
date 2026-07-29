// src/app/api/entries/seed/route.ts
// ───────────────────────────────────────────────────────────────────────────
// POST /api/entries/seed → { seeded: number, entries: EntryDTO[] } (200)
//                          | { error } (403 in production)
//
// Behavior:
// 1. در production → 403.
// 2. deleteMany (پاک‌سازی کامل).
// 3. insert SEED_ENTRIES با createdAt از seed-data.ts.
// 4. برای ARTICLE‌ها، readingTime در buildCreateData محاسبه می‌شود.
// 5. Response: { seeded, entries } — entries به‌ترتیب createdAt DESC.
// ───────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_ENTRIES } from "@/lib/seed-data";
import {
  buildCreateData,
  toEntryDTO,
} from "@/lib/entries.server";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Seed disabled in production" },
      { status: 403 },
    );
  }

  try {
    // 1. پاک‌سازی کامل
    await db.entry.deleteMany({});

    // 2. Insert همه‌ی seed entries
    const inserted = await Promise.all(
      SEED_ENTRIES.map((seed) => {
        const data = buildCreateData(seed);
        // createdAt صراحتاً set شود (نه default now)
        return db.entry.create({
          data: {
            ...data,
            createdAt: seed.createdAt,
          },
        });
      }),
    );

    // 3. مرتب‌سازی بر اساس createdAt DESC
    const sorted = inserted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      seeded: inserted.length,
      entries: sorted.map((r) => toEntryDTO(r as never)),
    });
  } catch (err) {
    console.error("[entries seed POST] failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

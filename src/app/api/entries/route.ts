// src/app/api/entries/route.ts
// ───────────────────────────────────────────────────────────────────────────
// GET  /api/entries?type=TOSHEH&month=current → EntriesListResponse
// POST /api/entries                            → EntryDTO (201) | error (400)
// ───────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import {
  assertEntryCreateInput,
  buildCreateData,
  EntryValidationError,
  getEntriesFromDb,
  toEntryDTO,
} from "@/lib/entries.server";
import { db } from "@/lib/db";
import { isEntryType, type EntryType } from "@/lib/entries";
import { verifySessionCookie, COOKIE_NAME } from "@/lib/auth";

/** Check admin session — returns true if authenticated. */
function isAuthenticated(req: NextRequest): boolean {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  return verifySessionCookie(cookie) !== null;
}

// ─── GET: list + filter + stats ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const typeParam = req.nextUrl.searchParams.get("type");
  const monthParam = req.nextUrl.searchParams.get("month");

  // validate `type` (optional)
  let type: EntryType | null = null;
  if (typeParam !== null) {
    if (!isEntryType(typeParam)) {
      return NextResponse.json(
        {
          error: "Invalid type",
          allowed: ["TOSHEH", "ARTICLE", "POEM"],
        },
        { status: 400 },
      );
    }
    type = typeParam;
  }

  // validate `month` (optional, default "current")
  // فقط برای stats thisMonth (که از DB محاسبه می‌شود، نه از این param).
  // ولی برای §۷.۵ قرارداد، format را اعتبارسنجی می‌کنیم.
  if (monthParam !== null && monthParam !== "current") {
    if (!/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json(
        { error: "Invalid month format", details: "expected 'current' or 'YYYY-MM'" },
        { status: 400 },
      );
    }
  }

  try {
    const result = await getEntriesFromDb(type);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[entries GET] failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── POST: create (admin-only) ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth check — only logged-in admin can create entries
  if (!isAuthenticated(req)) {
    return NextResponse.json(
      { error: "دسترسی غیرمجاز — ابتدا وارد شوید" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  let input;
  try {
    input = assertEntryCreateInput(body);
  } catch (err) {
    if (err instanceof EntryValidationError) {
      return NextResponse.json(
        {
          error: err.message,
          details: err.details,
          allowed: err.allowed,
        },
        { status: 400 },
      );
    }
    throw err;
  }

  try {
    const data = buildCreateData(input);
    const row = await db.entry.create({ data });
    return NextResponse.json(toEntryDTO(row as never), { status: 201 });
  } catch (err) {
    console.error("[entries POST] failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

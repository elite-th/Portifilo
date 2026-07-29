// src/app/api/entries/[id]/route.ts
// ───────────────────────────────────────────────────────────────────────────
// GET    /api/entries/:id → EntryDTO (200) | { error } (404)
// PUT    /api/entries/:id → EntryDTO (200) | { error } (400 | 404)
// DELETE /api/entries/:id → 204 | { error } (404)
// ───────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import {
  assertEntryUpdateInput,
  buildUpdateData,
  EntryValidationError,
  getEntryFromDb,
  toEntryDTO,
} from "@/lib/entries.server";
import { db } from "@/lib/db";
import { verifySessionCookie, COOKIE_NAME } from "@/lib/auth";

/** Check admin session — returns true if authenticated. */
function isAuthenticated(req: NextRequest): boolean {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  return verifySessionCookie(cookie) !== null;
}

// ─── GET: one ───────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const entry = await getEntryFromDb(id);
  if (!entry) {
    return NextResponse.json(
      { error: "Entry not found" },
      { status: 404 },
    );
  }
  return NextResponse.json(entry);
}

// ─── PUT: update (admin-only) ───────────────────────────────────────────────

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  // Auth check
  if (!isAuthenticated(req)) {
    return NextResponse.json(
      { error: "دسترسی غیرمجاز — ابتدا وارد شوید" },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;

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
    input = assertEntryUpdateInput(body);
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
    const existing = await db.entry.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 },
      );
    }

    const data = await buildUpdateData(id, input);
    const row = await db.entry.update({ where: { id }, data });
    return NextResponse.json(toEntryDTO(row as never));
  } catch (err) {
    console.error("[entries PUT] failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── DELETE (admin-only) ───────────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  // Auth check
  if (!isAuthenticated(req)) {
    return NextResponse.json(
      { error: "دسترسی غیرمجاز — ابتدا وارد شوید" },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;
  try {
    const existing = await db.entry.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 },
      );
    }
    await db.entry.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[entries DELETE] failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

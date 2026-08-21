import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, createSessionCookie, COOKIE_NAME, SESSION_MAX_AGE_MS } from "@/lib/auth";

// Simple in-memory rate limit: 5 attempts / 15min per IP
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_ATTEMPTS) return true;
  entry.count += 1;
  return false;
}

function resetAttempts(ip: string): void {
  attempts.delete(ip);
}

/**
 * POST /api/admin/login
 * Body: { username: string, password: string }
 *
 * Sets a signed session cookie on success.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "تعداد تلاش زیاد — ۱۵ دقیقه صبر کنید" },
      { status: 429, headers: { "Retry-After": "900" } }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json(
      { error: "نام کاربری و رمز عبور لازم است" },
      { status: 400 }
    );
  }

  if (!verifyCredentials(username, password)) {
    return NextResponse.json(
      { error: "نام کاربری یا رمز عبور نادرست است" },
      { status: 401 }
    );
  }

  resetAttempts(ip);

  const cookieValue = createSessionCookie(username);
  const res = NextResponse.json({ ok: true, username });
  res.cookies.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });
  return res;
}

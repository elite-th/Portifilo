import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, createSessionCookie, COOKIE_NAME, SESSION_MAX_AGE_MS } from "@/lib/auth";

/**
 * POST /api/admin/login
 * Body: { username: string, password: string }
 *
 * Sets a signed session cookie on success.
 */
export async function POST(req: NextRequest) {
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

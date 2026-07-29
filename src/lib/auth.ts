/**
 * Simple session management for /admin (فرماندهی طاها).
 *
 * No JWT library — we use a signed cookie with HMAC.
 * The cookie contains: username + expiry + signature.
 *
 * Why not next-auth? It's a 2MB dependency for a single-admin panel.
 * This is ~50 lines and does exactly what we need: one admin user,
 * session expiry, logout.
 */

import { createHmac, timingSafeEqual } from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  // Fall back to a derived secret from the admin password. This isn't ideal
  // (rotating the password invalidates sessions) but it's acceptable for a
  // single-admin dev panel.
  process.env.ADMIN_PASSWORD ||
  "fallback-dev-secret-change-me";

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const COOKIE_NAME = "taha_admin_session";

interface SessionPayload {
  username: string;
  expiresAt: number;
}

function sign(payload: SessionPayload): string {
  const data = `${payload.username}:${payload.expiresAt}`;
  const sig = createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
  // base64url-encode the data, then append the signature
  const encoded = Buffer.from(data, "utf8").toString("base64url");
  return `${encoded}.${sig}`;
}

function verify(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;

  let data: string;
  try {
    data = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }

  // Verify signature (constant-time comparison to prevent timing attacks)
  const expectedSig = createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("hex");
  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expectedSig, "hex");
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  // Parse payload
  const [username, expiresAtStr] = data.split(":");
  const expiresAt = Number(expiresAtStr);
  if (!username || !expiresAt || Number.isNaN(expiresAt)) return null;

  // Check expiry
  if (Date.now() > expiresAt) return null;

  return { username, expiresAt };
}

/** Create a signed session cookie value for a verified admin. */
export function createSessionCookie(username: string): string {
  return sign({
    username,
    expiresAt: Date.now() + SESSION_MAX_AGE_MS,
  });
}

/** Verify a cookie value. Returns the payload if valid, null otherwise. */
export function verifySessionCookie(
  cookieValue: string | undefined | null
): SessionPayload | null {
  if (!cookieValue) return null;
  return verify(cookieValue);
}

/** Verify admin credentials against env vars. */
export function verifyCredentials(
  username: string,
  password: string
): boolean {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) return false;

  // Constant-time comparison
  const userOk =
    username.length === expectedUser.length &&
    timingSafeEqual(Buffer.from(username), Buffer.from(expectedUser));
  const passOk =
    password.length === expectedPass.length &&
    timingSafeEqual(Buffer.from(password), Buffer.from(expectedPass));

  return userOk && passOk;
}

export { COOKIE_NAME, SESSION_MAX_AGE_MS };

import crypto from "crypto";

export const ADMIN_SESSION_COOKIE = "evlaser_admin_session";

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-insecure-secret-change-me";
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

// Trimmed on both sides — Vercel's env var UI (and copy/paste in general)
// easily introduces a stray trailing space or newline, which would otherwise
// make every correctly-typed password fail with no visible cause (the same
// class of bug BLOB_READ_WRITE_TOKEN had earlier in this project).
export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;
  const a = Buffer.from(password.trim());
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  return crypto.createHmac("sha256", getSecret()).update("evlaser-admin").digest("hex");
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = createSessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

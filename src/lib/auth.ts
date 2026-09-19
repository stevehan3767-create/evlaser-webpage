import crypto from "crypto";
import { settingsRepo } from "./repo";

export const ADMIN_SESSION_COOKIE = "evlaser_admin_session";

const PASSWORD_HASH_KEY = "adminPasswordHash";

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-insecure-secret-change-me";
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// salt:hash, so changing the hashing parameters later doesn't break existing
// stored passwords.
function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")): string {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPasswordHash(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return timingSafeStringEqual(hashPassword(password, salt), stored);
}

// A password set via /admin/reset-password (stored in the DB) always takes
// priority over ADMIN_PASSWORD once one exists, so resetting doesn't require
// touching Vercel's env vars (and its copy/paste whitespace pitfalls) at all.
export async function isAdminConfigured(): Promise<boolean> {
  if (await settingsRepo.get(PASSWORD_HASH_KEY)) return true;
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export async function checkPassword(password: string): Promise<boolean> {
  const stored = await settingsRepo.get(PASSWORD_HASH_KEY);
  if (stored) return verifyPasswordHash(password.trim(), stored);

  // Trimmed on both sides — Vercel's env var UI (and copy/paste in general)
  // easily introduces a stray trailing space or newline, which would
  // otherwise make every correctly-typed password fail with no visible
  // cause (the same class of bug BLOB_READ_WRITE_TOKEN had earlier).
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;
  return timingSafeStringEqual(password.trim(), expected);
}

// Requires ADMIN_RECOVERY_KEY (a separate secret from the login password,
// set once in Vercel) so a locked-out admin can set a brand-new password
// through a normal web form instead of re-editing env vars.
export function isRecoveryConfigured(): boolean {
  return Boolean(process.env.ADMIN_RECOVERY_KEY?.trim());
}

export function checkRecoveryKey(key: string): boolean {
  const expected = process.env.ADMIN_RECOVERY_KEY?.trim();
  if (!expected) return false;
  return timingSafeStringEqual(key.trim(), expected);
}

export async function setPassword(newPassword: string): Promise<void> {
  await settingsRepo.set(PASSWORD_HASH_KEY, hashPassword(newPassword.trim()));
}

// --- 이메일 인증 코드 기반 비밀번호 재설정 -------------------------------
// 복구 키(ADMIN_RECOVERY_KEY)를 모르는 경우에도, 등록된 관리자 메일로 받은
// 6자리 코드로 비밀번호를 새로 설정할 수 있게 한다. 코드는 해시로 저장되고
// 10분 뒤 만료되며, 한 번 사용하면 즉시 폐기된다.
const RESET_CODE_KEY = "adminResetCode";
const RESET_CODE_EXPIRY_KEY = "adminResetCodeExpiry";
const RESET_CODE_TTL_MS = 10 * 60 * 1000;

// 비밀번호 재설정 코드를 받을 관리자 메일. 잠금 상태에서도 서버에 미리
// 설정돼 있어야 하므로 환경변수로 지정하고, 없으면 문의 수신 주소로 대체.
export function recoveryEmail(): string | null {
  const e = (process.env.ADMIN_RECOVERY_EMAIL || process.env.MAIL_TO_CEO || process.env.MAIL_TO_GENERAL || "").trim();
  return e || null;
}

export async function createResetCode(): Promise<string> {
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  await settingsRepo.set(RESET_CODE_KEY, hashPassword(code));
  await settingsRepo.set(RESET_CODE_EXPIRY_KEY, String(Date.now() + RESET_CODE_TTL_MS));
  return code;
}

export async function checkResetCode(code: string): Promise<boolean> {
  const stored = await settingsRepo.get(RESET_CODE_KEY);
  const expiry = await settingsRepo.get(RESET_CODE_EXPIRY_KEY);
  if (!stored || !expiry) return false;
  if (Date.now() > Number(expiry)) return false;
  return verifyPasswordHash(code.trim(), stored);
}

export async function clearResetCode(): Promise<void> {
  await settingsRepo.set(RESET_CODE_KEY, "");
  await settingsRepo.set(RESET_CODE_EXPIRY_KEY, "");
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

import Link from "next/link";
import { isRecoveryConfigured, recoveryEmail } from "@/lib/auth";
import { isMailConfigured } from "@/lib/mail";
import { resetPassword, requestResetCode, resetPasswordByCode } from "./actions";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_key: "복구 키가 올바르지 않습니다.",
  too_short: "새 비밀번호는 4자 이상이어야 합니다.",
  mismatch: "새 비밀번호와 확인이 서로 다릅니다.",
  not_configured: "복구 키(ADMIN_RECOVERY_KEY 환경변수)가 설정되어 있지 않아 비밀번호를 재설정할 수 없습니다.",
  mail_not_configured: "메일 발송(SMTP)이 설정되어 있지 않아 이메일로 코드를 보낼 수 없습니다.",
  no_recovery_email: "코드를 받을 관리자 메일이 설정되어 있지 않습니다. (ADMIN_RECOVERY_EMAIL 또는 MAIL_TO_CEO)",
  invalid_code: "인증 코드가 올바르지 않거나 만료되었습니다. 코드를 다시 요청해 주세요.",
  send_failed: "인증 코드 메일 발송에 실패했습니다.",
};

// 코드를 어느 메일로 보냈는지 알 수 있도록 부분만 노출한다 (예: sb***@naver.com).
function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const head = user.slice(0, Math.min(2, user.length));
  return `${head}${"*".repeat(Math.max(1, user.length - head.length))}@${domain}`;
}

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; detail?: string; sent?: string }>;
}) {
  const { error, detail, sent } = await searchParams;
  const errorMsg = error
    ? (ERROR_MESSAGES[error] ?? "재설정에 실패했습니다.") + (error === "send_failed" && detail ? ` (${detail})` : "")
    : null;
  const recoveryConfigured = isRecoveryConfigured();
  const mailConfigured = isMailConfigured();
  const email = recoveryEmail();

  return (
    <div className="w-full mx-auto max-w-[440px] px-7 py-20">
      <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue mb-8">
        ← 로그인 화면으로
      </Link>
      <h1 className="text-[24px] font-[family-name:var(--font-display)] tracking-tight mb-2">비밀번호 재설정</h1>
      <p className="text-ink-soft text-[13.5px] mb-8">
        비밀번호를 잊으셨다면 아래 두 가지 방법 중 하나로 새로 설정할 수 있습니다. 새 비밀번호는 즉시 적용되며 재배포가
        필요하지 않습니다.
      </p>

      {errorMsg && <p className="mb-6 p-3.5 bg-red-soft border border-red text-[13px] text-ink rounded-sm">{errorMsg}</p>}
      {sent && (
        <p className="mb-6 p-3.5 bg-[#e9f7ee] border border-[#b8e6c8] text-[13px] text-[#0a7a3d] rounded-sm">
          인증 코드를 {email ? maskEmail(email) : "등록된 관리자 메일"}로 보냈습니다. 메일함을 확인해 아래에 코드를 입력하세요.
        </p>
      )}

      {/* 방법 1 — 등록된 메일로 인증 코드 받기 */}
      <div className="border border-line rounded-sm p-5 mb-6">
        <h2 className="text-[15px] font-bold mb-1">방법 1. 등록된 이메일로 재설정</h2>
        <p className="text-[12.5px] text-ink-soft mb-4">
          등록된 관리자 메일{email ? ` (${maskEmail(email)})` : ""}로 6자리 인증 코드를 받아 비밀번호를 새로 설정합니다.
        </p>

        {!mailConfigured ? (
          <div className="p-3.5 bg-surface-alt border border-line text-[12.5px] text-ink-soft rounded-sm">
            메일 발송(SMTP)이 아직 설정/작동하지 않아 이 방법을 사용할 수 없습니다. 아래 <b>방법 2</b>를 이용하세요.
          </div>
        ) : (
          <>
            <form action={requestResetCode} className="mb-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-blue text-blue font-bold text-[13px] rounded-sm hover:bg-blue hover:text-white"
              >
                인증 코드 메일 보내기
              </button>
            </form>
            <form action={resetPasswordByCode} className="grid gap-3.5 pt-4 border-t border-line">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-bold text-ink-soft">인증 코드 (메일로 받은 6자리)</label>
                <input
                  name="code"
                  inputMode="numeric"
                  required
                  className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm tracking-[0.3em]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-bold text-ink-soft">새 비밀번호</label>
                <input type="password" name="newPassword" required minLength={4} className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-bold text-ink-soft">새 비밀번호 확인</label>
                <input type="password" name="confirmPassword" required minLength={4} className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm" />
              </div>
              <button type="submit" className="w-full justify-center inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025]">
                코드로 비밀번호 재설정
              </button>
            </form>
          </>
        )}
      </div>

      {/* 방법 2 — 복구 키 */}
      <div className="border border-line rounded-sm p-5">
        <h2 className="text-[15px] font-bold mb-1">방법 2. 복구 키로 재설정</h2>
        <p className="text-[12.5px] text-ink-soft mb-4">
          Vercel 환경변수 <code>ADMIN_RECOVERY_KEY</code>에 설정해 둔 복구 키를 입력해 비밀번호를 새로 설정합니다.
        </p>

        {!recoveryConfigured && (
          <div className="mb-4 p-3.5 bg-red-soft border border-red text-[12.5px] text-ink rounded-sm">
            아직 <code>ADMIN_RECOVERY_KEY</code> 환경변수가 설정되어 있지 않습니다. Vercel 프로젝트 설정 → Environment
            Variables에서 값을 추가하고 재배포한 뒤 이용해 주세요.
          </div>
        )}

        <form action={resetPassword} className="grid gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-ink-soft">복구 키</label>
            <input type="password" name="recoveryKey" required className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-ink-soft">새 비밀번호</label>
            <input type="password" name="newPassword" required minLength={4} className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-ink-soft">새 비밀번호 확인</label>
            <input type="password" name="confirmPassword" required minLength={4} className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm" />
          </div>
          <button type="submit" className="w-full justify-center inline-flex items-center gap-2 px-[18px] py-2.5 bg-ink text-white font-bold text-[13.5px] border border-ink hover:opacity-90">
            복구 키로 비밀번호 재설정
          </button>
        </form>
      </div>
    </div>
  );
}

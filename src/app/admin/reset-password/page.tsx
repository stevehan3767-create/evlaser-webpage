import Link from "next/link";
import { isRecoveryConfigured } from "@/lib/auth";
import { resetPassword } from "./actions";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_key: "복구 키가 올바르지 않습니다.",
  too_short: "새 비밀번호는 4자 이상이어야 합니다.",
  mismatch: "새 비밀번호와 확인이 서로 다릅니다.",
  not_configured: "복구 키(ADMIN_RECOVERY_KEY 환경변수)가 설정되어 있지 않아 비밀번호를 재설정할 수 없습니다.",
};

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMsg = error ? ERROR_MESSAGES[error] ?? "재설정에 실패했습니다." : null;
  const recoveryConfigured = isRecoveryConfigured();

  return (
    <div className="w-full mx-auto max-w-[420px] px-7 py-24">
      <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue mb-8">
        ← 로그인 화면으로
      </Link>
      <h1 className="text-[24px] font-[family-name:var(--font-display)] tracking-tight mb-2">비밀번호 재설정</h1>
      <p className="text-ink-soft text-[13.5px] mb-8">
        Vercel 환경변수 <code>ADMIN_RECOVERY_KEY</code>에 설정해 둔 복구 키를 입력하면 로그인 비밀번호를 새로 설정할 수
        있습니다. 새로 설정한 비밀번호는 즉시 적용되며, 재배포가 필요하지 않습니다.
      </p>

      {!recoveryConfigured && (
        <div className="mb-6 p-4 bg-red-soft border border-red text-[13px] text-ink">
          아직 <code>ADMIN_RECOVERY_KEY</code> 환경변수가 설정되어 있지 않습니다. Vercel 프로젝트 설정 → Environment
          Variables에서 <code>ADMIN_RECOVERY_KEY</code>에 원하는 복구 키 값을 추가하고 재배포한 뒤 이 화면을 다시
          이용해 주세요.
        </div>
      )}

      <form action={resetPassword} className="grid gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-ink-soft">복구 키</label>
          <input
            type="password"
            name="recoveryKey"
            required
            autoFocus
            className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-ink-soft">새 비밀번호</label>
          <input
            type="password"
            name="newPassword"
            required
            minLength={4}
            className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-ink-soft">새 비밀번호 확인</label>
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={4}
            className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm"
          />
        </div>
        {errorMsg && <p className="text-[13px] text-red">{errorMsg}</p>}
        <button
          type="submit"
          className="w-full justify-center inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025]"
        >
          비밀번호 재설정
        </button>
      </form>
    </div>
  );
}

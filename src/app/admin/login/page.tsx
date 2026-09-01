import { isAdminConfigured } from "@/lib/auth";
import { login } from "./actions";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "비밀번호가 올바르지 않습니다.",
  not_configured: "관리자 비밀번호가 설정되지 않았습니다 (ADMIN_PASSWORD 환경변수 필요).",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? ERROR_MESSAGES[params.error] ?? "로그인에 실패했습니다." : null;

  return (
    <div className="mx-auto max-w-[420px] px-7 py-24">
      <h1 className="text-[24px] font-[family-name:var(--font-display)] tracking-tight mb-2">관리자 로그인</h1>
      <p className="text-ink-soft text-[13.5px] mb-8">EV Laser 홈페이지 관리자 모드입니다.</p>

      {!isAdminConfigured() && (
        <div className="mb-6 p-4 bg-red-soft border border-red text-[13px] text-ink">
          ADMIN_PASSWORD 환경변수가 설정되어 있지 않아 로그인할 수 없습니다. 배포 환경에 환경변수를 추가해 주세요.
        </div>
      )}

      <form action={login}>
        <input type="hidden" name="next" value={params.next ?? "/admin"} />
        <div className="flex flex-col gap-1.5 mb-5">
          <label className="text-[12.5px] font-bold text-ink-soft">비밀번호</label>
          <input
            type="password"
            name="password"
            required
            autoFocus
            className="border border-line-strong px-3 py-[11px] bg-surface text-[13.8px] rounded-sm"
          />
        </div>
        {error && <p className="mb-4 text-[13px] text-red">{error}</p>}
        <button
          type="submit"
          className="w-full justify-center inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025]"
        >
          로그인
        </button>
      </form>
    </div>
  );
}

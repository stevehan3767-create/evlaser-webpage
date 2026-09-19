import { inquiryRepo, settingsRepo } from "@/lib/repo";
import { DEFAULT_GENERAL_EMAIL, DEFAULT_CEO_EMAIL } from "@/lib/mail";
import { saveInquiryEmails, testSmtp } from "./actions";

export const dynamic = "force-dynamic";

const CHANNEL_LABELS: Record<string, string> = {
  general: "일반 문의",
  ethics: "윤리경영 신고",
  praise: "임직원 칭찬",
  complaint: "CEO 직속 고객불만",
};

const SMTP_RESULTS: Record<string, { text: string; ok: boolean }> = {
  ok: { text: "SMTP 접속 성공 — 발송 설정이 정상입니다.", ok: true },
  sent: { text: "SMTP 접속 성공 및 테스트 메일 발송 완료 — 수신함을 확인하세요.", ok: true },
  fail: { text: "SMTP 접속 실패", ok: false },
  sendfail: { text: "SMTP 접속은 됐으나 메일 발송 실패", ok: false },
};

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ smtp?: string; detail?: string; cfg?: string }>;
}) {
  const { smtp, detail, cfg } = await searchParams;
  const smtpResult = smtp ? SMTP_RESULTS[smtp] : undefined;
  const [items, generalEmail, ceoEmail] = await Promise.all([
    inquiryRepo.list(),
    settingsRepo.get("generalEmail"),
    settingsRepo.get("ceoEmail"),
  ]);

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-6">문의 내역</h1>

      <h2 className="text-[15px] font-bold mb-3">메일 발송(SMTP) 진단</h2>
      <div className="border border-line p-5 mb-12 grid gap-3 max-w-[560px]">
        <p className="text-[12.5px] text-ink-soft">
          문의·채용·비밀번호 재설정 메일이 실제로 나가는지 확인합니다. 수신 주소를 입력하고 테스트하면 접속 확인 후 테스트
          메일까지 보냅니다. 비워두면 접속(로그인)만 확인합니다.
        </p>
        {smtpResult && (
          <div
            className={`p-3.5 text-[12.5px] rounded-sm border ${
              smtpResult.ok ? "bg-[#e9f7ee] border-[#b8e6c8] text-[#0a7a3d]" : "bg-red-soft border-red text-ink"
            }`}
          >
            <b>{smtpResult.text}</b>
            {detail && <div className="mt-1 font-mono text-[11.5px] break-all">오류: {detail}</div>}
            {cfg && <div className="mt-1 font-mono text-[11.5px] break-all text-ink-soft">설정: {cfg}</div>}
          </div>
        )}
        <form action={testSmtp} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">테스트 메일 수신 주소 (선택)</label>
            <input
              name="to"
              type="email"
              placeholder="예: 본인 메일 주소"
              className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
            />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-ink text-white font-bold text-[13px] rounded-sm">
            SMTP 테스트
          </button>
        </form>
      </div>

      <h2 className="text-[15px] font-bold mb-3">문의 수신 이메일</h2>
      <form action={saveInquiryEmails} className="border border-line p-5 mb-12 grid gap-3.5 max-w-[560px]">
        <p className="text-[12.5px] text-ink-soft">
          홈페이지 &quot;문의하기&quot;로 접수된 내용이 전달될 이메일 주소입니다. 일반 문의와 대표이사 직속 소통센터(윤리경영 신고·임직원
          칭찬·고객불만)를 서로 다른 주소로 받을 수 있습니다.
        </p>
        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">일반 문의 수신 이메일</label>
          <input
            name="generalEmail"
            type="email"
            defaultValue={generalEmail ?? ""}
            placeholder={DEFAULT_GENERAL_EMAIL}
            className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">대표이사 직속 소통센터 수신 이메일</label>
          <input
            name="ceoEmail"
            type="email"
            defaultValue={ceoEmail ?? ""}
            placeholder={DEFAULT_CEO_EMAIL}
            className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
          저장
        </button>
      </form>

      <h2 className="text-[15px] font-bold mb-3">
        접수된 문의 <span className="font-mono text-ink-faint text-[13px]">({items.length})</span>
      </h2>
      <div className="border border-line">
        {items.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">아직 접수된 문의가 없습니다.</p>
        ) : (
          items.map((i) => (
            <div key={i.id} className="p-4 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-[10.5px] text-red border border-line-strong px-1.5 py-0.5">
                  {CHANNEL_LABELS[i.channel] ?? i.channel}
                </span>
                <span className="font-bold">{i.name}</span>
                {i.company && <span className="text-ink-soft">({i.company})</span>}
                <span className="text-ink-faint font-mono ml-auto">{new Date(i.createdAt).toLocaleString("ko-KR")}</span>
              </div>
              <p className="text-ink-soft">
                {i.email}
                {i.phone ? ` · ${i.phone}` : ""}
                {i.industry ? ` · ${i.industry}` : ""}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{i.message}</p>
              <p className="mt-2 text-[11px] font-mono text-ink-faint">
                {i.emailSent ? "이메일 발송됨" : `이메일 미발송 — 오류: ${i.emailError ?? "알 수 없음"}`}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

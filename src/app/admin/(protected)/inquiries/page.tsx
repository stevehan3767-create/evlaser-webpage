import { inquiryRepo, settingsRepo } from "@/lib/repo";
import { DEFAULT_GENERAL_EMAIL, DEFAULT_CEO_EMAIL } from "@/lib/mail";
import { saveInquiryEmails } from "./actions";

export const dynamic = "force-dynamic";

const CHANNEL_LABELS: Record<string, string> = {
  general: "일반 문의",
  ethics: "윤리경영 신고",
  praise: "임직원 칭찬",
  complaint: "CEO 직속 고객불만",
};

export default async function AdminInquiriesPage() {
  const [items, generalEmail, ceoEmail] = await Promise.all([
    inquiryRepo.list(),
    settingsRepo.get("generalEmail"),
    settingsRepo.get("ceoEmail"),
  ]);

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-6">문의 내역</h1>

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
                {i.emailSent ? "이메일 발송됨" : "이메일 미발송 (SMTP 미설정 또는 오류)"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

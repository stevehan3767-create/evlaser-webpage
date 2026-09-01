import { inquiryRepo } from "@/lib/repo";

export const dynamic = "force-dynamic";

const CHANNEL_LABELS: Record<string, string> = {
  general: "일반 문의",
  ethics: "윤리경영 신고",
  praise: "임직원 칭찬",
  complaint: "CEO 직속 고객불만",
};

export default function AdminInquiriesPage() {
  const items = inquiryRepo.list();

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-6">문의 내역</h1>
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

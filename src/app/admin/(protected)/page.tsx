import Link from "next/link";
import { resourceRepo, newsRepo, inquiryRepo } from "@/lib/repo";
import { isMailConfigured } from "@/lib/mail";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [resourceCount, newsCount, inquiries] = await Promise.all([
    resourceRepo.count(),
    newsRepo.count(),
    inquiryRepo.list(),
  ]);

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-6">대시보드</h1>

      {!isMailConfigured() && (
        <div className="mb-6 p-4 bg-blue-soft border border-line-strong text-[13px] text-ink-soft">
          SMTP 환경변수(SMTP_HOST/SMTP_USER/SMTP_PASS)가 설정되지 않아 문의 이메일이 실제로 발송되지 않습니다.
          접수 내역은 아래 &ldquo;문의 내역&rdquo;에서 계속 확인할 수 있습니다.
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Stat label="자료실 항목" value={resourceCount} href="/admin/resources" />
        <Stat label="뉴스 항목" value={newsCount} href="/admin/news" />
        <Stat label="누적 문의 건수" value={inquiries.length} href="/admin/inquiries" />
      </div>

      <h2 className="text-[15px] font-bold mb-3">최근 문의 5건</h2>
      <div className="border border-line">
        {inquiries.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">아직 접수된 문의가 없습니다.</p>
        ) : (
          inquiries.slice(0, 5).map((i) => (
            <div key={i.id} className="flex justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <span className="font-mono text-ink-faint w-[110px] flex-none">{i.channel}</span>
              <span className="flex-1">{i.name} — {i.message.slice(0, 40)}</span>
              <span className="text-ink-faint font-mono">{i.emailSent ? "메일발송" : "미발송"}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="border border-line p-4 hover:border-blue">
      <div className="text-[26px] font-mono font-bold text-blue-deep">{value}</div>
      <div className="text-[12.5px] text-ink-soft mt-1">{label}</div>
    </Link>
  );
}

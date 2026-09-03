import { settingsRepo, jobApplicationRepo } from "@/lib/repo";
import { DEFAULT_CAREERS_EMAIL } from "@/lib/mail";
import { saveCareersEmail } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCareersPage() {
  const [careersEmail, applications] = await Promise.all([settingsRepo.get("careersEmail"), jobApplicationRepo.list()]);

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-6">채용 지원 관리</h1>

      <h2 className="text-[15px] font-bold mb-3">지원서 수신 이메일</h2>
      <form action={saveCareersEmail} className="border border-line p-5 mb-12 grid gap-3.5 max-w-[480px]">
        <p className="text-[12.5px] text-ink-soft">
          &quot;지원하기&quot; 버튼으로 접수된 지원서(첨부파일 포함)가 전달될 이메일 주소입니다.
        </p>
        <input
          name="careersEmail"
          type="email"
          required
          defaultValue={careersEmail ?? DEFAULT_CAREERS_EMAIL}
          placeholder={DEFAULT_CAREERS_EMAIL}
          className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
        />
        <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
          저장
        </button>
      </form>

      <h2 className="text-[15px] font-bold mb-3">
        접수된 지원서 <span className="font-mono text-ink-faint text-[13px]">({applications.length})</span>
      </h2>
      <div className="border border-line">
        {applications.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">접수된 지원서가 없습니다.</p>
        ) : (
          applications.map((a) => (
            <div key={a.id} className="p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold">
                    {a.jobTitle} · {a.name}
                  </p>
                  <p className="mt-1 text-[11.5px] text-ink-faint">
                    {a.email}
                    {a.phone && <span> · {a.phone}</span>}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-ink-faint flex-none">{new Date(a.createdAt).toLocaleString("ko-KR")}</span>
              </div>
              {a.message && <p className="mt-2 text-[12px] text-ink-soft whitespace-pre-wrap">{a.message}</p>}
              {a.fileNames && <p className="mt-1.5 text-[11.5px] text-blue">첨부: {a.fileNames}</p>}
              {!a.emailSent && <p className="mt-1.5 text-[11px] text-red">⚠ 메일 발송 실패 (SMTP 설정 확인 필요)</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

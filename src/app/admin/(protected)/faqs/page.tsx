import Link from "next/link";
import { faqRepo } from "@/lib/repo";
import { saveFaq, deleteFaq } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;

  const items = await faqRepo.list();
  const editing = edit ? items.find((f) => f.id === edit) : undefined;

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-2">
        자주 묻는 질문 관리{editing && " — 수정"}
      </h1>
      <p className="text-[13px] text-ink-soft mb-6">
        문의하기(/support) 페이지에 기본으로 표시되는 3개 질문 외에, 여기서 추가한 질문이 이어서 표시됩니다.
      </p>

      <form key={editing?.id ?? "new"} action={saveFaq} className="border border-line p-5 mb-8 grid gap-3.5">
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">질문</label>
          <input
            name="question"
            defaultValue={editing?.question ?? ""}
            required
            className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">답변</label>
          <textarea
            name="answer"
            defaultValue={editing?.answer ?? ""}
            rows={4}
            required
            className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm resize-y"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
            {editing ? "저장" : "추가"}
          </button>
          {editing && (
            <Link href="/admin/faqs" className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
              취소
            </Link>
          )}
        </div>
      </form>

      <div className="border border-line">
        {items.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 질문이 없습니다.</p>
        ) : (
          items.map((f) => (
            <div key={f.id} className="flex items-start justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex-1">
                <p className="font-bold">{f.question}</p>
                <p className="mt-1 text-[12px] text-ink-soft whitespace-pre-wrap">{f.answer}</p>
              </div>
              <div className="flex gap-3 flex-none">
                <Link href={`/admin/faqs?edit=${f.id}`} className="text-[12px] text-blue font-bold">
                  수정
                </Link>
                <form action={deleteFaq}>
                  <input type="hidden" name="id" value={f.id} />
                  <button type="submit" className="text-[12px] text-red font-bold">
                    삭제
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

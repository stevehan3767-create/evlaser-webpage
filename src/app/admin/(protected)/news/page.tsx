import Link from "next/link";
import { newsItems as seedNewsItems } from "@/lib/data";
import { newsRepo, seedIfEmpty } from "@/lib/repo";
import { saveNews, deleteNews } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;

  await seedIfEmpty(seedNewsItems);
  const items = await newsRepo.list();
  const editing = edit ? items.find((i) => i.id === edit) : undefined;

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-6">뉴스 관리{editing && " — 수정"}</h1>

      <form key={editing?.id ?? "new"} action={saveNews} className="border border-line p-5 mb-8 grid gap-3.5">
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_140px] gap-3.5">
          <select name="tag" defaultValue={editing?.tag ?? "회사소식"} className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm">
            <option>회사소식</option>
            <option>전시회소식</option>
            <option>산업동향</option>
          </select>
          <input
            name="title"
            placeholder="제목"
            defaultValue={editing?.title ?? ""}
            required
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <input
            name="date"
            placeholder="2026.09.01"
            defaultValue={editing?.date ?? ""}
            required
            pattern="\d{4}\.\d{2}\.\d{2}"
            title="YYYY.MM.DD 형식으로 입력"
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <textarea
          name="body"
          placeholder="본문 (선택)"
          defaultValue={editing?.body ?? ""}
          rows={3}
          className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm resize-y"
        />
        <div className="flex gap-3">
          <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
            {editing ? "저장" : "추가"}
          </button>
          {editing && (
            <Link href="/admin/news" className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
              취소
            </Link>
          )}
        </div>
      </form>

      <div className="border border-line">
        {items.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 뉴스가 없습니다.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <span className="font-mono text-[10.5px] text-blue border border-line-strong px-1.5 py-0.5 flex-none mt-0.5">{item.tag}</span>
              <div className="flex-1">
                <p>{item.title}</p>
                {item.body && <p className="mt-1 text-[12px] text-ink-soft line-clamp-2">{item.body}</p>}
              </div>
              <span className="font-mono text-ink-faint flex-none">{item.date}</span>
              <div className="flex gap-3 flex-none">
                <Link href={`/admin/news?edit=${item.id}`} className="text-[12px] text-blue font-bold">
                  수정
                </Link>
                <form action={deleteNews}>
                  <input type="hidden" name="id" value={item.id} />
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

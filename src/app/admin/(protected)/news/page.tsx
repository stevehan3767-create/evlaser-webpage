import { newsItems as seedNewsItems } from "@/lib/data";
import { newsRepo, seedIfEmpty } from "@/lib/repo";
import { createNews, deleteNews } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  await seedIfEmpty(seedNewsItems);
  const items = await newsRepo.list();

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-6">뉴스 관리</h1>

      <form action={createNews} className="border border-line p-5 mb-8 grid gap-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_140px] gap-3.5">
          <select name="tag" className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm">
            <option>회사소식</option>
            <option>전시회소식</option>
            <option>산업동향</option>
          </select>
          <input name="title" placeholder="제목" required className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
          <input
            name="date"
            placeholder="2026.09.01"
            required
            pattern="\d{4}\.\d{2}\.\d{2}"
            title="YYYY.MM.DD 형식으로 입력"
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <textarea
          name="body"
          placeholder="본문 (선택)"
          rows={3}
          className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm resize-y"
        />
        <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
          추가
        </button>
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
              <form action={deleteNews}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="text-[12px] text-red font-bold flex-none">
                  삭제
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

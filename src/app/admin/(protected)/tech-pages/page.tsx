import Link from "next/link";
import { techItems, techLabelsKo, techPageSeeds } from "@/lib/data";
import { techPageRepo, techCaseRepo, seedTechPagesIfEmpty } from "@/lib/repo";
import { saveTechPage, createTechCase, deleteTechCase } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminTechPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key: rawKey } = await searchParams;
  const key = techItems.some((t) => t.key === rawKey) ? (rawKey as string) : techItems[0].key;

  await seedTechPagesIfEmpty(techPageSeeds);
  const [page, cases] = await Promise.all([techPageRepo.get(key), techCaseRepo.listByKey(key)]);

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-6">기술 페이지 관리</h1>

      <div className="flex flex-wrap gap-1.5 mb-8">
        {techItems.map((t, i) => (
          <Link
            key={t.key}
            href={`/admin/tech-pages?key=${t.key}`}
            className={`px-3 py-1.5 text-[12.5px] border rounded-sm ${
              t.key === key ? "bg-red text-white border-red font-bold" : "border-line-strong text-ink-soft hover:border-blue"
            }`}
          >
            {String(i + 1).padStart(2, "0")}. {techLabelsKo[t.key] ?? t.key}
          </Link>
        ))}
      </div>

      <form action={saveTechPage} className="border border-line p-5 mb-10 grid gap-3.5">
        <input type="hidden" name="key" value={key} />
        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">제목 (비워두면 기본 명칭 사용)</label>
          <input
            name="title"
            defaultValue={page?.title ?? ""}
            placeholder={techLabelsKo[key] ?? key}
            className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">기술소개 (A4 1장 분량 권장)</label>
          <textarea
            name="description"
            defaultValue={page?.description ?? ""}
            rows={16}
            className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm resize-y font-mono"
          />
        </div>
        <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
          저장
        </button>
      </form>

      <h2 className="text-[15px] font-bold mb-3">적용사례 추가</h2>
      <form action={createTechCase} className="border border-line p-5 mb-8 grid gap-3.5">
        <input type="hidden" name="techKey" value={key} />
        <input name="productName" placeholder="제품명" required className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
        <input
          name="equipmentImageUrl"
          placeholder="기계설비 이미지 URL (선택)"
          className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
        />
        <input name="videoUrl" placeholder="동영상 URL (선택)" className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
        <input
          name="productImageUrl"
          placeholder="제품 이미지 URL (선택)"
          className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
        />
        <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
          추가
        </button>
      </form>

      <h2 className="text-[15px] font-bold mb-3">등록된 적용사례</h2>
      <div className="border border-line">
        {cases.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 적용사례가 없습니다.</p>
        ) : (
          cases.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex-1">
                <p className="font-bold">{c.productName}</p>
                <p className="mt-1 text-[11.5px] text-ink-faint flex flex-col gap-0.5">
                  {c.equipmentImageUrl && <span>설비 이미지: {c.equipmentImageUrl}</span>}
                  {c.videoUrl && <span>동영상: {c.videoUrl}</span>}
                  {c.productImageUrl && <span>제품 이미지: {c.productImageUrl}</span>}
                </p>
              </div>
              <form action={deleteTechCase}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="techKey" value={key} />
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

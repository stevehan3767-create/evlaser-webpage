import Link from "next/link";
import { contentGroups } from "@/lib/data";
import { contentPageRepo, contentCaseRepo, seedContentIfEmpty } from "@/lib/repo";
import { saveContentPage, createContentCase, deleteContentCase } from "./actions";

export const dynamic = "force-dynamic";

const GROUP_ORDER = ["lineup", "tech", "industry", "material"];

export default async function AdminContentPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; key?: string }>;
}) {
  const { group: rawGroup, key: rawKey } = await searchParams;
  const group = GROUP_ORDER.includes(rawGroup ?? "") ? (rawGroup as string) : GROUP_ORDER[0];
  const meta = contentGroups[group];
  const key = meta.items.some((i) => i.key === rawKey) ? (rawKey as string) : meta.items[0].key;

  await seedContentIfEmpty(group, meta.seeds);
  const [page, cases] = await Promise.all([contentPageRepo.get(group, key), contentCaseRepo.listByKey(group, key)]);

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-6">제품·기술 페이지 관리</h1>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {GROUP_ORDER.map((g) => (
          <Link
            key={g}
            href={`/admin/content-pages?group=${g}`}
            className={`px-3.5 py-2 text-[13px] border rounded-sm font-bold ${
              g === group ? "bg-ink text-white border-ink" : "border-line-strong text-ink-soft hover:border-blue"
            }`}
          >
            {contentGroups[g].labelKo}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-8 pb-8 border-b border-line">
        {meta.items.map((t, i) => (
          <Link
            key={t.key}
            href={`/admin/content-pages?group=${group}&key=${t.key}`}
            className={`px-3 py-1.5 text-[12.5px] border rounded-sm ${
              t.key === key ? "bg-red text-white border-red font-bold" : "border-line-strong text-ink-soft hover:border-blue"
            }`}
          >
            {String(i + 1).padStart(2, "0")}. {meta.labelsKo[t.key] ?? t.key}
          </Link>
        ))}
      </div>

      <form action={saveContentPage} className="border border-line p-5 mb-10 grid gap-3.5">
        <input type="hidden" name="group" value={group} />
        <input type="hidden" name="key" value={key} />
        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">제목 (비워두면 기본 명칭 사용)</label>
          <input
            name="title"
            defaultValue={page?.title ?? ""}
            placeholder={meta.labelsKo[key] ?? key}
            className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">내용 (A4 1장 분량 권장)</label>
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
      <form action={createContentCase} className="border border-line p-5 mb-8 grid gap-3.5">
        <input type="hidden" name="group" value={group} />
        <input type="hidden" name="key" value={key} />
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
              <form action={deleteContentCase}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="group" value={group} />
                <input type="hidden" name="key" value={key} />
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

import Link from "next/link";
import { contentGroups } from "@/lib/data";
import { contentPageRepo, contentCaseRepo, contentImageRepo, seedContentIfEmpty } from "@/lib/repo";
import { saveContentPage, saveContentCase, deleteContentCase, createContentImage, deleteContentImage } from "./actions";

export const dynamic = "force-dynamic";

const GROUP_ORDER = ["lineup", "tech", "industry", "material"];

export default async function AdminContentPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; key?: string; editCase?: string }>;
}) {
  const { group: rawGroup, key: rawKey, editCase } = await searchParams;
  const group = GROUP_ORDER.includes(rawGroup ?? "") ? (rawGroup as string) : GROUP_ORDER[0];
  const meta = contentGroups[group];
  const key = meta.items.some((i) => i.key === rawKey) ? (rawKey as string) : meta.items[0].key;

  await seedContentIfEmpty(group, meta.seeds);
  const [page, cases, images] = await Promise.all([
    contentPageRepo.get(group, key),
    contentCaseRepo.listByKey(group, key),
    contentImageRepo.listByKey(group, key),
  ]);
  const editingCase = editCase ? cases.find((c) => c.id === editCase) : undefined;

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
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">대표 이미지 URL (선택)</label>
          <input
            name="imageUrl"
            defaultValue={page?.imageUrl ?? ""}
            placeholder="https://..."
            className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">
            내용 (A4 1장 분량 권장) — <code>[소제목]</code> 줄은 소제목으로, <code>- 항목</code> 줄은 목록으로,{" "}
            <code>| 항목 | 내용 |</code> 형식의 줄은 자동으로 표(사양서)로 변환됩니다
          </label>
          <textarea
            name="description"
            defaultValue={page?.description ?? ""}
            rows={16}
            className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm resize-y font-mono"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">동영상 URL (선택)</label>
            <input
              name="videoUrl"
              defaultValue={page?.videoUrl ?? ""}
              placeholder="https://..."
              className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
            />
          </div>
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">동영상 미리보기 이미지 URL (선택)</label>
            <input
              name="videoThumbnailUrl"
              defaultValue={page?.videoThumbnailUrl ?? ""}
              placeholder="https://..."
              className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
            />
          </div>
        </div>
        <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
          저장
        </button>
      </form>

      <h2 className="text-[15px] font-bold mb-3">이미지 갤러리 (설비 사진·샘플 사진 등)</h2>
      <form action={createContentImage} className="border border-line p-5 mb-8 grid gap-3.5">
        <input type="hidden" name="group" value={group} />
        <input type="hidden" name="key" value={key} />
        <input name="url" placeholder="이미지 URL" required className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
        <input name="caption" placeholder="설명 (예: 설비 사진, 선택)" className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
        <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
          추가
        </button>
      </form>
      <div className="border border-line mb-10">
        {images.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 이미지가 없습니다.</p>
        ) : (
          images.map((img) => (
            <div key={img.id} className="flex items-start justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex-1">
                {img.caption && <p className="font-bold">{img.caption}</p>}
                <p className="mt-1 text-[11.5px] text-ink-faint break-all">{img.url}</p>
              </div>
              <form action={deleteContentImage}>
                <input type="hidden" name="id" value={img.id} />
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

      <h2 className="text-[15px] font-bold mb-3">
        적용사례{editingCase ? " 수정" : " 추가"} <span className="font-mono text-ink-faint text-[12px]">({cases.length}/5)</span>
      </h2>
      {!editingCase && cases.length >= 5 ? (
        <p className="border border-line p-5 mb-8 text-[13px] text-ink-soft">
          적용사례는 최대 5개까지 등록할 수 있습니다. 새로 추가하려면 기존 항목을 먼저 삭제해 주세요.
        </p>
      ) : (
        <form action={saveContentCase} className="border border-line p-5 mb-8 grid gap-3.5">
          <input type="hidden" name="id" value={editingCase?.id ?? ""} />
          <input type="hidden" name="group" value={group} />
          <input type="hidden" name="key" value={key} />
          <input
            name="productName"
            placeholder="제품명"
            defaultValue={editingCase?.productName ?? ""}
            required
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <input
            name="equipmentImageUrl"
            placeholder="기계설비 이미지 URL (선택)"
            defaultValue={editingCase?.equipmentImageUrl ?? ""}
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <input
            name="videoUrl"
            placeholder="동영상 URL (선택)"
            defaultValue={editingCase?.videoUrl ?? ""}
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <input
            name="productImageUrl"
            placeholder="제품 이미지 URL (선택)"
            defaultValue={editingCase?.productImageUrl ?? ""}
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <div className="flex gap-3">
            <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
              {editingCase ? "저장" : "추가"}
            </button>
            {editingCase && (
              <Link
                href={`/admin/content-pages?group=${group}&key=${key}`}
                className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold"
              >
                취소
              </Link>
            )}
          </div>
        </form>
      )}

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
              <div className="flex gap-3 flex-none">
                <Link href={`/admin/content-pages?group=${group}&key=${key}&editCase=${c.id}`} className="text-[12px] text-blue font-bold">
                  수정
                </Link>
                <form action={deleteContentCase}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="group" value={group} />
                  <input type="hidden" name="key" value={key} />
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

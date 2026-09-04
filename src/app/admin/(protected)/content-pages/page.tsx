import Link from "next/link";
import { contentGroups } from "@/lib/data";
import { contentPageRepo, contentImageRepo, contentVideoRepo, seedContentIfEmpty } from "@/lib/repo";
import { saveContentPage, saveContentImage, deleteContentImage, saveContentVideo, deleteContentVideo } from "./actions";

export const dynamic = "force-dynamic";

const GROUP_ORDER = ["lineup", "tech", "industry", "material"];
const MAX_IMAGES = 10;
const MAX_VIDEOS = 5;

export default async function AdminContentPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; key?: string; editImage?: string; editVideo?: string }>;
}) {
  const { group: rawGroup, key: rawKey, editImage, editVideo } = await searchParams;
  const group = GROUP_ORDER.includes(rawGroup ?? "") ? (rawGroup as string) : GROUP_ORDER[0];
  const meta = contentGroups[group];
  const key = meta.items.some((i) => i.key === rawKey) ? (rawKey as string) : meta.items[0].key;

  await seedContentIfEmpty(group, meta.seeds);
  const [page, images, videos] = await Promise.all([
    contentPageRepo.get(group, key),
    contentImageRepo.listByKey(group, key),
    contentVideoRepo.listByKey(group, key),
  ]);
  const editingImage = editImage ? images.find((i) => i.id === editImage) : undefined;
  const editingVideo = editVideo ? videos.find((v) => v.id === editVideo) : undefined;
  const baseHref = `/admin/content-pages?group=${group}&key=${key}`;

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

      {/* 1~3. 제목 / 대표 이미지 / 내용(캡션+주요특징+사양서) */}
      <h2 className="text-[15px] font-bold mb-3">제목 · 대표 이미지 · 내용</h2>
      <form action={saveContentPage} className="border border-line p-5 mb-12 grid gap-3.5">
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
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">대표(설비) 이미지 URL</label>
          <input
            name="imageUrl"
            defaultValue={page?.imageUrl ?? ""}
            placeholder="https://..."
            className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">
            내용 (A4 1장 분량 권장) — 첫 줄은 이미지 아래 캡션(굵게·가운데정렬)으로, <code>[소제목]</code> 줄은 소제목으로,{" "}
            <code>- 항목</code> 줄은 목록으로, <code>| 항목 | 내용 |</code> 형식의 줄은 표(사양서)로 자동 변환됩니다
          </label>
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

      {/* 4. 적용사례 - 사진 */}
      <h2 className="text-[15px] font-bold mb-3">
        적용사례 — 사진{editingImage ? " 수정" : ""} <span className="font-mono text-ink-faint text-[12px]">({images.length}/{MAX_IMAGES})</span>
      </h2>
      {!editingImage && images.length >= MAX_IMAGES ? (
        <p className="border border-line p-5 mb-8 text-[13px] text-ink-soft">
          적용사례 사진은 최대 {MAX_IMAGES}개까지 등록할 수 있습니다. 새로 추가하려면 기존 항목을 먼저 삭제해 주세요.
        </p>
      ) : (
        <form action={saveContentImage} className="border border-line p-5 mb-8 grid gap-3.5">
          <input type="hidden" name="id" value={editingImage?.id ?? ""} />
          <input type="hidden" name="group" value={group} />
          <input type="hidden" name="key" value={key} />
          <input
            name="url"
            placeholder="이미지 URL"
            defaultValue={editingImage?.url ?? ""}
            required
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <input
            name="caption"
            placeholder="설명 (예: 제품명, 선택)"
            defaultValue={editingImage?.caption ?? ""}
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <div className="flex gap-3">
            <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
              {editingImage ? "저장" : "추가"}
            </button>
            {editingImage && (
              <Link href={baseHref} className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
                취소
              </Link>
            )}
          </div>
        </form>
      )}
      <div className="border border-line mb-12">
        {images.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 사진이 없습니다.</p>
        ) : (
          images.map((img) => (
            <div key={img.id} className="flex items-start justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex-1">
                {img.caption && <p className="font-bold">{img.caption}</p>}
                <p className="mt-1 text-[11.5px] text-ink-faint break-all">{img.url}</p>
              </div>
              <div className="flex gap-3 flex-none">
                <Link href={`${baseHref}&editImage=${img.id}`} className="text-[12px] text-blue font-bold">
                  수정
                </Link>
                <form action={deleteContentImage}>
                  <input type="hidden" name="id" value={img.id} />
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

      {/* 4. 적용사례 - 동영상 */}
      <h2 className="text-[15px] font-bold mb-3">
        적용사례 — 동영상{editingVideo ? " 수정" : ""} <span className="font-mono text-ink-faint text-[12px]">({videos.length}/{MAX_VIDEOS})</span>
      </h2>
      {!editingVideo && videos.length >= MAX_VIDEOS ? (
        <p className="border border-line p-5 mb-8 text-[13px] text-ink-soft">
          적용사례 동영상은 최대 {MAX_VIDEOS}개까지 등록할 수 있습니다. 새로 추가하려면 기존 항목을 먼저 삭제해 주세요.
        </p>
      ) : (
        <form action={saveContentVideo} className="border border-line p-5 mb-8 grid gap-3.5">
          <input type="hidden" name="id" value={editingVideo?.id ?? ""} />
          <input type="hidden" name="group" value={group} />
          <input type="hidden" name="key" value={key} />
          <input
            name="url"
            placeholder="동영상 URL"
            defaultValue={editingVideo?.url ?? ""}
            required
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <input
            name="thumbnailUrl"
            placeholder="동영상 미리보기 이미지 URL (선택)"
            defaultValue={editingVideo?.thumbnailUrl ?? ""}
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <input
            name="caption"
            placeholder="제목 (선택)"
            defaultValue={editingVideo?.caption ?? ""}
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <div className="flex gap-3">
            <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
              {editingVideo ? "저장" : "추가"}
            </button>
            {editingVideo && (
              <Link href={baseHref} className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
                취소
              </Link>
            )}
          </div>
        </form>
      )}
      <div className="border border-line">
        {videos.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 동영상이 없습니다.</p>
        ) : (
          videos.map((v) => (
            <div key={v.id} className="flex items-start justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex-1">
                {v.caption && <p className="font-bold">{v.caption}</p>}
                <p className="mt-1 text-[11.5px] text-ink-faint break-all">{v.url}</p>
              </div>
              <div className="flex gap-3 flex-none">
                <Link href={`${baseHref}&editVideo=${v.id}`} className="text-[12px] text-blue font-bold">
                  수정
                </Link>
                <form action={deleteContentVideo}>
                  <input type="hidden" name="id" value={v.id} />
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

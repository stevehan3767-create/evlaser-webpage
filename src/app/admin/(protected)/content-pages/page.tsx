import Link from "next/link";
import { contentGroups } from "@/lib/data";
import { contentPageRepo, contentImageRepo, contentVideoRepo, seedContentIfEmpty } from "@/lib/repo";
import { saveContentAll, deleteContentImage, deleteContentVideo } from "./actions";
import FileUploadField from "@/components/FileUploadField";

export const dynamic = "force-dynamic";

const GROUP_ORDER = ["lineup", "tech", "industry", "material"];
const MAX_IMAGES = 5;
const MAX_VIDEOS = 5;

const MESSAGES: Record<string, { text: string; tone: "ok" | "error" }> = {
  page_saved: { text: "저장되었습니다.", tone: "ok" },
  image_added: { text: "저장되었습니다. (사진 추가됨)", tone: "ok" },
  image_saved: { text: "저장되었습니다. (사진 수정됨)", tone: "ok" },
  image_max: { text: `저장되었습니다. 단, 적용사례 사진은 최대 ${MAX_IMAGES}개까지라 사진은 추가되지 않았습니다.`, tone: "error" },
  video_added: { text: "저장되었습니다. (동영상 추가됨)", tone: "ok" },
  video_saved: { text: "저장되었습니다. (동영상 수정됨)", tone: "ok" },
  video_max: { text: `저장되었습니다. 단, 적용사례 동영상은 최대 ${MAX_VIDEOS}개까지라 동영상은 추가되지 않았습니다.`, tone: "error" },
};

function MessageBanner({ msg }: { msg?: string }) {
  if (!msg) return null;
  const m = MESSAGES[msg];
  if (!m) return null;
  return (
    <span
      className={`inline-flex items-center px-3 py-2 text-[12.5px] font-bold rounded-sm ${
        m.tone === "ok" ? "bg-[#e9f7ee] text-[#0a7a3d] border border-[#b8e6c8] msg-blink-fade" : "bg-[#fdeceb] text-red border border-[#f5c2bd]"
      }`}
    >
      {m.text}
    </span>
  );
}

export default async function AdminContentPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; key?: string; editImage?: string; editVideo?: string; msg?: string }>;
}) {
  const { group: rawGroup, key: rawKey, editImage, editVideo, msg } = await searchParams;
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
  const imageFull = !editingImage && images.length >= MAX_IMAGES;
  const videoFull = !editingVideo && videos.length >= MAX_VIDEOS;

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

      <p className="text-[12.5px] text-ink-soft mb-4">
        아래 내용은 <b>하나의 저장 버튼</b>으로 한 번에 저장됩니다 — 제목·대표이미지·내용을 채우고, 적용사례 사진·동영상까지 함께
        입력한 뒤 맨 아래 저장 버튼을 한 번만 누르면 전부 저장됩니다.
      </p>

      <form key={`${group}-${key}-${editingImage?.id ?? "newimg"}-${editingVideo?.id ?? "newvid"}`} action={saveContentAll} className="border border-line p-5 mb-10 grid gap-8">
        <input type="hidden" name="group" value={group} />
        <input type="hidden" name="key" value={key} />

        {/* 1~3. 제목 / 대표 이미지 / 내용 */}
        <div className="grid gap-3.5">
          <h2 className="text-[15px] font-bold">제목 · 대표 이미지 · 내용</h2>
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">제목 (비워두면 기본 명칭 사용)</label>
            <input
              name="title"
              defaultValue={page?.title ?? ""}
              placeholder={meta.labelsKo[key] ?? key}
              className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
            />
          </div>
          <FileUploadField
            name="imageUrl"
            label="대표(설비) 이미지"
            defaultValue={page?.imageUrl ?? ""}
            accept="image/*"
            preview="image"
          />
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
        </div>

        {/* 4. 적용사례 - 사진 */}
        <div className="grid gap-3.5 pt-6 border-t border-line">
          <h2 className="text-[15px] font-bold flex items-center gap-2.5">
            적용사례 — 사진{editingImage ? " 수정" : " 추가"}{" "}
            <span className="font-mono text-ink-faint text-[12px]">({images.length}/{MAX_IMAGES})</span>
          </h2>
          {imageFull ? (
            <p className="text-[13px] text-ink-soft">
              적용사례 사진은 최대 {MAX_IMAGES}개까지 등록할 수 있습니다. 새로 추가하려면 기존 항목을 먼저 삭제해 주세요.
            </p>
          ) : (
            <>
              <input type="hidden" name="imgId" value={editingImage?.id ?? ""} />
              <div>
                <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">제목 (선택)</label>
                <input
                  name="imgCaption"
                  placeholder="예: 제품명"
                  defaultValue={editingImage?.caption ?? ""}
                  className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
                />
              </div>
              <div>
                <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">내용 (선택, 2줄 이내 권장)</label>
                <textarea
                  name="imgContent"
                  rows={2}
                  defaultValue={editingImage?.content ?? ""}
                  className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm resize-y"
                />
              </div>
              <FileUploadField name="imgUrl" label="이미지" defaultValue={editingImage?.url ?? ""} accept="image/*" preview="image" />
              {editingImage && (
                <Link href={baseHref} className="justify-self-start inline-flex items-center px-4 py-2 border border-line-strong text-[12.5px] font-bold rounded-sm">
                  사진 수정 취소
                </Link>
              )}
            </>
          )}
        </div>

        {/* 4. 적용사례 - 동영상 */}
        <div className="grid gap-3.5 pt-6 border-t border-line">
          <h2 className="text-[15px] font-bold flex items-center gap-2.5">
            적용사례 — 동영상{editingVideo ? " 수정" : " 추가"}{" "}
            <span className="font-mono text-ink-faint text-[12px]">({videos.length}/{MAX_VIDEOS})</span>
          </h2>
          {videoFull ? (
            <p className="text-[13px] text-ink-soft">
              적용사례 동영상은 최대 {MAX_VIDEOS}개까지 등록할 수 있습니다. 새로 추가하려면 기존 항목을 먼저 삭제해 주세요.
            </p>
          ) : (
            <>
              <input type="hidden" name="vidId" value={editingVideo?.id ?? ""} />
              <div>
                <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">제목 (선택)</label>
                <input
                  name="vidCaption"
                  placeholder="예: 적용 영상 제목"
                  defaultValue={editingVideo?.caption ?? ""}
                  className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
                />
              </div>
              <div>
                <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">내용 (선택, 2줄 이내 권장)</label>
                <textarea
                  name="vidContent"
                  rows={2}
                  defaultValue={editingVideo?.content ?? ""}
                  className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm resize-y"
                />
              </div>
              <FileUploadField
                name="vidThumbnailUrl"
                label="동영상 미리보기 이미지 (선택)"
                defaultValue={editingVideo?.thumbnailUrl ?? ""}
                accept="image/*"
                preview="image"
              />
              <FileUploadField name="vidUrl" label="동영상" defaultValue={editingVideo?.url ?? ""} accept="video/*" preview="video" />
              {editingVideo && (
                <Link href={baseHref} className="justify-self-start inline-flex items-center px-4 py-2 border border-line-strong text-[12.5px] font-bold rounded-sm">
                  동영상 수정 취소
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="justify-self-start px-6 py-3 bg-red text-white font-bold text-[13.5px]">
            저장
          </button>
          <MessageBanner msg={msg} />
        </div>
      </form>

      <h2 className="text-[15px] font-bold mb-3">등록된 적용사례 사진</h2>
      <div className="border border-line mb-10">
        {images.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 사진이 없습니다.</p>
        ) : (
          images.map((img, i) => (
            <div key={img.id} className="flex items-start gap-3.5 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-[64px] h-[64px] flex-none object-cover border border-line-strong bg-surface-alt" />
              <div className="flex-1 min-w-0">
                <p className="font-bold">
                  <span className="font-mono text-ink-faint">이미지{i + 1}</span>
                  {img.caption && <> — {img.caption}</>}
                </p>
                {img.content && <p className="mt-1 text-ink-soft whitespace-pre-wrap">{img.content}</p>}
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

      <h2 className="text-[15px] font-bold mb-3">등록된 적용사례 동영상</h2>
      <div className="border border-line">
        {videos.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 동영상이 없습니다.</p>
        ) : (
          videos.map((v, i) => (
            <div key={v.id} className="flex items-start gap-3.5 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              {v.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.thumbnailUrl} alt="" className="w-[64px] h-[64px] flex-none object-cover border border-line-strong bg-surface-alt" />
              ) : (
                <video src={v.url} className="w-[64px] h-[64px] flex-none object-cover border border-line-strong bg-ink" muted />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold">
                  <span className="font-mono text-ink-faint">동영상{i + 1}</span>
                  {v.caption && <> — {v.caption}</>}
                </p>
                {v.content && <p className="mt-1 text-ink-soft whitespace-pre-wrap">{v.content}</p>}
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

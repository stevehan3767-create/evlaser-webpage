import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Icon from "@/components/Icon";
import RichDescription from "@/components/RichDescription";
import LinkPreviewButton from "@/components/LinkPreviewButton";
import { contentGroups } from "@/lib/data";
import { contentPageRepo, contentCaseRepo, contentImageRepo, seedContentIfEmpty } from "@/lib/repo";

export const dynamic = "force-dynamic";

const GROUP_EYEBROWS: Record<string, string> = {
  lineup: "EQUIPMENT LINEUP",
  tech: "TECHNOLOGY",
  industry: "INDUSTRY",
  material: "MATERIAL",
};

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ group: string; key: string }>;
}) {
  const { group, key } = await params;
  const meta = contentGroups[group];
  const item = meta?.items.find((i) => i.key === key);
  if (!meta || !item) notFound();

  await seedContentIfEmpty(group, meta.seeds);
  const [page, cases, images, tp, tLabel] = await Promise.all([
    contentPageRepo.get(group, key),
    contentCaseRepo.listByKey(group, key),
    contentImageRepo.listByKey(group, key),
    getTranslations("contentPage"),
    meta.i18nNamespace ? getTranslations(meta.i18nNamespace) : Promise.resolve(null),
  ]);

  const label = tLabel ? tLabel(key) : meta.labelsKo[key];
  const title = page?.title || label;

  return (
    <div className="py-16 sm:py-22">
      <div className="mx-auto max-w-[900px] px-7">
        <Link href={meta.backHref} className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue mb-6">
          ← {tp("backToList")}
        </Link>

        {/* 1. 설비 제목 */}
        <span className="eyebrow">{GROUP_EYEBROWS[group]}</span>
        <div className="flex items-center gap-3 mt-2.5">
          <Icon name={item.icon} className="w-8 h-8 text-red flex-none" strokeWidth={1.5} />
          <h1 className="text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">{title}</h1>
        </div>

        {/* 2. 설비 사진 — 페이지 전체 폭, 통일된 비율 */}
        {page?.imageUrl && (
          <div className="mt-8 border border-line-strong bg-surface-alt overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={page.imageUrl} alt={title} className="w-full aspect-[16/9] object-contain bg-white" />
          </div>
        )}

        {/* 3-4. 내용 + 사양서 (본문 텍스트 안의 [소제목]과 표는 RichDescription이 자동으로 구분해 표시) */}
        <div className="mt-10">
          {page?.description ? (
            <RichDescription text={page.description} />
          ) : (
            <p className="text-ink-faint text-[13.5px]">{tp("descriptionEmpty")}</p>
          )}
        </div>

        {images.length > 0 && (
          <div className="mt-10">
            <h2 className="text-[15px] font-bold mb-4">사진</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {images.map((img) => (
                <figure key={img.id} className="border border-line-strong bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.caption ?? title} className="w-full aspect-[4/3] object-cover" />
                  {img.caption && <figcaption className="p-2.5 text-[12px] text-ink-soft border-t border-line">{img.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        )}

        {/* 5. 적용사례 (최대 5개) */}
        <div className="mt-14 pt-10 border-t border-line">
          <h2 className="text-[18px] font-bold mb-6">
            {tp("casesHeading")} <span className="font-mono text-ink-faint text-[13px]">({cases.length}/5)</span>
          </h2>

          {cases.length === 0 ? (
            <p className="text-ink-faint text-[13.5px]">{tp("casesEmpty")}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {cases.map((c) => (
                <div key={c.id} className="border border-line-strong bg-surface">
                  {(c.productImageUrl || c.equipmentImageUrl) && (
                    <div className="grid grid-cols-2 border-b border-line">
                      {c.productImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.productImageUrl} alt={c.productName} className="w-full aspect-square object-cover" />
                      ) : (
                        <div className="aspect-square bg-surface-alt" />
                      )}
                      {c.equipmentImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.equipmentImageUrl} alt={tp("equipmentImageLabel")} className="w-full aspect-square object-cover border-l border-line" />
                      ) : (
                        <div className="aspect-square bg-surface-alt border-l border-line" />
                      )}
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-2.5">
                    <h3 className="font-bold text-[14px]">{c.productName}</h3>
                    {c.videoUrl && (
                      <a href={c.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[12px] text-blue font-bold">
                        <Icon name="play" className="w-3.5 h-3.5 flex-none" />
                        {tp("videoLabel")}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. 동영상 */}
        {page?.videoUrl && (
          <div className="mt-14 pt-10 border-t border-line">
            <h2 className="text-[18px] font-bold mb-6">동영상</h2>
            <LinkPreviewButton
              url={page.videoUrl}
              label=""
              className="group relative block w-full max-w-[560px] border border-line-strong bg-ink overflow-hidden text-left"
            >
              {page.videoThumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={page.videoThumbnailUrl} alt="동영상 미리보기" className="w-full aspect-video object-cover opacity-90 group-hover:opacity-100" />
              ) : (
                <div className="w-full aspect-video bg-ink" />
              )}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-white transition-colors">
                  <Icon name="play" className="w-6 h-6 text-red translate-x-[1px]" />
                </span>
              </span>
            </LinkPreviewButton>
          </div>
        )}
      </div>
    </div>
  );
}

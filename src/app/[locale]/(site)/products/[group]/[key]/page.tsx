import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Icon from "@/components/Icon";
import RichDescription from "@/components/RichDescription";
import LinkPreviewButton from "@/components/LinkPreviewButton";
import { contentGroups } from "@/lib/data";
import { contentPageRepo, contentImageRepo, contentVideoRepo, seedContentIfEmpty } from "@/lib/repo";

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
  const [page, images, videos, tp, tLabel] = await Promise.all([
    contentPageRepo.get(group, key),
    contentImageRepo.listByKey(group, key),
    contentVideoRepo.listByKey(group, key),
    getTranslations("contentPage"),
    meta.i18nNamespace ? getTranslations(meta.i18nNamespace) : Promise.resolve(null),
  ]);

  const label = tLabel ? tLabel(key) : meta.labelsKo[key];
  const title = page?.title || label;
  const hasCases = images.length > 0 || videos.length > 0;

  return (
    <div className="py-16 sm:py-22">
      <div className="mx-auto max-w-[900px] px-7">
        <Link href={meta.backHref} className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue mb-6">
          ← {tp("backToList")}
        </Link>

        {/* 1. 제목 */}
        <span className="eyebrow">{GROUP_EYEBROWS[group]}</span>
        <div className="flex items-center gap-3 mt-2.5">
          <Icon name={item.icon} className="w-8 h-8 text-red flex-none" strokeWidth={1.5} />
          <h1 className="text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">{title}</h1>
        </div>

        {/* 2. 설비 사진 */}
        {page?.imageUrl && (
          <div className="mt-8 border border-line-strong bg-surface-alt overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={page.imageUrl} alt={title} className="w-full aspect-[16/9] object-contain bg-white" />
          </div>
        )}

        {/* 3. 내용 (캡션 + 주요특징 + 사양서) */}
        <div className="mt-10">
          {page?.description ? (
            <RichDescription text={page.description} />
          ) : (
            <p className="text-ink-faint text-[13.5px]">{tp("descriptionEmpty")}</p>
          )}
        </div>

        {/* 4. 적용사례 (사진 최대 10 + 동영상 최대 5) */}
        <div className="mt-14 pt-10 border-t border-line">
          <h2 className="text-[18px] font-bold mb-6">{tp("casesHeading")}</h2>

          {!hasCases ? (
            <p className="text-ink-faint text-[13.5px]">{tp("casesEmpty")}</p>
          ) : (
            <div className="flex flex-col gap-10">
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {images.map((img) => (
                    <figure key={img.id} className="border border-line-strong bg-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.caption ?? title} className="w-full aspect-square object-cover" />
                      {img.caption && (
                        <figcaption className="p-2 text-[12px] text-ink-soft border-t border-line text-center">{img.caption}</figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              )}

              {videos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {videos.map((v) => (
                    <div key={v.id}>
                      <LinkPreviewButton url={v.url} label="" className="group relative block w-full border border-line-strong bg-ink overflow-hidden text-left">
                        {v.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.thumbnailUrl} alt={v.caption ?? "동영상 미리보기"} className="w-full aspect-video object-cover opacity-90 group-hover:opacity-100" />
                        ) : (
                          <div className="w-full aspect-video bg-ink" />
                        )}
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-white transition-colors">
                            <Icon name="play" className="w-5 h-5 text-red translate-x-[1px]" />
                          </span>
                        </span>
                      </LinkPreviewButton>
                      {v.caption && <p className="mt-2 text-[12.5px] text-ink-soft text-center">{v.caption}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

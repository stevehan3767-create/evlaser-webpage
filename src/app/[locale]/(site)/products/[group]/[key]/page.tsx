import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Icon from "@/components/Icon";
import RichDescription from "@/components/RichDescription";
import LinkPreviewButton from "@/components/LinkPreviewButton";
import { contentGroups, type IconName } from "@/lib/data";
import {
  contentPageRepo,
  contentImageRepo,
  contentVideoRepo,
  contentItemRepo,
  lineupCategoryLinkRepo,
  seedContentIfEmpty,
  seedContentItemsIfEmpty,
} from "@/lib/repo";

const LINEUP_CATEGORY_GROUPS = new Set(["tech", "industry", "material"]);

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
  if (!meta) notFound();

  await Promise.all([seedContentIfEmpty(group, meta.seeds), seedContentItemsIfEmpty(group, meta.itemSeeds)]);
  const items = await contentItemRepo.listByGroup(group);
  const item = items.find((i) => i.itemKey === key);
  if (!item) notFound();

  const [page, images, videos, tp] = await Promise.all([
    contentPageRepo.get(group, key),
    contentImageRepo.listByKey(group, key),
    contentVideoRepo.listByKey(group, key),
    getTranslations("contentPage"),
  ]);

  const title = page?.title || item.name;
  const hasCases = images.length > 0 || videos.length > 0;

  // 기술종류별/산업분야별/재료별 상세페이지에는 그 카테고리가 등록된
  // 설비 라인업 목록을 함께 보여준다.
  let relatedLineupItems: { itemKey: string; name: string; icon: string }[] = [];
  if (LINEUP_CATEGORY_GROUPS.has(group)) {
    const relatedKeys = await lineupCategoryLinkRepo.itemKeysForCategory(group, key);
    if (relatedKeys.length > 0) {
      const lineupItems = await contentItemRepo.listByGroup("lineup");
      relatedLineupItems = lineupItems.filter((li) => relatedKeys.includes(li.itemKey));
    }
  }

  return (
    <div className="py-16 sm:py-22">
      <div className="mx-auto max-w-[900px] px-7">
        <Link href={meta.backHref} className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue mb-6">
          ← {tp("backToList")}
        </Link>

        {/* 1. 제목 */}
        <span className="eyebrow">{GROUP_EYEBROWS[group]}</span>
        <div className="flex items-center gap-3 mt-2.5">
          <Icon name={item.icon as IconName} className="w-8 h-8 text-red flex-none" strokeWidth={1.5} />
          <h1 className="text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">{title}</h1>
        </div>

        {/* 같은 그룹의 다른 항목으로 바로 이동 */}
        <div className="flex flex-wrap gap-2 mt-6">
          {items.map((it) => {
            const active = it.itemKey === key;
            return (
              <Link
                key={it.id}
                href={`/products/${group}/${it.itemKey}`}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 px-3 py-2 border rounded-sm text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-red text-white border-red"
                    : "border-line-strong text-ink-soft hover:border-blue hover:text-blue"
                }`}
              >
                <Icon name={it.icon as IconName} className="w-4 h-4 flex-none" strokeWidth={1.6} />
                {it.name}
              </Link>
            );
          })}
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

        {/* 이 기술이 적용된 설비 라인업 (기술종류별 상세페이지에서만) */}
        {relatedLineupItems.length > 0 && (
          <div className="mt-14 pt-10 border-t border-line">
            <h2 className="text-[18px] font-bold mb-6">관련 설비</h2>
            <div className="flex flex-wrap gap-2">
              {relatedLineupItems.map((li) => (
                <Link
                  key={li.itemKey}
                  href={`/products/lineup/${li.itemKey}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-line-strong rounded-sm text-[12.5px] font-semibold text-ink-soft whitespace-nowrap hover:border-blue hover:text-blue transition-colors"
                >
                  <Icon name={li.icon as IconName} className="w-4 h-4 flex-none" strokeWidth={1.6} />
                  {li.name}
                </Link>
              ))}
            </div>
          </div>
        )}

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
                      {(img.caption || img.content) && (
                        <figcaption className="p-2 text-[12px] text-ink-soft border-t border-line text-center">
                          {img.caption && <span className="block font-bold text-ink">{img.caption}</span>}
                          {img.content && <span className="block mt-0.5 whitespace-pre-wrap">{img.content}</span>}
                        </figcaption>
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
                      {v.caption && <p className="mt-2 text-[12.5px] font-bold text-ink text-center">{v.caption}</p>}
                      {v.content && <p className="mt-0.5 text-[12.5px] text-ink-soft text-center whitespace-pre-wrap">{v.content}</p>}
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

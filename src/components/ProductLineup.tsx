import { getTranslations } from "next-intl/server";
import { contentGroups } from "@/lib/data";
import { contentItemRepo, contentPageRepo, contentLinkRepo, seedContentItemsIfEmpty } from "@/lib/repo";
import LineupFinder, { type FinderCard, type FacetGroup } from "./LineupFinder";

// 파인더의 필터 축과 표시 순서. 각 설비는 이 축들에 복수 태그로 연결되며,
// 태그는 관리자모드(/admin/content-pages)에서 자유롭게 관리한다.
const FACET_GROUPS: { group: string; label: string }[] = [
  { group: "tech", label: "기술종류" },
  { group: "material", label: "재료" },
  { group: "industry", label: "산업분야" },
  { group: "oscType", label: "발진방식" },
  { group: "wavelength", label: "파장" },
  { group: "pulse", label: "펄스" },
];

export default async function ProductLineup() {
  const t = await getTranslations("productLineup");

  await Promise.all([
    seedContentItemsIfEmpty("lineup", contentGroups.lineup.itemSeeds),
    ...FACET_GROUPS.map((f) => seedContentItemsIfEmpty(f.group, contentGroups[f.group].itemSeeds)),
  ]);

  const [lineupItems, pages, ...facetData] = await Promise.all([
    contentItemRepo.listByGroup("lineup"),
    contentPageRepo.listAll().catch(() => []),
    ...FACET_GROUPS.map(async (f) => ({
      group: f.group,
      label: f.label,
      items: await contentItemRepo.listByGroup(f.group),
      links: await contentLinkRepo.listAll("lineup", f.group),
    })),
  ]);

  const imageByKey = new Map(
    pages.filter((p) => p.groupKey === "lineup" && p.imageUrl).map((p) => [p.itemKey, p.imageUrl as string])
  );

  // 설비별로 각 축에 연결된 값을 모은다: itemKey → { group → [key, ...] }
  const facetKeysByItem = new Map<string, Record<string, string[]>>();
  for (const fd of facetData) {
    for (const link of fd.links) {
      const entry = facetKeysByItem.get(link.fromKey) ?? {};
      entry[fd.group] = [...(entry[fd.group] ?? []), link.toKey];
      facetKeysByItem.set(link.fromKey, entry);
    }
  }

  const lineupCards: FinderCard[] = lineupItems.map((item) => ({
    itemKey: item.itemKey,
    name: item.name,
    icon: item.icon,
    imageUrl: imageByKey.get(item.itemKey),
    facetKeys: facetKeysByItem.get(item.itemKey) ?? {},
  }));

  // 값이 하나도 등록되지 않은 축은 필터에 표시하지 않는다.
  const facets: FacetGroup[] = facetData
    .filter((fd) => fd.items.length > 0)
    .map((fd) => ({
      group: fd.group,
      label: fd.label,
      tiles: fd.items.map((it) => ({ itemKey: it.itemKey, name: it.name, icon: it.icon })),
    }));

  return (
    <section id="lineup" className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("title")}</h2>
        <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("desc")}</p>

        <div className="mt-8">
          <LineupFinder
            lineupCards={lineupCards}
            facets={facets}
            emptyMessage="선택하신 조건에 맞는 설비가 없습니다. 조건을 줄이거나 문의해 주세요."
          />
        </div>
        <p className="mt-5 text-ink-faint text-[12px]">{t("note")}</p>
      </div>
    </section>
  );
}

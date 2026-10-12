import { contentGroups } from "@/lib/data";
import { contentItemRepo, contentPageRepo, contentLinkRepo, seedContentItemsIfEmpty } from "@/lib/repo";
import ItemCardsGrid from "./ItemCardsGrid";

// 한 그룹(tech/material 등)의 항목을 "대분류(소제목)별 섹션"으로 묶어 보여준다.
// 데이터 적재 로직은 GroupItemGrid와 동일하되, 지정된 keys 순서/묶음으로만 렌더링한다.
export default async function GroupedItemGrid({
  group,
  sections,
  minColWidth = "200px",
  iconColorClass = "text-red",
}: {
  group: string;
  sections: { heading: string; sub?: string; keys: string[] }[];
  minColWidth?: string;
  iconColorClass?: string;
}) {
  const meta = contentGroups[group];
  await seedContentItemsIfEmpty(group, meta.itemSeeds);
  const [items, pages, counts] = await Promise.all([
    contentItemRepo.listByGroup(group),
    contentPageRepo.listAll().catch(() => []),
    contentLinkRepo.countsForGroup(group).catch(() => ({} as Record<string, number>)),
  ]);
  const imageByKey = new Map(
    pages.filter((p) => p.groupKey === group && p.imageUrl).map((p) => [p.itemKey, p.imageUrl as string])
  );
  const byKey = new Map(items.map((i) => [i.itemKey, i]));

  return (
    <div className="flex flex-col gap-9">
      {sections.map((sec) => {
        const cards = sec.keys
          .map((k) => byKey.get(k))
          .filter((it): it is NonNullable<typeof it> => !!it)
          .map((item) => ({
            itemKey: item.itemKey,
            name: item.name,
            icon: item.icon,
            imageUrl: imageByKey.get(item.itemKey),
            count: counts[item.itemKey] ?? 0,
          }));
        if (cards.length === 0) return null;
        return (
          <div key={sec.heading}>
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="w-[9px] h-[9px] rounded-full bg-red flex-none" />
              <h3 className="text-[16px] sm:text-[17px] font-bold">{sec.heading}</h3>
              {sec.sub && <span className="text-[12.5px] text-ink-faint">{sec.sub}</span>}
            </div>
            <ItemCardsGrid
              items={cards}
              hrefFor={(k) => `/products/${group}/${k}`}
              minColWidth={minColWidth}
              iconColorClass={iconColorClass}
            />
          </div>
        );
      })}
    </div>
  );
}

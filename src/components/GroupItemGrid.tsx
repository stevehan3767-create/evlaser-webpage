import { contentGroups } from "@/lib/data";
import { contentItemRepo, contentPageRepo, seedContentItemsIfEmpty } from "@/lib/repo";
import ItemCardsGrid from "./ItemCardsGrid";

// Shared card grid for every static /products/[group] listing (기술종류별 /
// 산업분야별 / 재료별): a small representative-image thumbnail on top (when
// the admin has registered one) with a centered icon + name row below.
// (설비 라인업 has its own interactive, tech-category-filtered browser —
// see LineupTechBrowser — since it needs client-side filtering.)
export default async function GroupItemGrid({
  group,
  minColWidth = "190px",
  iconColorClass = "text-red",
}: {
  group: string;
  minColWidth?: string;
  iconColorClass?: string;
}) {
  const meta = contentGroups[group];
  await seedContentItemsIfEmpty(group, meta.itemSeeds);
  const [items, pages] = await Promise.all([
    contentItemRepo.listByGroup(group),
    contentPageRepo.listAll().catch(() => []),
  ]);
  const imageByKey = new Map(
    pages.filter((p) => p.groupKey === group && p.imageUrl).map((p) => [p.itemKey, p.imageUrl as string])
  );

  const cards = items.map((item) => ({
    itemKey: item.itemKey,
    name: item.name,
    icon: item.icon,
    imageUrl: imageByKey.get(item.itemKey),
  }));

  return (
    <ItemCardsGrid items={cards} hrefFor={(k) => `/products/${group}/${k}`} minColWidth={minColWidth} iconColorClass={iconColorClass} />
  );
}

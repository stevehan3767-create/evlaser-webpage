import { getTranslations } from "next-intl/server";
import { contentGroups } from "@/lib/data";
import { contentItemRepo, contentPageRepo, lineupTechLinkRepo, seedContentItemsIfEmpty } from "@/lib/repo";
import LineupTechBrowser from "./LineupTechBrowser";

export default async function ProductLineup() {
  const t = await getTranslations("productLineup");

  await Promise.all([
    seedContentItemsIfEmpty("lineup", contentGroups.lineup.itemSeeds),
    seedContentItemsIfEmpty("tech", contentGroups.tech.itemSeeds),
  ]);
  const [lineupItems, techItems, pages, links] = await Promise.all([
    contentItemRepo.listByGroup("lineup"),
    contentItemRepo.listByGroup("tech"),
    contentPageRepo.listAll().catch(() => []),
    lineupTechLinkRepo.listAll(),
  ]);
  const imageByKey = new Map(
    pages.filter((p) => p.groupKey === "lineup" && p.imageUrl).map((p) => [p.itemKey, p.imageUrl as string])
  );
  const techKeysByItem = new Map<string, string[]>();
  for (const link of links) {
    techKeysByItem.set(link.itemKey, [...(techKeysByItem.get(link.itemKey) ?? []), link.techKey]);
  }

  const lineupCards = lineupItems.map((item) => ({
    itemKey: item.itemKey,
    name: item.name,
    icon: item.icon,
    imageUrl: imageByKey.get(item.itemKey),
    techKeys: techKeysByItem.get(item.itemKey) ?? [],
  }));
  const techTiles = techItems.map((item) => ({ itemKey: item.itemKey, name: item.name, icon: item.icon }));

  return (
    <section id="lineup" className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("title")}</h2>
        <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("desc")}</p>

        <div className="mt-8">
          <LineupTechBrowser lineupCards={lineupCards} techTiles={techTiles} />
        </div>
        <p className="mt-5 text-ink-faint text-[12px]">{t("note")}</p>
      </div>
    </section>
  );
}

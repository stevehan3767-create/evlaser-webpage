import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import { lineupItems, contentGroups } from "@/lib/data";
import { contentPageRepo, seedContentIfEmpty } from "@/lib/repo";

export default async function ProductLineup() {
  const t = await getTranslations("productLineup");
  const meta = contentGroups.lineup;
  await seedContentIfEmpty("lineup", meta.seeds);
  const pages = await contentPageRepo.listAll().catch(() => []);
  const imageByKey = new Map(
    pages.filter((p) => p.groupKey === "lineup" && p.imageUrl).map((p) => [p.itemKey, p.imageUrl as string])
  );

  return (
    <section id="lineup" className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("title")}</h2>
        <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("desc")}</p>

        <div className="mt-8 grid gap-px bg-line border border-line" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
          {lineupItems.map((item) => {
            const imageUrl = imageByKey.get(item.key);
            return (
              <Link
                key={item.key}
                href={`/products/lineup/${item.key}`}
                className="group bg-surface flex flex-col hover:bg-surface-alt transition-colors"
              >
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="w-full h-[72px] object-cover bg-surface-alt border-b border-line" />
                )}
                <div className="flex-1 px-3 py-2.5 flex items-center justify-center gap-2">
                  <Icon name={item.icon} className="w-5 h-5 text-red flex-none" strokeWidth={1.5} />
                  <h3 className="text-[13.5px] font-semibold leading-snug text-center">{item.name}</h3>
                </div>
              </Link>
            );
          })}
        </div>
        <p className="mt-5 text-ink-faint text-[12px]">{t("note")}</p>
      </div>
    </section>
  );
}

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import { resourceRepo } from "@/lib/repo";
import type { IconName } from "@/lib/data";

const CATEGORIES: { key: string; icon: IconName }[] = [
  { key: "doc", icon: "doc" },
  { key: "video", icon: "play" },
  { key: "case", icon: "case" },
];

export default async function Resources({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat: rawCat } = await searchParams;
  const activeCat = CATEGORIES.some((c) => c.key === rawCat) ? (rawCat as string) : CATEGORIES[0].key;

  const t = await getTranslations("resources");
  const items = await resourceRepo.list();
  const activeItems = items.filter((i) => i.category === activeCat);
  const activeCategory = CATEGORIES.find((c) => c.key === activeCat)!;

  return (
    <section id="resources" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("title")}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/resources?cat=${c.key}`}
              className={`flex items-center gap-2 px-4 py-2 text-[13.5px] font-bold border rounded-sm transition-colors ${
                c.key === activeCat
                  ? "bg-red text-white border-red"
                  : "bg-surface text-ink-soft border-line-strong hover:border-red hover:text-red"
              }`}
            >
              <Icon name={c.icon} className="w-[17px] h-[17px]" />
              {t(`categories.${c.key}.title`)}
            </Link>
          ))}
        </div>

        <div>
          {activeItems.length === 0 ? (
            <div className="border border-line bg-surface p-6 text-[13px] text-ink-soft">
              {t(`categories.${activeCategory.key}.desc`)} — {t("emptyNote")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
              {activeItems.map((item) => (
                <div key={item.id} className="border border-line bg-surface p-5">
                  <h3 className="text-[15.5px] mb-2">{item.title}</h3>
                  <p className="text-[13px] text-ink-soft">{item.description}</p>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-[12.5px] font-bold text-blue"
                    >
                      {t("linkCta")} →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="inline-flex items-center gap-[7px] mt-8 text-[12px] text-blue bg-blue-soft border border-line-strong px-3.5 py-2.5 font-mono">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 12a8 8 0 0 1 14-5.2M20 12a8 8 0 0 1-14 5.2" />
            <polyline points="17 3 18 7 14 6.3" />
            <polyline points="7 21 6 17 10 17.7" />
          </svg>
          <span>{t("autoBadge")}</span>
        </div>
      </div>
    </section>
  );
}

import { useTranslations } from "next-intl";
import { newsItems as seedNewsItems } from "@/lib/data";
import { newsRepo, seedIfEmpty } from "@/lib/repo";

export default function News() {
  const t = useTranslations("news");
  seedIfEmpty(seedNewsItems);
  const items = newsRepo.list(true);

  return (
    <section id="news" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("title")}
          </h1>
        </div>
        <div className="border-t border-line">
          {items.length === 0 ? (
            <p className="py-8 text-ink-soft text-[13.5px]">{t("empty")}</p>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-1 sm:gap-4 items-center py-4 sm:py-5 border-b border-line"
              >
                <span className="font-mono text-[10.5px] text-blue border border-line-strong px-2 py-[3px] w-fit tracking-wide">
                  {n.tag}
                </span>
                <span className="font-semibold text-[13.5px]">{n.title}</span>
                <span className="text-ink-faint font-mono text-[12px] sm:text-right">{n.date}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

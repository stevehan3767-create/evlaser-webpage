import { getTranslations } from "next-intl/server";
import { newsItems as seedNewsItems } from "@/lib/data";
import { newsRepo, seedIfEmpty } from "@/lib/repo";
import type { NewsRow } from "@/lib/repo";

const CATEGORIES = [
  { key: "company", tag: "회사소식" },
  { key: "exhibition", tag: "전시회소식" },
  { key: "industry", tag: "산업동향" },
] as const;

function NewsRowItem({ n }: { n: NewsRow }) {
  if (!n.body) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-1 sm:gap-4 items-center py-4 sm:py-5 border-b border-line">
        <span className="font-mono text-[10.5px] text-blue border border-line-strong px-2 py-[3px] w-fit tracking-wide">{n.tag}</span>
        <span className="font-semibold text-[13.5px]">{n.title}</span>
        <span className="text-ink-faint font-mono text-[12px] sm:text-right">{n.date}</span>
      </div>
    );
  }
  return (
    <details className="group border-b border-line">
      <summary className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto] gap-1 sm:gap-4 items-center py-4 sm:py-5 cursor-pointer list-none marker:content-none">
        <span className="font-mono text-[10.5px] text-blue border border-line-strong px-2 py-[3px] w-fit tracking-wide">{n.tag}</span>
        <span className="font-semibold text-[13.5px]">{n.title}</span>
        <span className="text-ink-faint font-mono text-[12px] sm:text-right">{n.date}</span>
        <svg
          viewBox="0 0 12 8"
          className="w-3 h-2 text-ink-faint transition-transform group-open:rotate-180 justify-self-end"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 1.5 6 6.5 11 1.5" />
        </svg>
      </summary>
      <p className="pb-5 text-ink-soft text-[13.3px] leading-relaxed max-w-[80ch]">{n.body}</p>
    </details>
  );
}

export default async function News() {
  const t = await getTranslations("news");
  const tNav = await getTranslations("nav.news.items");
  await seedIfEmpty(seedNewsItems);
  const items = await newsRepo.list(true);

  return (
    <section id="news" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("title")}
          </h1>
        </div>

        {CATEGORIES.map((cat) => {
          const catItems = items.filter((n) => n.tag === cat.tag);
          return (
            <div key={cat.key} id={cat.key} className="mb-12 last:mb-0">
              <h2 className="text-[16px] font-bold mb-4">{tNav(cat.key)}</h2>
              <div className="border-t border-line">
                {catItems.length === 0 ? (
                  <p className="py-8 text-ink-soft text-[13.5px]">{t("empty")}</p>
                ) : (
                  catItems.map((n) => <NewsRowItem key={n.id} n={n} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

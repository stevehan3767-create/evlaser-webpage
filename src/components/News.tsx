import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { newsItems as seedNewsItems } from "@/lib/data";
import { newsRepo, newsImageRepo, seedIfEmpty } from "@/lib/repo";
import NewsCard from "./NewsCard";
import NewsTabs from "./NewsTabs";

const CATEGORIES = [
  { key: "company", tag: "회사소식" },
  { key: "exhibition", tag: "전시회소식" },
] as const;

const PAGE_SIZE = 15;

export default async function News({ searchParams }: { searchParams: Promise<{ cat?: string; page?: string }> }) {
  const { cat: rawCat, page: rawPage } = await searchParams;
  const activeCat = CATEGORIES.some((c) => c.key === rawCat) ? (rawCat as string) : CATEGORIES[0].key;

  const t = await getTranslations("news");
  await seedIfEmpty(seedNewsItems);
  const items = await newsRepo.list(true);
  const activeTag = CATEGORIES.find((c) => c.key === activeCat)!.tag;
  const activeItems = items.filter((n) => n.tag === activeTag);

  const totalPages = Math.max(1, Math.ceil(activeItems.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(rawPage ?? "1", 10) || 1), totalPages);
  const pageItems = activeItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const imageMap = await newsImageRepo.mapForNews(pageItems.map((n) => n.id));

  return (
    <section id="news" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("title")}
          </h1>
        </div>

        <NewsTabs active={activeCat} />

        {activeItems.length > 0 && (
          <p className="text-[12.5px] text-ink-faint mb-2">전체 {activeItems.length}건</p>
        )}

        <div className="border-t-2 border-ink/70">
          {pageItems.length === 0 ? (
            <p className="py-8 text-ink-soft text-[13.5px]">{t("empty")}</p>
          ) : (
            pageItems.map((n) => <NewsCard key={n.id} n={n} images={imageMap[n.id] ?? []} />)
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-wrap justify-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/news?cat=${activeCat}&page=${p}`}
                aria-current={p === page ? "page" : undefined}
                className={`min-w-[34px] text-center px-2.5 py-1.5 text-[13px] font-bold border rounded-sm ${
                  p === page ? "bg-blue text-white border-blue" : "bg-surface text-ink-soft border-line-strong hover:border-blue hover:text-blue"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

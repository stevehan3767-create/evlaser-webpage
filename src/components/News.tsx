import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { newsItems as seedNewsItems } from "@/lib/data";
import { newsRepo, newsImageRepo, seedIfEmpty } from "@/lib/repo";
import type { NewsRow, NewsImageRow } from "@/lib/repo";

const CATEGORIES = [
  { key: "company", tag: "회사소식" },
  { key: "exhibition", tag: "전시회소식" },
  { key: "industry", tag: "산업동향" },
] as const;

const PAGE_SIZE = 15;

function NewsImageGrid({ images }: { images: NewsImageRow[] }) {
  return (
    <div className="grid gap-3 pb-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
      {images.map((img) => (
        <figure key={img.id} className="border border-line rounded-md overflow-hidden bg-surface">
          <div className="aspect-[4/3] bg-surface-alt overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.caption ?? ""} loading="lazy" className="w-full h-full object-cover" />
          </div>
          {(img.caption || img.content) && (
            <figcaption className="px-2.5 py-2">
              {img.caption && <b className="block text-[12px] font-bold text-ink leading-snug">{img.caption}</b>}
              {img.content && <span className="block mt-0.5 text-[11px] text-ink-faint leading-snug">{img.content}</span>}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

// 목록 한 건: 썸네일 + 제목 + 3줄 미리보기 + 메타(번호·작성자·조회·등록일).
// 클릭하면 본문 전체 + 사진 그리드가 펼쳐진다.
function NewsRowItem({ n, images }: { n: NewsRow; images: NewsImageRow[] }) {
  const isNotice = n.postNo === "공지";
  const thumb = images[0]?.url ?? null;
  const hasDetail = Boolean(n.body) || images.length > 0;

  const head = (
    <div className="flex gap-4">
      {/* 썸네일 (없으면 플레이스홀더) */}
      <div className="relative flex-none w-[104px] sm:w-[132px] aspect-[4/3] rounded-md overflow-hidden border border-line bg-surface-alt">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={n.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-blue/40">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 5h16v14H4zM8 10h8M8 14h5" strokeLinecap="round" /></svg>
          </div>
        )}
      </div>
      {/* 본문 요약 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {isNotice && <span className="text-[10.5px] font-bold text-white bg-red rounded-sm px-1.5 py-0.5">공지</span>}
          {!isNotice && n.postNo && <span className="font-mono text-[11px] text-ink-faint">#{n.postNo}</span>}
          <h3 className="font-bold text-[14.5px] sm:text-[15px] text-ink min-w-0 truncate group-hover:text-blue">{n.title}</h3>
        </div>
        {n.body && (
          <p className="mt-1.5 text-[12.8px] text-ink-soft leading-relaxed line-clamp-3">
            {n.body}
          </p>
        )}
        <div className="mt-2 flex items-center gap-x-3 gap-y-0.5 flex-wrap text-[11.5px] text-ink-faint font-mono">
          {n.author && <span>{n.author}</span>}
          <span>{n.date}</span>
          {n.views != null && <span>조회 {n.views.toLocaleString()}</span>}
          {images.length > 0 && <span className="text-blue">사진 {images.length}</span>}
        </div>
      </div>
    </div>
  );

  if (!hasDetail) {
    return <div className="py-5 border-b border-line">{head}</div>;
  }
  return (
    <details className="group border-b border-line">
      <summary className="py-5 cursor-pointer list-none marker:content-none">{head}</summary>
      <div className="pb-6 pt-1">
        {n.body && <p className="mb-4 text-ink-soft text-[13.5px] leading-relaxed max-w-[80ch] whitespace-pre-line">{n.body}</p>}
        {images.length > 0 && <NewsImageGrid images={images} />}
      </div>
    </details>
  );
}

export default async function News({ searchParams }: { searchParams: Promise<{ cat?: string; page?: string }> }) {
  const { cat: rawCat, page: rawPage } = await searchParams;
  const activeCat = CATEGORIES.some((c) => c.key === rawCat) ? (rawCat as string) : CATEGORIES[0].key;

  const t = await getTranslations("news");
  const tNav = await getTranslations("nav.news.items");
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

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/news?cat=${c.key}`}
              className={`px-4 py-2 text-[13.5px] font-bold border rounded-sm transition-colors ${
                c.key === activeCat
                  ? "bg-red text-white border-red"
                  : "bg-surface text-ink-soft border-line-strong hover:border-red hover:text-red"
              }`}
            >
              {tNav(c.key)}
            </Link>
          ))}
        </div>

        {activeItems.length > 0 && (
          <p className="text-[12.5px] text-ink-faint mb-2">전체 {activeItems.length}건</p>
        )}

        <div className="border-t border-line">
          {pageItems.length === 0 ? (
            <p className="py-8 text-ink-soft text-[13.5px]">{t("empty")}</p>
          ) : (
            pageItems.map((n) => <NewsRowItem key={n.id} n={n} images={imageMap[n.id] ?? []} />)
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

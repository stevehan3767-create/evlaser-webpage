import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { newsItems as seedNewsItems } from "@/lib/data";
import { newsRepo, newsImageRepo, seedIfEmpty } from "@/lib/repo";
import type { NewsRow, NewsImageRow } from "@/lib/repo";
import NewsCollapseButton from "./NewsCollapseButton";

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
const ROW_COLS = "grid grid-cols-[44px_48px_1fr] sm:grid-cols-[72px_56px_1fr_90px_110px] gap-x-3 sm:gap-x-4 items-center";

function NewsRowItem({ n, images }: { n: NewsRow; images: NewsImageRow[] }) {
  const isNotice = n.postNo === "공지";
  const thumb = images[0]?.url ?? null;
  const hasDetail = Boolean(n.body) || images.length > 0;

  const no = (
    <div className="text-center">
      {isNotice ? (
        <span className="inline-block text-[11px] font-bold text-white bg-red rounded-[5px] px-1.5 py-0.5">공지</span>
      ) : (
        <span className="font-mono text-[12.5px] text-ink-faint">{n.postNo ?? ""}</span>
      )}
    </div>
  );
  const thumbCell = (
    <div className="flex justify-center">
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" loading="lazy" className="w-11 h-11 object-cover rounded-md border border-line" />
      ) : (
        <span className="w-11 h-11 rounded-md border border-dashed border-line-strong bg-surface-alt" />
      )}
    </div>
  );
  const titleCell = (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="truncate font-semibold text-[14px] sm:text-[14.5px] text-ink group-hover:text-blue">{n.title}</span>
        {hasDetail && (
          <svg viewBox="0 0 12 8" className="flex-none w-2.5 h-2 text-ink-faint transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1.5 6 6.5 11 1.5" />
          </svg>
        )}
      </div>
      {/* 모바일: 등록일·조회를 제목 아래로 */}
      <div className="sm:hidden mt-1 flex gap-2.5 text-[11px] font-mono text-ink-faint">
        <span>{n.date}</span>
        {n.views != null && <span>조회 {n.views.toLocaleString()}</span>}
      </div>
    </div>
  );
  const viewsCell = <div className="hidden sm:block text-right font-mono text-[12.5px] text-ink-faint">{n.views != null ? n.views.toLocaleString() : ""}</div>;
  const dateCell = <div className="hidden sm:block text-right font-mono text-[12.5px] text-ink-faint">{n.date}</div>;

  const summaryInner = (
    <>
      {no}
      {thumbCell}
      {titleCell}
      {viewsCell}
      {dateCell}
    </>
  );

  if (!hasDetail) {
    return <div className={`${ROW_COLS} py-3 border-b border-line`}>{summaryInner}</div>;
  }
  return (
    <details className="group border-b border-line">
      <summary className={`${ROW_COLS} py-3 cursor-pointer list-none marker:content-none`}>{summaryInner}</summary>
      <div className="pb-7 pt-2 sm:pl-[116px]">
        {n.body && <p className="mb-4 text-ink-soft text-[13.5px] leading-relaxed max-w-[80ch] whitespace-pre-line">{n.body}</p>}
        {images.length > 0 && <NewsImageGrid images={images} />}
        <div className="mt-3 flex justify-center">
          <NewsCollapseButton />
        </div>
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

        {/* 게시판 헤더 (PC) */}
        {pageItems.length > 0 && (
          <div className={`${ROW_COLS} hidden sm:grid py-2.5 border-t-2 border-ink/70 border-b border-line-strong text-[12.5px] font-bold text-ink-soft`}>
            <span className="text-center">번호</span>
            <span />
            <span>제목</span>
            <span className="text-right">조회</span>
            <span className="text-right">등록일</span>
          </div>
        )}

        <div className="border-t border-line sm:border-t-0">
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

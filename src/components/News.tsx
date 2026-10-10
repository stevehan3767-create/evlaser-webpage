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

// 게시판형 한 행: 번호 · 제목 · 작성자 · 조회 · 등록일 (클릭 시 본문/사진 펼침)
function NewsRowItem({ n, images }: { n: NewsRow; images: NewsImageRow[] }) {
  const isNotice = n.postNo === "공지";
  const cols = "grid grid-cols-[48px_1fr_auto] sm:grid-cols-[64px_1fr_90px_70px_96px] gap-x-3 gap-y-1 items-center";
  const no = isNotice ? (
    <span className="text-[11px] font-bold text-white bg-red rounded-sm px-1.5 py-0.5 w-fit">공지</span>
  ) : (
    <span className="font-mono text-[12.5px] text-ink-faint">{n.postNo ?? ""}</span>
  );
  const meta = (
    <>
      <span className="hidden sm:block text-[12.5px] text-ink-soft text-center">{n.author ?? "-"}</span>
      <span className="hidden sm:block text-[12px] text-ink-faint font-mono text-center">
        {n.views != null ? n.views.toLocaleString() : "-"}
      </span>
      <span className="text-[12px] text-ink-faint font-mono sm:text-right">{n.date}</span>
    </>
  );
  const hasDetail = Boolean(n.body) || images.length > 0;

  if (!hasDetail) {
    return (
      <div className={`${cols} py-3.5 border-b border-line`}>
        {no}
        <span className="font-semibold text-[13.5px] min-w-0 truncate">{n.title}</span>
        {meta}
      </div>
    );
  }
  return (
    <details className="group border-b border-line">
      <summary className={`${cols} py-3.5 cursor-pointer list-none marker:content-none`}>
        {no}
        <span className="font-semibold text-[13.5px] min-w-0 group-hover:text-blue">
          {n.title}
          <svg viewBox="0 0 12 8" className="inline-block ml-1.5 w-2.5 h-2 text-ink-faint transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1.5 6 6.5 11 1.5" />
          </svg>
        </span>
        {meta}
      </summary>
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

        {/* 게시판 헤더 (PC) */}
        {pageItems.length > 0 && (
          <div className="hidden sm:grid grid-cols-[64px_1fr_90px_70px_96px] gap-x-3 py-2.5 border-y-2 border-ink/70 text-[12px] font-bold text-ink-soft">
            <span className="text-center">번호</span>
            <span>제목</span>
            <span className="text-center">작성자</span>
            <span className="text-center">조회</span>
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

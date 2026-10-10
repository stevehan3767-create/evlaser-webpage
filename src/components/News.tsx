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

// 이미지 테두리 스타일 A: 둥근 모서리 + 부드러운 그림자 (실선 제거)
const IMG_SHADOW = "shadow-[0_6px_18px_rgba(17,20,24,0.14),0_1px_3px_rgba(17,20,24,0.08)]";

function NewsImageGrid({ images }: { images: NewsImageRow[] }) {
  return (
    <div className="grid gap-4 pb-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
      {images.map((img) => (
        <figure key={img.id} className={`rounded-xl overflow-hidden bg-surface ${IMG_SHADOW}`}>
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

// 목록 한 건: 썸네일 + (번호·제목 / 우측 메타) + 2줄 미리보기.
// 클릭하면 같은 본문이 펼쳐지고(line-clamp 해제) 사진 그리드가 이어서 표시된다.
function NewsRowItem({ n, images }: { n: NewsRow; images: NewsImageRow[] }) {
  const isNotice = n.postNo === "공지";
  const thumb = images[0]?.url ?? null;
  const hasDetail = Boolean(n.body) || images.length > 0;

  const meta = (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11.5px] sm:text-[12px] text-ink-faint">
      <span>등록일: <span className="font-mono">{n.date}</span></span>
      {n.views != null && <span>조회 {n.views.toLocaleString()}</span>}
      {images.length > 0 && <span className="font-semibold text-blue">사진 {images.length}</span>}
    </div>
  );

  const thumbEl = (
    <div className="flex-none">
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" loading="lazy" className={`w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl ${IMG_SHADOW}`} />
      ) : (
        <span className="block w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-dashed border-line-strong bg-surface-alt" />
      )}
    </div>
  );

  const content = (
    <div className="min-w-0 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {isNotice ? (
            <span className="flex-none inline-block text-[11px] font-bold text-white bg-red rounded-[5px] px-1.5 py-0.5">공지</span>
          ) : (
            n.postNo && <span className="flex-none font-mono text-[12.5px] text-ink-faint">#{n.postNo}</span>
          )}
          <span className="truncate font-bold text-[15px] sm:text-[16px] text-ink group-hover:text-blue">{n.title}</span>
          {hasDetail && (
            <svg viewBox="0 0 12 8" className="flex-none w-2.5 h-2 text-ink-faint transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1.5 6 6.5 11 1.5" />
            </svg>
          )}
        </div>
        <div className="flex-none">{meta}</div>
      </div>
      {n.body && (
        <p className="mt-2 max-w-[85ch] text-ink-soft text-[13px] sm:text-[13.5px] leading-relaxed whitespace-pre-line line-clamp-2 group-open:line-clamp-none">
          {n.body}
        </p>
      )}
    </div>
  );

  if (!hasDetail) {
    return <div className="flex gap-4 sm:gap-5 py-5 border-b border-line">{thumbEl}{content}</div>;
  }
  return (
    <details className="group border-b border-line">
      <summary className="flex gap-4 sm:gap-5 py-5 cursor-pointer list-none marker:content-none">
        {thumbEl}
        {content}
      </summary>
      <div className="pb-7 pt-1 sm:pl-[148px]">
        {images.length > 0 && <NewsImageGrid images={images} />}
        <div className="mt-1 flex justify-center sm:justify-start">
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

        <div className="border-t-2 border-ink/70">
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

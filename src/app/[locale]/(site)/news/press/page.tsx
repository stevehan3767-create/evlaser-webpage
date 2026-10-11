import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/Breadcrumb";
import NewsTabs from "@/components/NewsTabs";
import PressBody from "@/components/PressBody";
import { pressRepo } from "@/lib/repo";
import type { PressItemRow } from "@/lib/repo";

export const metadata: Metadata = {
  title: "뉴스·소식 · 언론·연구활동 | EV Laser",
  description: "㈜이브이레이저의 언론보도, 방송, 논문·학회 발표 등 대외 활동 소식입니다.",
};

export const dynamic = "force-dynamic";

// 언론보도와 방송을 "언론·방송"(media)으로 통합. (broadcast 레거시는 media로 표시)
function catLabel(t: (k: string) => string, category: string): string {
  return t(`press.tabs.${category === "broadcast" ? "media" : category}`);
}

function ThumbWrap({ href, children }: { href: string | null; children: ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block group">
      {children}
    </a>
  );
}

function PressCard({ item, t }: { item: PressItemRow; t: (k: string) => string }) {
  return (
    <article className="py-7 border-b border-line">
      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-5">
        {/* 썸네일 또는 카테고리 플레이스홀더 (영상이면 클릭 시 재생, 기사면 PDF 원문 열림) */}
        <div className="relative hidden sm:block">
          <ThumbWrap href={item.linkUrl ?? item.pdfUrl}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-surface-alt">
              {item.thumbnailUrl ? (
                <>
                  {/* 외부(YouTube 등) 썸네일 지원을 위해 일반 img 사용 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.thumbnailUrl} alt={item.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  {item.linkUrl && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 ml-0.5" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </span>
                  )}
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-blue/70">
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M4 5h16v14H4zM8 9h8M8 13h8M8 17h5" strokeLinecap="round" />
                  </svg>
                  <span className="text-[11px] font-bold">{catLabel(t, item.category)}</span>
                </div>
              )}
            </div>
          </ThumbWrap>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block text-[11px] font-bold text-white bg-blue rounded-sm px-2 py-0.5">
              {catLabel(t, item.category)}
            </span>
            <span className="text-[12px] text-ink-faint font-mono">
              {[item.source, item.date].filter(Boolean).join(" · ")}
            </span>
          </div>

          <h3 className="mt-2 text-[16px] sm:text-[17px] font-bold leading-snug text-ink">{item.title}</h3>

          {/* 본문(클릭 전 3줄 미리보기) + 전문 보기·원문 보기·다운로드를 한 줄에 나란히 */}
          <PressBody
            body={item.body}
            linkUrl={item.linkUrl}
            pdfUrl={item.pdfUrl}
            pdfName={item.pdfName}
            viewOriginalLabel={t("press.viewOriginal")}
            downloadLabel={t("press.download")}
          />
        </div>
      </div>
    </article>
  );
}

export default async function NewsPressPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat: rawCat } = await searchParams;
  // 논문·학술소식(paper) / 언론·방송소식(media) 두 카테고리. 기본은 언론·방송.
  const activeCat: "media" | "paper" = rawCat === "paper" ? "paper" : "media";

  const tRaw = await getTranslations("company");
  const t = (k: string): string => tRaw(k);
  const tNews = await getTranslations("news");
  const tTab = await getTranslations("nav.news.items");
  const items = await pressRepo.list(true).catch(() => []);
  const visible = items.filter((i) => i.category === activeCat);

  return (
    <section className="pt-12 pb-16 sm:pb-22 border-b border-line bg-surface-alt">
      <div className="mx-auto max-w-[1240px] px-7">
        <Breadcrumb items={[{ label: "뉴스·소식", href: "/news" }, { label: tTab(activeCat) }]} />
        <div className="mt-2.5 mb-8">
          <span className="eyebrow">{tNews("eyebrow")}</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{tNews("title")}</h1>
        </div>

        <NewsTabs active={activeCat} />

        <div className="border-t-2 border-ink/70">
          {visible.length === 0 ? (
            <p className="py-10 text-ink-soft text-[13.5px]">{t("press.empty")}</p>
          ) : (
            visible.map((item) => <PressCard key={item.id} item={item} t={t} />)
          )}
        </div>
      </div>
    </section>
  );
}

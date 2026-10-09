import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pressRepo } from "@/lib/repo";
import type { PressItemRow } from "@/lib/repo";

export const metadata: Metadata = {
  title: "회사소개 · 언론·연구활동 | EV Laser",
  description: "㈜이브이레이저의 언론보도, 방송, 논문·학회 발표 등 대외 활동 소식입니다.",
};

export const dynamic = "force-dynamic";

// 언론보도와 방송을 "언론·방송"(media)으로 통합. (broadcast 레거시는 media로 표시)
const CATEGORIES = ["all", "media", "paper"] as const;
type Cat = (typeof CATEGORIES)[number];

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

function excerpt(body: string, max = 180): string {
  const clean = body.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
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

          {item.body && <p className="mt-2 text-[13.5px] text-ink-soft leading-relaxed">{excerpt(item.body)}</p>}

          <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
            {item.linkUrl && (
              <a
                href={item.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-3.5 py-2 text-[12.5px] font-bold text-ink-soft hover:border-blue hover:text-blue transition-colors"
              >
                {t("press.viewOriginal")} ↗
              </a>
            )}
            {item.pdfUrl && (
              <a
                href={item.pdfUrl}
                download={item.pdfName ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-sm bg-red px-3.5 py-2 text-[12.5px] font-bold text-white hover:bg-[#c40025] transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
                </svg>
                {t("press.download")}
              </a>
            )}
          </div>

          {/* 전문(검색 가능) — 펼쳐 보기 */}
          {item.body && (
            <details className="group mt-3">
              <summary className="cursor-pointer list-none text-[12.5px] font-bold text-blue inline-flex items-center gap-1">
                <span className="group-open:hidden">전문 보기 ▾</span>
                <span className="hidden group-open:inline">접기 ▴</span>
              </summary>
              <div className="mt-3 whitespace-pre-line text-[13.5px] text-ink-soft leading-relaxed max-w-[75ch] border-t border-line pt-4">
                {item.body}
              </div>
            </details>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function CompanyPressPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat: rawCat } = await searchParams;
  const activeCat: Cat = CATEGORIES.includes(rawCat as Cat) ? (rawCat as Cat) : "all";

  const tRaw = await getTranslations("company");
  const t = (k: string): string => tRaw(k);
  const items = await pressRepo.list(true).catch(() => []);
  const visible = activeCat === "all" ? items : items.filter((i) => i.category === activeCat);

  return (
    <section className="pt-10 pb-16 sm:pt-12 sm:pb-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">{t("press.eyebrow")}</span>
        <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("press.title")}</h2>
        <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("press.summary")}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={c === "all" ? "/company/press" : `/company/press?cat=${c}`}
              className={`px-4 py-2 text-[13px] font-bold border rounded-sm transition-colors ${
                c === activeCat
                  ? "bg-red text-white border-red"
                  : "bg-surface text-ink-soft border-line-strong hover:border-red hover:text-red"
              }`}
            >
              {t(`press.tabs.${c}`)}
            </Link>
          ))}
        </div>

        <div className="mt-6 border-t border-line">
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

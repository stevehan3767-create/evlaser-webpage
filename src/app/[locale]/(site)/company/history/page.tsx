import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "회사소개 · 연혁 | EV Laser",
  description: "㈜이브이레이저의 주요 연혁을 연도별로 확인하세요.",
};

interface HistoryYear {
  year: string;
  items: string[];
}

export default async function CompanyHistoryPage() {
  const t = await getTranslations("company");
  // 연혁은 최신 연도가 맨 위로 오도록 내림차순 정렬한다 (번역 파일의 순서와 무관).
  const historyItems = [...(t.raw("history.items") as HistoryYear[])].sort((a, b) => {
    const ya = parseInt(a.year, 10);
    const yb = parseInt(b.year, 10);
    if (Number.isNaN(ya) || Number.isNaN(yb)) return b.year.localeCompare(a.year);
    return yb - ya;
  });

  return (
    <section className="pt-10 pb-16 sm:pt-12 sm:pb-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">{t("history.eyebrow")}</span>
        <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("history.title")}</h2>
        <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("history.summary")}</p>
        <div className="mt-8 border-t border-line-strong">
          {historyItems.map((h) => (
            <div key={h.year} className="flex gap-6 py-4 border-b border-line">
              <span className="font-mono font-bold text-blue w-[64px] flex-none">{h.year}</span>
              <ul className="flex flex-col gap-1">
                {h.items.map((item, i) => (
                  <li key={i} className="text-ink-soft text-[13.8px]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-ink-faint text-[12.5px]">{t("history.moreNote")}</p>
      </div>
    </section>
  );
}

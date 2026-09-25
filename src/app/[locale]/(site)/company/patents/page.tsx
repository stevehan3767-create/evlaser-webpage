import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { patents, certifications } from "@/lib/data";

export const metadata: Metadata = {
  title: "회사소개 · 특허·인증 | EV Laser",
  description: "㈜이브이레이저가 보유한 특허와 국내·국제 인증 현황입니다.",
};

export default async function CompanyPatentsPage() {
  const t = await getTranslations("company");

  return (
    <section className="pt-10 pb-16 sm:pt-12 sm:pb-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">{t("patents.eyebrow")}</span>
        <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("patents.title")}</h2>
        <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("patents.summary")}</p>

        <h3 className="mt-10 mb-4 text-[16px] font-bold">
          {t("patents.patentsHeading")} <span className="font-mono text-ink-faint text-[13px]">({patents.length})</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {patents.map((p, i) => (
            <a
              key={i}
              href={p.image}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-line-strong bg-surface hover:border-blue transition-colors"
            >
              <div className="relative aspect-[248/371] bg-surface-alt">
                <Image src={p.image} alt={p.title} fill sizes="200px" className="object-contain" />
              </div>
              <p className="p-2 text-[11px] text-ink-soft leading-snug line-clamp-3">{p.title}</p>
            </a>
          ))}
        </div>

        <h3 className="mt-12 mb-4 text-[16px] font-bold">
          {t("patents.certsHeading")} <span className="font-mono text-ink-faint text-[13px]">({certifications.length})</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {certifications.map((c, i) => (
            <a
              key={i}
              href={c.image}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-line-strong bg-surface hover:border-blue transition-colors"
            >
              <div className="relative aspect-[248/371] bg-surface-alt">
                <Image src={c.image} alt={c.title} fill sizes="200px" className="object-contain" />
              </div>
              <div className="p-2">
                <p className="text-[11px] text-ink-soft leading-snug line-clamp-2">{c.title}</p>
                {c.subtitle && <p className="text-[10.5px] text-ink-faint leading-snug mt-0.5">{c.subtitle}</p>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

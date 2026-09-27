import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "회사소개 · 인사말 | EV Laser",
  description: "㈜이브이레이저(EVLASER CO., LTD.) 인사말과 회사 개요를 소개합니다.",
};

export default async function CompanyOverviewPage() {
  const t = await getTranslations("company");
  const greetingParagraphs = t.raw("greeting.paragraphs") as string[];

  return (
    <section className="pt-10 pb-16 sm:pt-12 sm:pb-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="max-w-[68ch]">
          <span className="eyebrow">{t("greeting.eyebrow")}</span>
          <h2 className="mt-2.5 text-[22px] sm:text-[28px] font-[family-name:var(--font-display)] tracking-tight">
            {t("greeting.title")}
          </h2>
          <div className="mt-5 flex flex-col gap-4">
            {greetingParagraphs.map((p, i) => (
              <p key={i} className="text-ink-soft text-[15px] leading-relaxed">
                {p}
              </p>
            ))}
          </div>
          <p className="mt-6 font-bold text-ink text-[14px]">{t("greeting.signature")}</p>
        </div>

        {/* 대표 설비 이미지 — 무인자동화 레이저용접시스템 */}
        <figure className="mt-12 max-w-[960px]">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { src: "/images/company/auto-laser-welding-2.webp", w: 1725, h: 922 },
              { src: "/images/company/auto-laser-welding-1.webp", w: 1280, h: 960 },
            ].map((img) => (
              <div key={img.src} className="relative aspect-[4/3] border border-line-strong bg-surface-alt overflow-hidden">
                <Image
                  src={img.src}
                  alt="무인자동화 레이저용접시스템"
                  fill
                  sizes="(max-width: 640px) 100vw, 480px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <figcaption className="mt-3 text-[13px] text-ink-soft">
            <span className="font-bold text-ink">무인자동화 레이저용접시스템</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

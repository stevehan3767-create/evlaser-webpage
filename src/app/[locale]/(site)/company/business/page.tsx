import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "회사소개 · 사업분야 | EV Laser",
  description: "㈜이브이레이저의 레이저 응용 사업분야를 소개합니다.",
};

export default async function CompanyBusinessPage() {
  const t = await getTranslations("company");

  return (
    <section className="pt-10 pb-16 sm:pt-12 sm:pb-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">{t("business.eyebrow")}</span>
        <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("business.title")}</h2>
        <p className="text-ink-soft max-w-[58ch] mt-2.5">{t("business.desc")}</p>
        <Link href="/products" className="inline-flex items-center gap-2 mt-5 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025]">
          {t("business.cta")}
        </Link>
      </div>
    </section>
  );
}

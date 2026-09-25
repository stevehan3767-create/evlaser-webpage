import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/Breadcrumb";
import CompanyNav from "@/components/CompanyNav";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("company");

  return (
    <>
      <div className="mx-auto max-w-[1240px] px-7 pt-12">
        <Breadcrumb items={[{ label: t("title") }]} />
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1 className="mt-2.5 text-[28px] sm:text-[38px] font-[family-name:var(--font-display)] tracking-tight text-balance">
          {t("title")}
        </h1>
        <CompanyNav />
      </div>
      {children}
    </>
  );
}

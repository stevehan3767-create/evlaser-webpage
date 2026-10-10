import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/Breadcrumb";
import CompanyNav from "@/components/CompanyNav";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("company");

  return (
    <>
      {/* 섹션 대제목은 각 하위 페이지의 제목과 중복되므로 생략하고, 브레드크럼 + 탭만 제공 */}
      <div className="mx-auto max-w-[1240px] px-7 pt-10">
        <Breadcrumb items={[{ label: t("title") }]} />
        <CompanyNav />
      </div>
      {children}
    </>
  );
}

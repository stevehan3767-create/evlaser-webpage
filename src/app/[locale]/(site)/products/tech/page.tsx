import type { Metadata } from "next";
import TechSolutions from "@/components/TechSolutions";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "기술종류별 | EV Laser",
  description: "레이저 절단·용접·마킹·클리닝 등 ㈜이브이레이저의 레이저 가공 기술을 종류별로 소개합니다.",
};

export default function TechPage() {
  return (
    <>
      <div className="mx-auto max-w-[1240px] px-7 pt-12">
        <Breadcrumb items={[{ label: "제품·기술", href: "/products" }, { label: "기술종류별" }]} />
        <span className="eyebrow">PRODUCTS & TECHNOLOGY</span>
        <h1 className="mt-2.5 text-[28px] sm:text-[38px] font-[family-name:var(--font-display)] tracking-tight text-balance">
          기술종류별
        </h1>
      </div>
      <TechSolutions />
    </>
  );
}

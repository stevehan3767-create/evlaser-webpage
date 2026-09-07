import type { Metadata } from "next";
import TechSolutions from "@/components/TechSolutions";
import ProductLineup from "@/components/ProductLineup";

export const metadata: Metadata = {
  title: "제품·기술 | EV Laser",
  description: "설비 라인업과 레이저 절단·용접·마킹·클리닝 등 레이저 기술을 소개합니다.",
};

export default function ProductsPage() {
  return (
    <>
      <div className="mx-auto max-w-[1240px] px-7 pt-12">
        <span className="eyebrow">PRODUCTS & TECHNOLOGY</span>
        <h1 className="mt-2.5 text-[28px] sm:text-[38px] font-[family-name:var(--font-display)] tracking-tight text-balance">
          제품·기술
        </h1>
      </div>
      <ProductLineup />
      <TechSolutions />
    </>
  );
}

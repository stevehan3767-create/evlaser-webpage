import type { Metadata } from "next";
import ProductLineup from "@/components/ProductLineup";

export const metadata: Metadata = {
  title: "설비 라인업 | EV Laser",
  description: "㈜이브이레이저의 레이저 설비 라인업입니다. 기술·재료·산업 조건으로 원하는 설비를 찾을 수 있습니다.",
};

export default function LineupPage() {
  return (
    <>
      <div className="mx-auto max-w-[1240px] px-7 pt-12">
        <span className="eyebrow">PRODUCTS & TECHNOLOGY</span>
        <h1 className="mt-2.5 text-[28px] sm:text-[38px] font-[family-name:var(--font-display)] tracking-tight text-balance">
          설비 라인업
        </h1>
      </div>
      <ProductLineup />
    </>
  );
}

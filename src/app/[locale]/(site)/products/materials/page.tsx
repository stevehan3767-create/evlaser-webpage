import type { Metadata } from "next";
import Materials from "@/components/Materials";

export const metadata: Metadata = {
  title: "재료별 | EV Laser",
  description: "㈜이브이레이저의 레이저 기술이 적용되는 재료별 소개입니다.",
};

export default function MaterialsPage() {
  return (
    <>
      <div className="mx-auto max-w-[1240px] px-7 pt-12">
        <span className="eyebrow">PRODUCTS & TECHNOLOGY</span>
        <h1 className="mt-2.5 text-[28px] sm:text-[38px] font-[family-name:var(--font-display)] tracking-tight text-balance">
          재료별
        </h1>
      </div>
      <Materials />
    </>
  );
}

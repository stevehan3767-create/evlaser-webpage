import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import GroupItemGrid from "@/components/GroupItemGrid";

export const metadata: Metadata = {
  title: "레이저 안전 | EV Laser",
  description:
    "레이저 안전 보안경·윈도우·차폐커튼·경고표지 등 레이저 안전 제품과 사양을 소개합니다. (laservision 협력)",
};

export default function LaserSafetyPage() {
  return (
    <>
      <div className="mx-auto max-w-[1240px] px-7 pt-12">
        <Breadcrumb items={[{ label: "제품·기술", href: "/products" }, { label: "레이저 안전" }]} />
        <span className="eyebrow">LASER SAFETY</span>
        <h1 className="mt-2.5 text-[28px] sm:text-[38px] font-[family-name:var(--font-display)] tracking-tight text-balance">
          레이저 안전
        </h1>
        <p className="mt-3 max-w-[72ch] text-ink-soft text-[14px] leading-relaxed">
          레이저는 강력한 도구인 만큼, 올바른 안전 대책이 함께해야 합니다. ㈜이브이레이저는 글로벌 레이저 안전 전문기업{" "}
          <b className="text-ink">laservision</b>과 협력하여, 작업 환경과 레이저 등급에 맞는 보호구·차폐·표지 솔루션을 제공합니다.
          아래 제품을 선택하면 특징과 사양을 확인하실 수 있습니다.
        </p>
      </div>

      <section className="pt-8 pb-16 sm:pb-22 border-b border-line">
        <div className="mx-auto max-w-[1240px] px-7">
          <GroupItemGrid group="safety" minColWidth="230px" iconColorClass="text-red" />
          <div className="mt-8 rounded-md border border-line-strong bg-surface-alt px-5 py-4">
            <p className="text-[13px] text-ink-soft leading-relaxed">
              <b className="text-ink">적용 표준</b> — 레이저 안전 제품은 국제 표준(EN 207/208, EN 12254, ANSI Z136,
              IEC 60825 등)을 준수합니다. 사용 레이저의 파장·출력·등급에 맞는 제품 선정이 필요하며, 자세한 사항은{" "}
              <b className="text-ink">문의하기</b>를 통해 상담해 주세요.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

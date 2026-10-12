import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import GroupItemGrid from "@/components/GroupItemGrid";
import GroupedItemGrid from "@/components/GroupedItemGrid";
import { techCategoryGroups, laserComponentKeys } from "@/lib/data";

export const metadata: Metadata = {
  title: "기술·재료 소개 | EV Laser",
  description:
    "레이저 절단·용접·마킹·클리닝·열처리·클래딩 등 가공 기술과, 금속·플라스틱·유리 등 재료별 레이저 적용을 소개합니다.",
};

export default function ProductsGuidePage() {
  const techSections = techCategoryGroups.map((g) => ({ heading: g.label, keys: g.keys }));

  return (
    <>
      <div className="mx-auto max-w-[1240px] px-7 pt-12">
        <Breadcrumb items={[{ label: "제품·기술", href: "/products" }, { label: "기술·재료 소개" }]} />
        <span className="eyebrow">PRODUCTS & TECHNOLOGY</span>
        <h1 className="mt-2.5 text-[28px] sm:text-[38px] font-[family-name:var(--font-display)] tracking-tight text-balance">
          기술·재료 소개
        </h1>
        <p className="mt-3 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">
          ㈜이브이레이저의 레이저 가공 기술과 적용 재료를 소개합니다. 실제 설비는{" "}
          <b className="text-ink">설비 찾기</b>에서 기술·재료·산업 조건으로 바로 찾아보실 수 있습니다.
        </p>
      </div>

      {/* 기술종류별 — 5개 대분류로 그룹화 */}
      <section id="tech" className="pt-8 pb-14 sm:pb-18 border-b border-line">
        <div className="mx-auto max-w-[1240px] px-7">
          <h2 className="mb-6 text-[20px] sm:text-[24px] font-[family-name:var(--font-display)] tracking-tight">
            기술종류별 <span className="text-[14px] text-ink-faint font-sans">(가공 기술로 보기)</span>
          </h2>
          <GroupedItemGrid group="tech" sections={techSections} minColWidth="200px" iconColorClass="text-red" />
        </div>
      </section>

      {/* 재료별 */}
      <section id="material" className="pt-10 pb-14 sm:pb-18 border-b border-line bg-surface-alt">
        <div className="mx-auto max-w-[1240px] px-7">
          <h2 className="mb-5 text-[20px] sm:text-[24px] font-[family-name:var(--font-display)] tracking-tight">
            재료별 <span className="text-[14px] text-ink-faint font-sans">(가공 소재로 보기)</span>
          </h2>
          <GroupItemGrid group="material" minColWidth="150px" iconColorClass="text-blue" />
        </div>
      </section>

      {/* 레이저 구성요소 — 가공 기술과 분리 */}
      <section id="components" className="pt-10 pb-16 sm:pb-22 border-b border-line">
        <div className="mx-auto max-w-[1240px] px-7">
          <h2 className="mb-5 text-[20px] sm:text-[24px] font-[family-name:var(--font-display)] tracking-tight">
            레이저 구성요소 <span className="text-[14px] text-ink-faint font-sans">(발진기·빔전송·측정·보조장치)</span>
          </h2>
          <GroupedItemGrid
            group="tech"
            sections={[{ heading: "구성요소", keys: laserComponentKeys }]}
            minColWidth="200px"
            iconColorClass="text-ink-soft"
          />
        </div>
      </section>
    </>
  );
}

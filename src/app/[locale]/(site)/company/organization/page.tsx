import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Icon from "@/components/Icon";
import { orgChart } from "@/lib/data";

export const metadata: Metadata = {
  title: "회사소개 · 조직도 | EV Laser",
  description: "㈜이브이레이저의 조직 구성과 각 부서의 역할을 소개합니다.",
};

interface OrgUnitDetail {
  title: string;
  desc: string;
  tasks: string[];
}

export default async function CompanyOrganizationPage() {
  const t = await getTranslations("company");
  const org = t.raw("organization") as { ceoTitle: string; ceoName: string };
  const orgUnits = t.raw("organization.units") as Record<string, OrgUnitDetail>;

  return (
    <section className="pt-10 pb-16 sm:pt-12 sm:pb-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">{t("organization.eyebrow")}</span>
        <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("organization.title")}</h2>
        <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("organization.desc")}</p>

        {/* 대표이사 — 원형 아이콘 + 직함(굵게), 이름은 표기하지 않음 */}
        <div className="mt-12 flex flex-col items-center">
          <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-gradient-to-br from-blue to-blue-deep text-white shadow-[0_6px_18px_rgba(11,77,162,0.35)]">
            <Icon name="shield" className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <p className="mt-2.5 font-mono text-[10px] tracking-[0.14em] text-blue">C E O</p>
          <p className="mt-0.5 font-bold text-[16px] tracking-wide">{org.ceoTitle}</p>
          <div className="mt-3 h-7 w-px bg-line-strong" />
        </div>

        {/* 미니멀 아이콘 그리드 — 테두리 없이 여백 중심 */}
        <div className="mt-6 grid gap-x-5 gap-y-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {orgChart.map((unit) => {
            const detail = orgUnits[unit.key];
            const ov = unit.overseas;
            return (
              <div key={unit.key} className="group text-center px-1.5">
                <div
                  className={`mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-full transition-transform duration-150 group-hover:-translate-y-0.5 ${
                    ov ? "bg-red/10 text-red" : "bg-blue-soft text-blue"
                  }`}
                >
                  <Icon name={unit.icon} className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-[14.5px] font-bold">{detail.title}</h3>
                <p className="mt-1.5 text-ink-soft text-[12px] leading-relaxed min-h-[3.4em]">{detail.desc}</p>
                <ul className="mt-2.5 flex flex-col gap-1 border-t border-line pt-2.5">
                  {detail.tasks.map((task, i) => (
                    <li key={i} className="text-[11.5px] text-ink-faint">
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

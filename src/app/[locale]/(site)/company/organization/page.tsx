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

        <div className="mt-12 flex flex-col items-center">
          <div className="border-2 border-blue bg-blue-soft px-8 py-4 text-center">
            <p className="font-mono text-[10.5px] text-blue-deep tracking-wide">{org.ceoTitle}</p>
            <p className="mt-1 font-bold text-[16px]">{org.ceoName}</p>
          </div>
          <div className="w-px h-8 bg-line-strong" />
          <div className="w-24 h-px bg-line-strong mb-10" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {orgChart.map((unit) => {
            const detail = orgUnits[unit.key];
            return (
              <div key={unit.key} className="border border-line-strong bg-surface p-5 flex flex-col gap-2.5">
                <Icon name={unit.icon} className="w-7 h-7 text-blue" strokeWidth={1.5} />
                <h3 className="text-[15px] font-bold">{detail.title}</h3>
                <p className="text-ink-soft text-[12.5px] leading-relaxed">{detail.desc}</p>
                <ul className="mt-1 flex flex-col gap-1 border-t border-line pt-2.5">
                  {detail.tasks.map((task, i) => (
                    <li key={i} className="text-[11.5px] text-ink-faint pl-3.5 relative before:content-['—'] before:absolute before:left-0">
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

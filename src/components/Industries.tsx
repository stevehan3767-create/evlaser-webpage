import { useTranslations } from "next-intl";
import Icon from "./Icon";
import { industries } from "@/lib/data";

export default function Industries() {
  const t = useTranslations("industries");

  return (
    <section id="industries" className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("title")}
          </h2>
        </div>
        <div className="grid gap-px bg-line border border-line" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
          {industries.map((ind) => (
            <div key={ind.key} className="bg-surface p-6 flex flex-col gap-3 items-start min-h-[100px] hover:bg-surface-alt">
              <Icon name={ind.icon} className="w-7 h-7 text-blue" />
              <span className="font-semibold text-[13px] leading-snug">{t(ind.key)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

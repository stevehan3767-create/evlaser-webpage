import { useTranslations } from "next-intl";
import GroupItemGrid from "./GroupItemGrid";

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
        <GroupItemGrid group="industry" minColWidth="150px" iconColorClass="text-blue" />
      </div>
    </section>
  );
}

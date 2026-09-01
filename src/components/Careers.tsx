import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import { jobs } from "@/lib/data";

const VALUE_KEYS = ["expertise", "integrity", "challenge"] as const;

export default function Careers() {
  const t = useTranslations("careers");

  return (
    <section id="careers" className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="inline-flex items-center gap-2 px-3.5 py-[7px] bg-red text-white font-bold text-[12px] tracking-wide mb-3.5">
          <span className="w-[7px] h-[7px] rounded-full bg-white animate-pulse" />
          {t("badge")}
        </div>
        <div className="flex flex-wrap justify-between items-end gap-6 mb-11">
          <div>
            <span className="eyebrow">{t("eyebrow")}</span>
            <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
              {t("title")}
            </h1>
            <p className="text-ink-soft mt-2.5">{t("desc")}</p>
          </div>
          <Link href="/support" className="inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025]">
            {t("viewAll")}
          </Link>
        </div>
        <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {jobs.map((j) => (
            <div key={j.key} className="border border-line-strong border-l-4 border-l-red bg-surface p-[22px] flex flex-col gap-2.5">
              <Icon name="briefcase" className="w-6 h-6 text-red" />
              <h3 className="text-[16px]">{t(`jobs.${j.key}.title`)}</h3>
              <div className="flex flex-wrap gap-2">
                {(["type", "loc", "due"] as const).map((f) => (
                  <span key={f} className="font-mono text-[10.5px] text-ink-soft border border-line-strong px-2 py-[3px] tracking-wide">
                    {t(`jobs.${j.key}.${f}`)}
                  </span>
                ))}
              </div>
              <Link href="/support" className="mt-2 text-[12.5px] font-bold text-blue inline-flex items-center gap-[5px]">
                {t("apply")}
              </Link>
            </div>
          ))}
        </div>

        <div id="culture" className="mt-16 pt-16 border-t border-line scroll-mt-28">
          <span className="eyebrow">{t("culture.eyebrow")}</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("culture.title")}
          </h2>
          <div className="grid gap-[18px] mt-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {VALUE_KEYS.map((v) => (
              <div key={v} className="border border-line p-5">
                <h3 className="font-bold text-[15px]">{t(`culture.values.${v}.title`)}</h3>
                <p className="text-ink-soft text-[13.3px] mt-1.5">{t(`culture.values.${v}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

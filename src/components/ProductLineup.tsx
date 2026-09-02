import { useTranslations } from "next-intl";
import Icon from "./Icon";
import { productLineup } from "@/lib/data";

export default function ProductLineup() {
  const t = useTranslations("productLineup");

  return (
    <section id="lineup" className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("title")}</h2>
        <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("desc")}</p>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[14px]">
          {productLineup.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-2 border border-line-strong bg-surface p-4 hover:border-blue transition-colors"
            >
              <span className="text-[13.5px] font-semibold">{p.name}</span>
              <Icon name="cut" className="w-4 h-4 text-ink-faint group-hover:text-blue flex-none" strokeWidth={1.6} />
            </a>
          ))}
        </div>
        <p className="mt-5 text-ink-faint text-[12px]">{t("note")}</p>
      </div>
    </section>
  );
}

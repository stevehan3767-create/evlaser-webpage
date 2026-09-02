import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import { lineupItems } from "@/lib/data";

export default function ProductLineup() {
  const t = useTranslations("productLineup");

  return (
    <section id="lineup" className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("title")}</h2>
        <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("desc")}</p>

        <div className="mt-8 grid gap-px bg-line border border-line" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
          {lineupItems.map((item) => (
            <Link
              key={item.key}
              href={`/products/lineup/${item.key}`}
              className="group bg-surface p-5 flex flex-col gap-2.5 min-h-[110px] hover:bg-surface-alt transition-colors"
            >
              <Icon name={item.icon} className="w-7 h-7 text-red" strokeWidth={1.5} />
              <h3 className="text-[14px] font-semibold leading-snug mt-0.5">{item.name}</h3>
            </Link>
          ))}
        </div>
        <p className="mt-5 text-ink-faint text-[12px]">{t("note")}</p>
      </div>
    </section>
  );
}

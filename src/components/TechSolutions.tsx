import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import { techItems } from "@/lib/data";

export default function TechSolutions() {
  const t = useTranslations("tech");

  return (
    <section id="tech" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("title")}
          </h2>
        </div>
        <div className="grid gap-px bg-line border border-line" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
          {techItems.map((item, i) => {
            const number = String(i + 1).padStart(2, "0");
            return (
              <Link
                key={`${item.key}-${i}`}
                href={`/products/tech/${item.key}`}
                className="group bg-surface p-5 flex flex-col gap-2.5 min-h-[130px] hover:bg-surface-alt transition-colors"
              >
                <span className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] text-ink-faint tracking-wide">{number}</span>
                  <svg
                    viewBox="0 0 12 12"
                    className="w-3 h-3 text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 9.5 9.5 2.5M4.5 2.5h5v5" />
                  </svg>
                </span>
                <Icon name={item.icon} className="w-7 h-7 text-red" strokeWidth={1.5} />
                <h3 className="text-[14.5px] leading-snug mt-0.5">{t(item.key)}</h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

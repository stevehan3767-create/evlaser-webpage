import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import { patents, certifications, orgChart } from "@/lib/data";

interface HistoryYear {
  year: string;
  items: string[];
}

interface OrgUnitDetail {
  title: string;
  desc: string;
  tasks: string[];
}

export default function CompanyInfo() {
  const t = useTranslations("company");
  const greetingParagraphs = t.raw("greeting.paragraphs") as string[];
  const historyItems = t.raw("history.items") as HistoryYear[];
  const org = t.raw("organization") as { ceoTitle: string; ceoName: string };
  const orgUnits = t.raw("organization.units") as Record<string, OrgUnitDetail>;

  return (
    <>
      <section id="overview" className="py-16 sm:py-22 border-b border-line">
        <div className="mx-auto max-w-[1240px] px-7">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-2.5 text-[28px] sm:text-[38px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("title")}
          </h1>

          <div className="mt-10 max-w-[68ch]">
            <span className="eyebrow">{t("greeting.eyebrow")}</span>
            <h2 className="mt-2.5 text-[22px] sm:text-[28px] font-[family-name:var(--font-display)] tracking-tight">
              {t("greeting.title")}
            </h2>
            <div className="mt-5 flex flex-col gap-4">
              {greetingParagraphs.map((p, i) => (
                <p key={i} className="text-ink-soft text-[15px] leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
            <p className="mt-6 font-bold text-ink text-[14px]">{t("greeting.signature")}</p>
          </div>
        </div>
      </section>

      <section id="history" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
        <div className="mx-auto max-w-[1240px] px-7">
          <span className="eyebrow">{t("history.eyebrow")}</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("history.title")}</h2>
          <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("history.summary")}</p>
          <div className="mt-8 border-t border-line-strong">
            {historyItems.map((h) => (
              <div key={h.year} className="flex gap-6 py-4 border-b border-line">
                <span className="font-mono font-bold text-blue w-[64px] flex-none">{h.year}</span>
                <ul className="flex flex-col gap-1">
                  {h.items.map((item, i) => (
                    <li key={i} className="text-ink-soft text-[13.8px]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-ink-faint text-[12.5px]">{t("history.moreNote")}</p>
        </div>
      </section>

      <section id="organization" className="py-16 sm:py-22 border-b border-line">
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

      <section id="business" className="py-16 sm:py-22 border-b border-line">
        <div className="mx-auto max-w-[1240px] px-7">
          <span className="eyebrow">{t("business.eyebrow")}</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("business.title")}</h2>
          <p className="text-ink-soft max-w-[58ch] mt-2.5">{t("business.desc")}</p>
          <Link href="/products" className="inline-flex items-center gap-2 mt-5 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025]">
            {t("business.cta")}
          </Link>
        </div>
      </section>

      <section id="patents" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
        <div className="mx-auto max-w-[1240px] px-7">
          <span className="eyebrow">{t("patents.eyebrow")}</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("patents.title")}</h2>
          <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("patents.summary")}</p>

          <h3 className="mt-10 mb-4 text-[16px] font-bold">
            {t("patents.patentsHeading")} <span className="font-mono text-ink-faint text-[13px]">({patents.length})</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {patents.map((p, i) => (
              <a
                key={i}
                href={p.image}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-line-strong bg-surface hover:border-blue transition-colors"
              >
                <div className="relative aspect-[248/371] bg-surface-alt">
                  <Image src={p.image} alt={p.title} fill sizes="200px" className="object-contain" />
                </div>
                <p className="p-2 text-[11px] text-ink-soft leading-snug line-clamp-3">{p.title}</p>
              </a>
            ))}
          </div>

          <h3 className="mt-12 mb-4 text-[16px] font-bold">
            {t("patents.certsHeading")} <span className="font-mono text-ink-faint text-[13px]">({certifications.length})</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {certifications.map((c, i) => (
              <a
                key={i}
                href={c.image}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-line-strong bg-surface hover:border-blue transition-colors"
              >
                <div className="relative aspect-[248/371] bg-surface-alt">
                  <Image src={c.image} alt={c.title} fill sizes="200px" className="object-contain" />
                </div>
                <div className="p-2">
                  <p className="text-[11px] text-ink-soft leading-snug line-clamp-2">{c.title}</p>
                  {c.subtitle && <p className="text-[10.5px] text-ink-faint leading-snug mt-0.5">{c.subtitle}</p>}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

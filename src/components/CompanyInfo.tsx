import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { patents, certifications } from "@/lib/data";

interface HistoryYear {
  year: string;
  items: string[];
}

export default function CompanyInfo() {
  const t = useTranslations("company");
  const greetingParagraphs = t.raw("greeting.paragraphs") as string[];
  const historyItems = t.raw("history.items") as HistoryYear[];

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

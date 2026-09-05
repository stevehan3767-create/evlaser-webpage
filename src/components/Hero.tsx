import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import HeroCarousel from "./HeroCarousel";
import { showcaseSlides } from "@/lib/data";
import { heroSlideRepo } from "@/lib/repo";

export default async function Hero() {
  const t = await getTranslations("hero");
  const tShowcase = await getTranslations("showcase");
  const heroSlides = await heroSlideRepo.list();

  return (
    <section
      className="relative overflow-hidden border-b border-line pt-[72px]"
      style={{ background: "linear-gradient(180deg, #EEF4FC, #FFFFFF 78%)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11,77,162,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(11,77,162,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(180deg,rgba(0,0,0,0.9),transparent 85%)",
        }}
      />
      <div
        className="absolute top-[-10%] right-[8%] w-[3px] h-[150%]"
        style={{
          background:
            "linear-gradient(180deg, transparent, var(--red) 35%, #ff8fa0 50%, var(--red) 65%, transparent)",
          transform: "rotate(22deg)",
          filter: "drop-shadow(0 0 10px rgba(228,0,43,0.4))",
          opacity: 0.55,
        }}
      />

      <div className="relative mx-auto max-w-[1240px] px-7 grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-12 items-center py-6 pb-14">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-red text-white font-mono font-extrabold text-[14px] sm:text-[15px] tracking-wider px-4 py-[8px] rounded-full shadow-[0_3px_14px_rgba(228,0,43,0.4)]">
              SINCE 2002
            </span>
            <span className="text-[13.5px] sm:text-[14.5px] font-bold text-blue-deep tracking-wide">{t("tagline")}</span>
          </div>
          <h1 className="mt-[18px] text-[32px] sm:text-[44px] lg:text-[52px] font-extrabold leading-tight tracking-tight text-balance font-[family-name:var(--font-display)]">
            {t.rich("title", { em: (chunks) => <em className="not-italic text-red">{chunks}</em> })}
          </h1>
          {t("titleSub") && (
            <p className="mt-2.5 text-[13.5px] sm:text-[15px] font-semibold tracking-wide text-blue uppercase">{t("titleSub")}</p>
          )}
          <p className="mt-5 max-w-[52ch] text-ink-soft text-[16.5px]">{t("body")}</p>
          <div className="flex gap-3 mt-8 flex-wrap">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025] hover:border-[#c40025]"
            >
              {t("cta1")}
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 px-[18px] py-2.5 bg-transparent text-ink font-bold text-[13.5px] border border-line-strong hover:border-blue hover:text-blue"
            >
              {t("cta2")}
            </Link>
          </div>
        </div>

        {heroSlides.length > 0 ? (
          <HeroCarousel slides={heroSlides.map((s) => ({ id: s.id, imageUrl: s.imageUrl, title: s.title }))} />
        ) : (
          <div className="relative border border-line bg-surface shadow-xl">
            <div className="relative aspect-[4/3] overflow-hidden">
              {showcaseSlides.map((s, i) => (
                <div
                  key={s.key}
                  className="absolute inset-0 flex flex-col justify-end p-[22px] text-white"
                  style={{ opacity: i === 0 ? 1 : 0, background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
                >
                  <Icon name={s.icon} className="w-[46px] h-[46px] opacity-90 mb-auto" strokeWidth={1.4} />
                  <span className="font-mono text-[10.5px] tracking-wider opacity-[.85]">{tShowcase(`${s.key}.tag`)}</span>
                  <h3 className="text-[19px] text-white mt-1">{tShowcase(`${s.key}.title`)}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-[1240px] px-7 grid grid-cols-2 sm:grid-cols-4 border-t border-line">
        {[
          ["2002", "stat0"],
          ["28", "stat1"],
          ["11", "stat2"],
          ["450+", "stat3"],
        ].map(([num, key], i) => (
          <div key={key} className={`py-[22px] px-[18px] ${i !== 0 ? "border-l border-line" : ""}`}>
            <b className="block font-mono text-[26px] sm:text-[28px] text-blue-deep">{num}</b>
            <span className="text-[11.5px] text-ink-faint tracking-wide">{t(key)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

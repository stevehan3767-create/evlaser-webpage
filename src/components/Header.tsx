"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import Logo from "./Logo";
import {
  companyNav,
  companyMegaGroups,
  productsNav,
  resourcesNav,
  newsNav,
  globalNav,
  supportNav,
} from "@/lib/data";

const NAV_SECTIONS = [
  { section: "company", items: companyNav, href: "/company" },
  { section: "products", items: productsNav, href: "/products" },
  { section: "resources", items: resourcesNav, href: "/resources" },
  { section: "news", items: newsNav, href: "/news" },
  { section: "global", items: globalNav, href: "/global" },
  { section: "support", items: supportNav, href: "/support" },
] as const;

const LANG_LABELS: Record<string, string> = { ko: "한국어", en: "EN", zh: "中文", ja: "日本語" };

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations("nav");
  const tTop = useTranslations("topbar");
  const tSearch = useTranslations("search");
  const tDrawer = useTranslations("drawer");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <div className="bg-[#02070E] text-[#c9d6e8] text-[12.5px] border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-7 flex items-center justify-between h-[38px] gap-4">
          {/* 메인 메뉴와 중복되지 않도록 빠른링크는 '대표이사 직속 소통센터' 하나만 눈에 띄게 둔다. */}
          <div className="flex gap-[18px]">
            <Link href="/ceo-channel" className="inline-flex items-center gap-1.5 font-bold text-white">
              <span className="inline-block w-[7px] h-[7px] rounded-full bg-[#ff2d55]" />
              {tTop("ceo")}
            </Link>
          </div>
          <div className="hidden sm:flex gap-0.5 bg-white/5 p-[3px] rounded-sm">
            {routing.locales.map((l) => (
              <button
                key={l}
                aria-pressed={l === locale}
                onClick={() => router.replace(pathname, { locale: l })}
                className="px-2.5 py-[3px] text-[11.5px] font-semibold rounded-sm text-[#b7c4d8] aria-pressed:bg-red aria-pressed:text-white hover:text-white"
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-surface border-b border-line">
        <div className="mx-auto max-w-[1240px] px-7 flex items-center gap-4 h-[76px]">
          <Link href="/" aria-label="EV Laser home" className="flex items-center flex-none text-ink">
            <Logo className="w-[150px] sm:w-[168px]" />
            <span className="hidden [@media(min-width:1280px)]:inline-block font-mono text-[11px] font-bold tracking-wider text-red pl-3.5 ml-3.5 border-l border-line-strong whitespace-nowrap">
              SINCE 2002
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden [@media(min-width:1100px)]:flex items-stretch flex-1 min-w-0">
            {NAV_SECTIONS.map(({ section, items, href }) => (
              <div key={section} className="relative group">
                <Link
                  href={href}
                  className="flex items-center gap-1 h-[76px] px-2 font-semibold text-[13px] text-ink whitespace-nowrap border-b-[2.5px] border-transparent group-hover:text-blue group-hover:border-red"
                >
                  {t(`${section}.label`)}
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 transition-transform group-hover:rotate-180">
                    <polyline points="5 8 12 16 19 8" fill="none" stroke="currentColor" strokeWidth="2.2" />
                  </svg>
                </Link>
                {section === "company" ? (
                  <div className="absolute top-full left-0 bg-surface border border-line shadow-lg p-5 hidden group-hover:grid grid-cols-3 gap-x-7 gap-y-1">
                    {companyMegaGroups.map((grp) => (
                      <div key={grp.titleKey} className="min-w-[150px]">
                        <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-red tracking-wide pb-2 mb-1 border-b border-line">
                          <span className="inline-block w-[7px] h-[7px] rounded-[2px] bg-red" />
                          {t(grp.titleKey)}
                        </p>
                        {grp.items.map((sub) => (
                          <Link
                            key={sub.labelKey}
                            href={sub.href}
                            className="block px-2 py-2 text-[13.5px] text-ink-soft whitespace-nowrap rounded-sm hover:bg-surface-alt hover:text-blue"
                          >
                            {t(sub.labelKey)}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 min-w-[220px] bg-surface border border-line shadow-lg p-2.5 hidden group-hover:block">
                    {items.map((sub) => (
                      <Link
                        key={sub.key}
                        href={sub.href}
                        className="flex items-center gap-2 px-3 py-2.5 text-[13.5px] text-ink-soft whitespace-nowrap border-l-2 border-transparent hover:bg-surface-alt hover:text-blue hover:border-red"
                      >
                        {t(`${section}.items.${sub.key}`)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 relative flex-none ml-auto [@media(min-width:1100px)]:ml-0">
            <button
              aria-label="Menu"
              onClick={() => setDrawerOpen(true)}
              className="flex [@media(min-width:1100px)]:hidden w-[38px] h-[38px] items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setDrawerOpen(false)}>
          <nav
            aria-label="Mobile"
            onClick={(e) => e.stopPropagation()}
            className="fixed top-0 right-0 bottom-0 w-[86vw] max-w-[320px] bg-surface border-l border-line overflow-y-auto"
          >
            <div className="flex justify-between items-center p-[18px] border-b border-line">
              <strong>{tDrawer("title")}</strong>
              <button aria-label="Close" onClick={() => setDrawerOpen(false)} className="w-[30px] h-[30px]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>
            </div>
            <form
              className="p-[18px] border-b border-line"
              onSubmit={(e) => {
                e.preventDefault();
                const query = searchQuery.trim();
                if (!query) return;
                setDrawerOpen(false);
                router.push({ pathname: "/search", query: { q: query } });
              }}
            >
              <div className="flex items-center gap-2 rounded-full border-2 border-blue bg-surface pl-4 pr-1.5 py-1">
                <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] flex-none text-blue" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <line x1="15.5" y1="15.5" x2="20.5" y2="20.5" />
                </svg>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tSearch("placeholder")}
                  aria-label={tSearch("label")}
                  className="flex-1 min-w-0 bg-transparent py-1.5 text-[14px] text-ink outline-none placeholder:text-ink-faint"
                />
                <button type="submit" className="flex-none px-3.5 py-2 bg-red text-white rounded-full font-bold text-[12.5px]">
                  {tSearch("label")}
                </button>
              </div>
            </form>
            {NAV_SECTIONS.map(({ section, items, href }) => (
              <details key={section} className="border-b border-line">
                <summary className="p-4 px-[18px] font-bold text-[14.5px] list-none flex justify-between cursor-pointer">
                  <Link href={href} onClick={() => setDrawerOpen(false)}>
                    {t(`${section}.label`)}
                  </Link>
                </summary>
                <div className="pb-2">
                  {section === "company"
                    ? companyMegaGroups.map((grp) => (
                        <div key={grp.titleKey}>
                          <p className="pt-2.5 pb-1 pl-7 pr-[18px] text-[11px] font-bold text-red tracking-wide">{t(grp.titleKey)}</p>
                          {grp.items.map((sub) => (
                            <Link
                              key={sub.labelKey}
                              href={sub.href}
                              onClick={() => setDrawerOpen(false)}
                              className="block py-2.5 pl-9 pr-[18px] text-[13.3px] text-ink-soft"
                            >
                              {t(sub.labelKey)}
                            </Link>
                          ))}
                        </div>
                      ))
                    : items.map((sub) => (
                        <Link
                          key={sub.key}
                          href={sub.href}
                          onClick={() => setDrawerOpen(false)}
                          className="block py-2.5 pl-7 pr-[18px] text-[13.3px] text-ink-soft"
                        >
                          {t(`${section}.items.${sub.key}`)}
                        </Link>
                      ))}
                </div>
              </details>
            ))}
            <Link
              href="/ceo-channel"
              onClick={() => setDrawerOpen(false)}
              className="block p-4 px-[18px] font-bold text-[14.5px] text-red border-b border-line"
            >
              {t("ceo.label")}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

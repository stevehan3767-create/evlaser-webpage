"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import Logo from "./Logo";
import {
  companyNav,
  productsNav,
  resourcesNav,
  newsNav,
  careersNav,
  globalNav,
  supportNav,
} from "@/lib/data";

const NAV_SECTIONS = [
  { section: "company", items: companyNav, href: "/company" },
  { section: "products", items: productsNav, href: "/products" },
  { section: "resources", items: resourcesNav, href: "/resources" },
  { section: "news", items: newsNav, href: "/news" },
  { section: "careers", items: careersNav, href: "/careers" },
  { section: "global", items: globalNav, href: "/global" },
  { section: "support", items: supportNav, href: "/support" },
] as const;

const LANG_LABELS: Record<string, string> = { ko: "한국어", en: "EN", zh: "中文", ja: "日本語" };

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
          <div className="flex gap-[18px]">
            <Link href="/ceo-channel" className="font-bold text-[#ff7a90]">
              {tTop("ceo")}
            </Link>
            <Link href="/support" className="opacity-[.85] hover:opacity-100 hover:text-white">
              {tTop("support")}
            </Link>
            <Link href="/careers" className="opacity-[.85] hover:opacity-100 hover:text-white">
              {tTop("careers")}
            </Link>
            <Link href="/global" className="opacity-[.85] hover:opacity-100 hover:text-white">
              {tTop("global")}
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
        <div className="mx-auto max-w-[1240px] px-7 flex items-center gap-8 h-[76px]">
          <Link href="/" aria-label="EV Laser home" className="flex items-center flex-none text-ink">
            <Logo className="w-[150px] sm:w-[168px]" />
            <span className="hidden md:inline-block font-mono text-[11px] font-bold tracking-wider text-red pl-3.5 ml-3.5 border-l border-line-strong whitespace-nowrap">
              SINCE 2002
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden [@media(min-width:1180px)]:flex items-stretch flex-1 min-w-0">
            {NAV_SECTIONS.map(({ section, items, href }) => (
              <div key={section} className="relative group">
                <Link
                  href={href}
                  className="flex items-center gap-1 h-[76px] px-2.5 font-semibold text-[13.6px] text-ink whitespace-nowrap border-b-[2.5px] border-transparent group-hover:text-blue group-hover:border-red"
                >
                  {t(`${section}.label`)}
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 transition-transform group-hover:rotate-180">
                    <polyline points="5 8 12 16 19 8" fill="none" stroke="currentColor" strokeWidth="2.2" />
                  </svg>
                </Link>
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
              </div>
            ))}
            <div className="relative">
              <Link href="/ceo-channel" className="flex items-center h-[76px] px-2.5 font-semibold text-[13.6px] text-red whitespace-nowrap">
                {t("ceo.label")}
              </Link>
            </div>
          </nav>

          <div className="flex items-center gap-1.5 relative flex-none ml-auto [@media(min-width:1180px)]:ml-0">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
              className="hidden [@media(min-width:1180px)]:flex w-[38px] h-[38px] items-center justify-center text-ink-soft hover:text-blue"
            >
              <svg viewBox="0 0 24 24" className="w-[19px] h-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <line x1="15.5" y1="15.5" x2="20.5" y2="20.5" />
              </svg>
            </button>
            {searchOpen && (
              <form className="absolute top-full right-0 mt-px bg-surface border border-line shadow-lg p-2.5 flex items-center">
                <input
                  autoFocus
                  type="search"
                  placeholder={tSearch("placeholder")}
                  className="w-[240px] px-3 py-2 border border-line-strong bg-surface-alt text-[13px] text-ink rounded-sm"
                />
              </form>
            )}
            <button
              aria-label="Menu"
              onClick={() => setDrawerOpen(true)}
              className="flex [@media(min-width:1180px)]:hidden w-[38px] h-[38px] items-center justify-center"
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
            {NAV_SECTIONS.map(({ section, items, href }) => (
              <details key={section} className="border-b border-line">
                <summary className="p-4 px-[18px] font-bold text-[14.5px] list-none flex justify-between cursor-pointer">
                  <Link href={href} onClick={() => setDrawerOpen(false)}>
                    {t(`${section}.label`)}
                  </Link>
                </summary>
                <div>
                  {items.map((sub) => (
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

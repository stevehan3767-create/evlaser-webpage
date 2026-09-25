"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

// 회사소개 하위 페이지 간 이동 탭. 라벨은 nav.company.items 번역을 재사용한다.
const TABS: { key: string; href: string }[] = [
  { key: "overview", href: "/company" },
  { key: "history", href: "/company/history" },
  { key: "organization", href: "/company/organization" },
  { key: "business", href: "/company/business" },
  { key: "patents", href: "/company/patents" },
  { key: "clients", href: "/company/clients" },
  { key: "directions", href: "/company/directions" },
];

export default function CompanyNav() {
  const t = useTranslations("nav.company.items");
  const pathname = usePathname();

  return (
    <nav aria-label="회사소개 하위 메뉴" className="mt-6 -mx-7 px-7 overflow-x-auto">
      <ul className="flex gap-1.5 min-w-max border-b border-line">
        {TABS.map((tab) => {
          const active = tab.href === "/company" ? pathname === "/company" : pathname.startsWith(tab.href);
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center px-3.5 py-2.5 text-[13.5px] font-bold whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  active
                    ? "border-red text-red"
                    : "border-transparent text-ink-soft hover:text-blue hover:border-line-strong"
                }`}
              >
                {t(tab.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

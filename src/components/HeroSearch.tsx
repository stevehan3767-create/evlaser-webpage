"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

// 메인 첫 화면의 대표 검색창 (네이버식). 모바일에서도 잘 보이도록 히어로에 배치.
export default function HeroSearch() {
  const t = useTranslations("search");
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      className="mt-8 w-full max-w-[560px]"
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        if (!query) return;
        router.push({ pathname: "/search", query: { q: query } });
      }}
    >
      <div className="flex items-center gap-2 rounded-full border-2 border-blue bg-surface pl-5 pr-1.5 py-1.5 shadow-[0_4px_16px_rgba(11,77,162,0.12)] focus-within:border-red transition-colors">
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-none text-blue" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="15.5" y1="15.5" x2="20.5" y2="20.5" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("label")}
          className="flex-1 min-w-0 bg-transparent py-2 text-[15px] text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="submit"
          className="flex-none px-4 sm:px-5 py-2.5 bg-red text-white rounded-full font-bold text-[13.5px] hover:bg-[#c40025]"
        >
          {t("label")}
        </button>
      </div>
    </form>
  );
}

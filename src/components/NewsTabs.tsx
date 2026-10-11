import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// 뉴스·소식 공용 탭(4개). 사내소식·전시회소식은 /news, 논문·학술소식·언론·방송소식은 /news/press.
const TABS = [
  { key: "company", href: "/news?cat=company" },
  { key: "exhibition", href: "/news?cat=exhibition" },
  { key: "paper", href: "/news/press?cat=paper" },
  { key: "media", href: "/news/press?cat=media" },
] as const;

export default async function NewsTabs({ active }: { active: string }) {
  const t = await getTranslations("nav.news.items");
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {TABS.map((c) => (
        <Link
          key={c.key}
          href={c.href}
          aria-current={c.key === active ? "page" : undefined}
          className={`px-4 py-2 text-[13.5px] font-bold border rounded-sm transition-colors ${
            c.key === active
              ? "bg-red text-white border-red"
              : "bg-surface text-ink-soft border-line-strong hover:border-red hover:text-red"
          }`}
        >
          {t(c.key)}
        </Link>
      ))}
    </div>
  );
}

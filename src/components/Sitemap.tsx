import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import { sitemap } from "@/lib/data";

export default function Sitemap() {
  const t = useTranslations();

  return (
    <section className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">{t("sitemap.eyebrow")}</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("sitemap.title")}
          </h2>
          <p className="text-ink-soft max-w-[58ch] mt-2.5">{t("sitemap.desc")}</p>
        </div>
        <div className="grid gap-[26px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {sitemap.map((branch) => (
            <div key={branch.branchKey} className={`bg-surface border ${branch.accent ? "border-red" : "border-line"}`}>
              <Link
                href={branch.titleHref}
                className={`flex items-center gap-2.5 px-4 py-3.5 border-b border-line hover:opacity-80 ${
                  branch.accent ? "bg-red-soft" : "bg-surface-alt"
                }`}
              >
                <Icon name={branch.icon} className={`w-[18px] h-[18px] flex-none ${branch.accent ? "text-red" : "text-blue"}`} />
                <span className="font-bold text-[13.5px]">{t(`sitemap.branches.${branch.branchKey}`)}</span>
              </Link>
              <ul className="py-1.5">
                {branch.items.map((item) => (
                  <li key={item.key}>
                    <Link href={item.href} className="relative block pl-[30px] pr-4 py-2 text-[12.8px] text-ink-soft hover:text-blue">
                      {branch.branchKey === "admin"
                        ? t(`admin.items.${item.key}`)
                        : branch.branchKey === "ceo"
                          ? t(`ceo.cards.${item.key}.title`)
                          : t(`nav.${branch.navKey}.items.${item.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

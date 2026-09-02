import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "./Logo";
import Icon from "./Icon";
import { companyNav, productsNav, resourcesNav, globalNav, supportNav, socialLinks } from "@/lib/data";

const SOCIAL_ICON_PATHS: Record<string, React.ReactNode> = {
  facebook: <path d="M14 8.5h2V5.5h-2c-2.2 0-3.5 1.3-3.5 3.5v2H8.5v3H10.5V19.5h3V14h2.3l.5-3H13.5V9.3c0-.5.2-.8.5-.8z" />,
  instagram: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="4" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.6" cy="7.4" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  naverBlog: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 8v8l4-5.2V16h4V8l-4 5.2V8z" />
    </>
  ),
  youtube: (
    <>
      <rect x="3.5" y="6.5" width="17" height="11" rx="3" />
      <path d="M10.3 9.6v4.8l4.4-2.4z" fill="currentColor" stroke="none" />
    </>
  ),
};

function SocialIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {SOCIAL_ICON_PATHS[name]}
    </svg>
  );
}

type NavSection = "company" | "products" | "resources" | "news" | "careers" | "global" | "support" | "ceo";

interface FootItem {
  href: string;
  section: NavSection;
  itemKey: string | null;
  accent?: boolean;
}

export default function Footer() {
  const t = useTranslations();

  const companyFootKeys = ["history", "organization", "business", "patents"];
  const companyItems: FootItem[] = companyNav
    .filter((n) => companyFootKeys.includes(n.key))
    .map((n) => ({ href: n.href, section: "company", itemKey: n.key }));
  const productItems: FootItem[] = productsNav.map((n) => ({ href: n.href, section: "products", itemKey: n.key }));
  const resourceItems: FootItem[] = [
    ...resourcesNav.slice(0, 2).map((n) => ({ href: n.href, section: "resources" as const, itemKey: n.key })),
    { href: "/news", section: "news", itemKey: "company" },
  ];
  const contactItems: FootItem[] = [
    { href: supportNav[0].href, section: "support", itemKey: supportNav[0].key },
    { href: "/careers", section: "careers", itemKey: "openings" },
    { href: globalNav[1].href, section: "global", itemKey: globalNav[1].key },
    { href: "/ceo-channel", section: "ceo", itemKey: null, accent: true },
  ];

  return (
    <footer className="bg-blue-deep-2 text-[#b7c4d8] pt-16">
      <div className="mx-auto max-w-[1240px] px-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] gap-8 pb-12 border-b border-white/12">
        <div>
          <Link href="/" className="inline-flex items-center mb-4 text-white">
            <Logo className="w-[140px]" />
          </Link>
          <p className="text-[13px] leading-relaxed opacity-[.85] max-w-[38ch]">{t("footer.about")}</p>
          <p className="mt-4 text-[12.5px] leading-8 opacity-80">
            {t("footer.addressLine1")}
            <br />
            {t("footer.addressLine2")}
            <br />
            {t("footer.addressLine3")}
            <br />
            {t("footer.addressLine4")}
          </p>
          <div className="flex gap-2.5 mt-5">
            {socialLinks.map((s) => (
              <a
                key={s.key}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(`footer.social.${s.key}`)}
                className="w-8 h-8 flex items-center justify-center border border-white/20 rounded-full opacity-80 hover:opacity-100 hover:border-white/50 transition-colors"
              >
                <SocialIcon name={s.key} />
              </a>
            ))}
          </div>
        </div>
        <FootCol titleKey="company" items={companyItems} />
        <FootCol titleKey="products" items={productItems} />
        <FootCol titleKey="resources" items={resourceItems} />
        <FootCol titleKey="contact" items={contactItems} />
      </div>
      <div className="mx-auto max-w-[1240px] px-7 flex justify-between items-center gap-4 py-[22px] text-[12px] flex-wrap">
        <span>{t("footer.copyright")}</span>
        <Link href="/admin" className="flex items-center gap-1.5 opacity-70 hover:opacity-100">
          <Icon name="lock" className="w-[13px] h-[13px]" />
          {t("footer.admin")}
        </Link>
      </div>
    </footer>
  );
}

function FootCol({ titleKey, items }: { titleKey: "company" | "products" | "resources" | "contact"; items: FootItem[] }) {
  const t = useTranslations();

  return (
    <div>
      <h4 className="text-white text-[12px] tracking-wide uppercase font-mono mb-4">{t(`footer.columns.${titleKey}`)}</h4>
      <ul className="flex flex-col gap-2.5">
        {items.map((item, i) => (
          <li key={i}>
            <Link
              href={item.href}
              className={`text-[13.3px] opacity-[.85] hover:opacity-100 hover:text-white ${item.accent ? "text-[#ff7a90]" : ""}`}
            >
              {item.itemKey ? t(`nav.${item.section}.items.${item.itemKey}`) : t(`nav.${item.section}.label`)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import { faqRepo } from "@/lib/repo";
import ContactForm from "./ContactForm";

const FAQ_KEYS = ["quote", "install", "access"] as const;

export default async function Support({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; channel?: string }>;
}) {
  const { view: rawView, channel } = await searchParams;
  const view =
    rawView === "faq" || rawView === "contact" ? rawView : channel && channel !== "general" ? "contact" : undefined;

  const t = await getTranslations("support");

  if (!view) {
    return (
      <section id="support" className="py-16 sm:py-22">
        <div className="mx-auto max-w-[1240px] px-7">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("title")}
          </h1>
          <p className="text-ink-soft mt-3 max-w-[64ch]">{t("desc")}</p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[760px]">
            <Link
              href="/support?view=faq"
              className="group border border-line-strong bg-surface p-7 flex flex-col gap-3 hover:border-red transition-colors"
            >
              <Icon name="doc" className="w-8 h-8 text-red" strokeWidth={1.5} />
              <h2 className="text-[17px] font-bold">{t("chooser.faq.title")}</h2>
              <p className="text-ink-soft text-[13px] leading-relaxed">{t("chooser.faq.desc")}</p>
              <span className="mt-auto text-[12.5px] font-bold text-red inline-flex items-center gap-1">→</span>
            </Link>
            <Link
              href="/support?view=contact"
              className="group border border-line-strong bg-surface p-7 flex flex-col gap-3 hover:border-red transition-colors"
            >
              <Icon name="bell" className="w-8 h-8 text-red" strokeWidth={1.5} />
              <h2 className="text-[17px] font-bold">{t("chooser.contact.title")}</h2>
              <p className="text-ink-soft text-[13px] leading-relaxed">{t("chooser.contact.desc")}</p>
              <span className="mt-auto text-[12.5px] font-bold text-red inline-flex items-center gap-1">→</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (view === "faq") {
    const extraFaqs = await faqRepo.list();
    return (
      <section id="support" className="py-16 sm:py-22">
        <div className="mx-auto max-w-[720px] px-7">
          <Link href="/support" className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue mb-6">
            {t("back")}
          </Link>
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("faqTitle")}
          </h1>

          <div id="faq" className="border-t border-line mt-8">
            {FAQ_KEYS.map((key, i) => (
              <div key={key} className="border-b border-line py-[18px]">
                <p className="font-bold text-[14px] flex gap-2.5">
                  <span className="font-mono text-red">{`Q${i + 1}`}</span>
                  {t(`faq.${key}.q`)}
                </p>
                <p className="mt-2 text-ink-soft text-[13.3px] pl-6">{t(`faq.${key}.a`)}</p>
              </div>
            ))}
            {extraFaqs.map((f, i) => (
              <div key={f.id} className="border-b border-line py-[18px]">
                <p className="font-bold text-[14px] flex gap-2.5">
                  <span className="font-mono text-red">{`Q${FAQ_KEYS.length + i + 1}`}</span>
                  {f.question}
                </p>
                <p className="mt-2 text-ink-soft text-[13.3px] pl-6 whitespace-pre-wrap">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="support" className="py-16 sm:py-22">
      <div className="mx-auto max-w-[640px] px-7">
        <Link href="/support" className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue mb-6">
          {t("back")}
        </Link>
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
          {t("title")}
        </h1>
        <p className="text-ink-soft mt-3 mb-8">{t("desc")}</p>

        <ContactForm />
      </div>
    </section>
  );
}

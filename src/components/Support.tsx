import { getTranslations } from "next-intl/server";
import { faqRepo } from "@/lib/repo";
import ContactForm from "./ContactForm";

const FAQ_KEYS = ["quote", "install", "access"] as const;

export default async function Support() {
  const t = await getTranslations("support");
  const extraFaqs = await faqRepo.list();

  return (
    <section id="support" className="py-16 sm:py-22">
      <div className="mx-auto max-w-[1240px] px-7 grid grid-cols-1 md:grid-cols-2 gap-14">
        <div>
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("title")}
          </h1>
          <p className="text-ink-soft mt-3">{t("desc")}</p>

          <div id="faq" className="border-t border-line mt-8 scroll-mt-28">
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

        <ContactForm />
      </div>
    </section>
  );
}

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import { faqRepo, supportPostRepo } from "@/lib/repo";
import ContactForm from "./ContactForm";

const FAQ_KEYS = ["quote", "install", "access"] as const;

// 고객지원 문의접수 공개 게시판(관리자 관리)의 상위 5건을 표시한다.
// 번호·제목·작성자(마스킹)·작성일·상태만 노출(본문·관리자 답변 제외, 조회수 미표시).
async function RecentInquiries() {
  let items: { no: string; title: string; author: string; date: string; status: string }[] = [];
  try {
    const rows = await supportPostRepo.list();
    items = rows.slice(0, 5).map((r) => ({
      no: r.postNo ?? "",
      title: r.title,
      author: r.author ?? "비공개",
      date: r.postedOn ?? "",
      status: r.status,
    }));
  } catch {
    /* DB 미연결 시 표시 생략 */
  }
  if (items.length === 0) return null;

  const COLS = "grid grid-cols-[1fr_72px] sm:grid-cols-[52px_1fr_92px_104px_84px] gap-x-3 sm:gap-x-4 items-center";
  return (
    <div className="mt-12">
      <h2 className="text-[15px] font-bold text-ink mb-3">최근 접수된 문의</h2>
      <div className={`${COLS} hidden sm:grid py-2.5 border-t-2 border-ink/70 border-b border-line-strong text-[12px] font-bold text-ink-soft`}>
        <span className="text-center">번호</span>
        <span>제목</span>
        <span className="text-center">작성자</span>
        <span className="text-right">작성일</span>
        <span className="text-center">상태</span>
      </div>
      <div className="border-t border-line sm:border-t-0">
        {items.map((q, qi) => {
          const answered = q.status === "answered";
          const badge = (
            <span
              className={`inline-block text-[10.5px] font-bold rounded-full px-2 py-0.5 border ${
                answered ? "text-[#0a7d3c] bg-[#e4f6ec] border-[#bfe8cd]" : "text-[#9a6b00] bg-[#fdf3dc] border-[#f3e0a8]"
              }`}
            >
              {answered ? "답변완료" : "접수"}
            </span>
          );
          return (
            <div key={qi} className={`${COLS} py-3 border-b border-line`}>
              <span className="hidden sm:block text-center font-mono text-[12.5px] text-ink-faint">{q.no}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="flex-none w-3 h-3 text-ink-faint" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                  <span className="truncate text-[13.5px] text-ink">{q.title}</span>
                </div>
                {/* 모바일: 작성자·작성일을 제목 아래로 */}
                <div className="sm:hidden mt-1 flex items-center gap-2 text-[11px] text-ink-faint">
                  <span>{q.author}</span>
                  <span className="font-mono">{q.date}</span>
                </div>
              </div>
              <span className="hidden sm:block text-center text-[12.5px] text-ink-soft">{q.author}</span>
              <span className="hidden sm:block text-right font-mono text-[12.5px] text-ink-faint">{q.date}</span>
              <span className="text-right sm:text-center">{badge}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11.5px] text-ink-faint">※ 고객 개인정보 보호를 위해 작성자명은 일부 가리고, 문의 내용은 비공개로 운영됩니다.</p>
    </div>
  );
}

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
              href="/support?view=contact"
              className="group border border-line-strong bg-surface p-7 flex flex-col gap-3 hover:border-red transition-colors"
            >
              <Icon name="bell" className="w-8 h-8 text-red" strokeWidth={1.5} />
              <h2 className="text-[17px] font-bold">{t("chooser.contact.title")}</h2>
              <p className="text-ink-soft text-[13px] leading-relaxed">{t("chooser.contact.desc")}</p>
              <span className="mt-auto text-[12.5px] font-bold text-red inline-flex items-center gap-1">→</span>
            </Link>
            <Link
              href="/support?view=faq"
              className="group border border-line-strong bg-surface p-7 flex flex-col gap-3 hover:border-red transition-colors"
            >
              <Icon name="doc" className="w-8 h-8 text-red" strokeWidth={1.5} />
              <h2 className="text-[17px] font-bold">{t("chooser.faq.title")}</h2>
              <p className="text-ink-soft text-[13px] leading-relaxed">{t("chooser.faq.desc")}</p>
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

  const isCeoChannel = channel === "ethics" || channel === "praise" || channel === "complaint";
  const tCeo = isCeoChannel ? await getTranslations("ceo") : null;
  const eyebrow = tCeo ? tCeo("eyebrow") : t("eyebrow");
  const heading = tCeo ? tCeo(`cards.${channel}.title`) : t("title");
  const desc = tCeo ? tCeo(`cards.${channel}.desc`) : t("desc");

  return (
    <section id="support" className="py-16 sm:py-22">
      <div className="mx-auto max-w-[640px] px-7">
        <Link href="/support" className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue mb-6">
          {t("back")}
        </Link>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
          {heading}
        </h1>
        <p className="text-ink-soft mt-3 mb-8">{desc}</p>

        <ContactForm />

        {!isCeoChannel && <RecentInquiries />}
      </div>
    </section>
  );
}

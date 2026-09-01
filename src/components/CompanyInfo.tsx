import Link from "next/link";
import Icon from "./Icon";

const historyPlaceholder = [
  { year: "2002", text: "㈜이브이레이저 설립" },
  { year: "2026", text: "(실제 연혁 정보로 교체 예정 — 주요 연도별 사업 확장, 인증 취득, 신규 라인 구축 등)" },
];

export default function CompanyInfo() {
  return (
    <>
      <section id="overview" className="py-16 sm:py-22 border-b border-line">
        <div className="mx-auto max-w-[1240px] px-7">
          <span className="eyebrow">COMPANY</span>
          <h1 className="mt-2.5 text-[28px] sm:text-[38px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            회사소개
          </h1>
          <p className="mt-5 max-w-[62ch] text-ink-soft text-[16px] leading-relaxed">
            EV Laser는 2002년 설립 이래 한 우물을 파온 레이저기술 전문기업입니다. 자동차·반도체·바이오의료·항공 등
            첨단 제조 산업을 위한 정밀 레이저 솔루션을 제공하며, &ldquo;더 좋은 레이저기술로 더 좋은 세상을
            만듭니다&rdquo;라는 슬로건 아래 기술 혁신을 이어가고 있습니다.
          </p>
        </div>
      </section>

      <section id="history" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
        <div className="mx-auto max-w-[1240px] px-7">
          <span className="eyebrow">HISTORY</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">연혁</h2>
          <div className="mt-8 border-t border-line-strong">
            {historyPlaceholder.map((h) => (
              <div key={h.year} className="flex gap-6 py-4 border-b border-line">
                <span className="font-mono font-bold text-blue w-[64px] flex-none">{h.year}</span>
                <span className="text-ink-soft text-[13.8px]">{h.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="business" className="py-16 sm:py-22 border-b border-line">
        <div className="mx-auto max-w-[1240px] px-7">
          <span className="eyebrow">BUSINESS AREAS</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">사업분야</h2>
          <p className="text-ink-soft max-w-[58ch] mt-2.5">
            자세한 사업분야·기술종류·적용산업은 제품·기술 페이지에서 확인하실 수 있습니다.
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 mt-5 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025]">
            제품·기술 보기
          </Link>
        </div>
      </section>

      <section id="patents" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
        <div className="mx-auto max-w-[1240px] px-7">
          <span className="eyebrow">PATENTS & CERTIFICATIONS</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">특허·인증</h2>
          <div className="mt-6 flex gap-3 p-4 bg-blue-soft border border-line-strong max-w-[62ch]">
            <Icon name="doc" className="w-5 h-5 text-blue flex-none" />
            <p className="text-[13px] text-ink-soft">
              보유 특허 및 인증(ISO 등) 목록은 실제 인증서 정보로 교체 후 게시 예정입니다. 목록과 인증서 이미지를
              전달해 주시면 반영하겠습니다.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

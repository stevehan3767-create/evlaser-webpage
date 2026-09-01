import Link from "next/link";
import Icon from "./Icon";
import { jobs } from "@/lib/data";

export default function Careers() {
  return (
    <section id="careers" className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="inline-flex items-center gap-2 px-3.5 py-[7px] bg-red text-white font-bold text-[12px] tracking-wide mb-3.5">
          <span className="w-[7px] h-[7px] rounded-full bg-white animate-pulse" />
          채용중 · 상시 지원 가능
        </div>
        <div className="flex flex-wrap justify-between items-end gap-6 mb-11">
          <div>
            <span className="eyebrow">JOIN EV LASER</span>
            <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
              상시채용
            </h1>
            <p className="text-ink-soft mt-2.5">레이저 기술의 미래를 함께 만들어갈 인재를 기다립니다.</p>
          </div>
          <Link href="/support" className="inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025]">
            채용공고 전체보기
          </Link>
        </div>
        <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {jobs.map((j) => (
            <div key={j.title} className="border border-line-strong border-l-4 border-l-red bg-surface p-[22px] flex flex-col gap-2.5">
              <Icon name="briefcase" className="w-6 h-6 text-red" />
              <h3 className="text-[16px]">{j.title}</h3>
              <div className="flex flex-wrap gap-2">
                {[j.type, j.loc, j.due].map((m) => (
                  <span key={m} className="font-mono text-[10.5px] text-ink-soft border border-line-strong px-2 py-[3px] tracking-wide">
                    {m}
                  </span>
                ))}
              </div>
              <Link href="/support" className="mt-2 text-[12.5px] font-bold text-blue inline-flex items-center gap-[5px]">
                지원하기
              </Link>
            </div>
          ))}
        </div>

        <div id="culture" className="mt-16 pt-16 border-t border-line scroll-mt-28">
          <span className="eyebrow">OUR PEOPLE</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            인재상
          </h2>
          <div className="grid gap-[18px] mt-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {[
              { title: "전문성", desc: "레이저 기술 한 우물을 파는 깊이 있는 전문가" },
              { title: "정직함", desc: "고객과 동료에게 신뢰받는 원칙 있는 태도" },
              { title: "도전정신", desc: "새로운 기술과 산업에 두려움 없이 도전하는 자세" },
            ].map((v) => (
              <div key={v.title} className="border border-line p-5">
                <h3 className="font-bold text-[15px]">{v.title}</h3>
                <p className="text-ink-soft text-[13.3px] mt-1.5">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

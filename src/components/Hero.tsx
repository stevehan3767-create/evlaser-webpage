"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { showcaseSlides } from "@/lib/data";

export default function Hero() {
  const [slide, setSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide((s) => (s + 1) % showcaseSlides.length);
    }, 4200);
  };
  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) start();
    return stop;
  }, []);

  return (
    <section
      className="relative overflow-hidden border-b border-line pt-[72px]"
      style={{ background: "linear-gradient(180deg, #EEF4FC, #FFFFFF 78%)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11,77,162,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(11,77,162,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(180deg,rgba(0,0,0,0.9),transparent 85%)",
        }}
      />
      <div
        className="absolute top-[-10%] right-[8%] w-[3px] h-[150%]"
        style={{
          background:
            "linear-gradient(180deg, transparent, var(--red) 35%, #ff8fa0 50%, var(--red) 65%, transparent)",
          transform: "rotate(22deg)",
          filter: "drop-shadow(0 0 10px rgba(228,0,43,0.4))",
          opacity: 0.55,
        }}
      />

      <div className="relative mx-auto max-w-[1240px] px-7 grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-12 items-center py-6 pb-14">
        <div>
          <span className="eyebrow">SINCE 2002 · 레이저기술 전문기업</span>
          <h1 className="mt-[18px] text-[32px] sm:text-[44px] lg:text-[52px] font-extrabold leading-tight tracking-tight text-balance font-[family-name:var(--font-display)]">
            정밀함이 <em className="not-italic text-red">미래 산업</em>을 만듭니다
          </h1>
          <p className="mt-5 max-w-[52ch] text-ink-soft text-[16.5px]">
            자동차·반도체·바이오의료·항공까지 — EV Laser의 정밀 레이저 기술이 차세대 제조 현장을 지탱합니다.
          </p>
          <div className="flex gap-3 mt-8 flex-wrap">
            <Link              href="/products"
              className="inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025] hover:border-[#c40025]"
            >
              제품·기술 보기
            </Link>
            <Link              href="/support"
              className="inline-flex items-center gap-2 px-[18px] py-2.5 bg-transparent text-ink font-bold text-[13.5px] border border-line-strong hover:border-blue hover:text-blue"
            >
              상담 문의하기
            </Link>
          </div>
        </div>

        <div className="relative border border-line bg-surface shadow-xl">
          <div className="relative aspect-[4/3] overflow-hidden" onMouseEnter={stop} onMouseLeave={start}>
            {showcaseSlides.map((s, i) => (
              <div
                key={s.title}
                className="absolute inset-0 flex flex-col justify-end p-[22px] text-white transition-opacity"
                style={{
                  opacity: i === slide ? 1 : 0,
                  background: `linear-gradient(135deg, ${s.from}, ${s.to})`,
                  transitionDuration: "600ms",
                }}
              >
                <Icon name={s.icon} className="w-[46px] h-[46px] opacity-90 mb-auto" strokeWidth={1.4} />
                <span className="font-mono text-[10.5px] tracking-wider opacity-[.85]">{s.tag}</span>
                <h3 className="text-[19px] text-white mt-1">{s.title}</h3>
              </div>
            ))}
          </div>
          <div className="flex gap-[7px] p-3.5 justify-center border-t border-line">
            {showcaseSlides.map((s, i) => (
              <button
                key={s.title}
                aria-label={`slide ${i + 1}`}
                onClick={() => {
                  setSlide(i);
                  start();
                }}
                className={`w-5 h-[3px] ${i === slide ? "bg-red" : "bg-line-strong"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-7 grid grid-cols-2 sm:grid-cols-4 border-t border-line">
        {[
          ["2002", "설립 연도"],
          ["24+", "년간 레이저 기술 경험"],
          ["13", "세부 산업 분야"],
          ["4", "글로벌 서비스 언어"],
        ].map(([num, label], i) => (
          <div key={label} className={`py-[22px] px-[18px] ${i !== 0 ? "border-l border-line" : ""}`}>
            <b className="block font-mono text-[26px] sm:text-[28px] text-blue-deep">{num}</b>
            <span className="text-[11.5px] text-ink-faint tracking-wide">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

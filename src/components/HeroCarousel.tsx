"use client";

import { useEffect, useRef, useState } from "react";

export interface HeroSlideItem {
  id: string;
  imageUrl: string;
  title: string;
}

export default function HeroCarousel({ slides }: { slides: HeroSlideItem[] }) {
  const [slide, setSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (slides.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide((s) => (s + 1) % slides.length);
    }, 2500);
  };
  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
  const goTo = (i: number) => {
    setSlide((i + slides.length) % slides.length);
    start();
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative border border-line bg-surface shadow-xl max-w-[700px] mx-auto md:mx-0">
      <div className="relative aspect-[7/5] overflow-hidden" onMouseEnter={stop} onMouseLeave={start}>
        {slides.map((s, i) => (
          <div key={s.id} className="absolute inset-0 transition-opacity" style={{ opacity: i === slide ? 1 : 0, transitionDuration: "600ms" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.imageUrl} alt={s.title} className="absolute inset-0 w-full h-full object-cover object-center" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.05) 55%, transparent 75%)" }} />
            <div className="absolute inset-x-0 bottom-0 p-[22px]">
              <h3 className="text-[19px] font-bold text-white text-balance">{s.title}</h3>
            </div>
          </div>
        ))}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="이전 이미지"
              onClick={() => goTo(slide - 1)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="다음 이미지"
              onClick={() => goTo(slide + 1)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>
      {slides.length > 1 && (
        <div className="flex gap-[7px] p-3.5 justify-center border-t border-line">
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={`slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`w-5 h-[3px] ${i === slide ? "bg-red" : "bg-line-strong"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

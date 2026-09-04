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
    }, 4200);
  };
  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative border border-line bg-surface shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden" onMouseEnter={stop} onMouseLeave={start}>
        {slides.map((s, i) => (
          <div key={s.id} className="absolute inset-0 transition-opacity" style={{ opacity: i === slide ? 1 : 0, transitionDuration: "600ms" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.imageUrl} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.05) 55%, transparent 75%)" }} />
            <div className="absolute inset-x-0 bottom-0 p-[22px]">
              <h3 className="text-[19px] font-bold text-white text-balance">{s.title}</h3>
            </div>
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="flex gap-[7px] p-3.5 justify-center border-t border-line">
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={`slide ${i + 1}`}
              onClick={() => {
                setSlide(i);
                start();
              }}
              className={`w-5 h-[3px] ${i === slide ? "bg-red" : "bg-line-strong"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

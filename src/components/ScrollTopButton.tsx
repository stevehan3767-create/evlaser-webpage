"use client";

import { useEffect, useState } from "react";

// 목록을 아래로 내렸을 때 나타나는 "맨 위로 가기" 버튼.
// 클릭하면 페이지 최상단(해당 카테고리의 가장 최신 소식)으로 부드럽게 이동한다.
export default function ScrollTopButton({ label = "맨 위로" }: { label?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-5 z-50 inline-flex items-center gap-1.5 rounded-full bg-red px-4 py-3 text-[12.5px] font-bold text-white shadow-[0_6px_18px_rgba(17,20,24,0.22)] transition-all duration-300 hover:bg-[#c40025] ${
        show ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <svg viewBox="0 0 12 8" className="w-3 h-2 rotate-180" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 1.5 6 6.5 11 1.5" />
      </svg>
      {label}
    </button>
  );
}

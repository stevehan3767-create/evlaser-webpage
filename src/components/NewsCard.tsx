"use client";

import { useState } from "react";
import type { NewsRow, NewsImageRow } from "@/lib/repo";
import ImageGallery from "./ImageGallery";

// 이미지 테두리 스타일 A: 둥근 모서리 + 부드러운 그림자
const IMG_SHADOW = "shadow-[0_6px_18px_rgba(17,20,24,0.14),0_1px_3px_rgba(17,20,24,0.08)]";

// 사내소식·전시회소식 한 건: 썸네일 + 제목/메타 + 2줄 미리보기.
// "전문 보기"(파란 버튼)를 누르면 본문 전체 + 사진이 펼쳐지고,
// 펼친 내용 아무 곳이나(또는 "닫기") 누르면 다시 접힌다.
export default function NewsCard({ n, images }: { n: NewsRow; images: NewsImageRow[] }) {
  const isNotice = n.postNo === "공지";
  const thumb = images[0]?.url ?? null;
  const hasDetail = Boolean(n.body) || images.length > 0;
  const [open, setOpen] = useState(false);

  const thumbEl = (
    <div className="flex-none">
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" loading="lazy" className={`w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl ${IMG_SHADOW}`} />
      ) : (
        <span className="block w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-dashed border-line-strong bg-surface-alt" />
      )}
    </div>
  );

  const meta = (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11.5px] sm:text-[12px] text-ink-faint">
      <span>등록일: <span className="font-mono">{n.date}</span></span>
      {n.views != null && <span>조회 {n.views.toLocaleString()}</span>}
      {images.length > 0 && <span className="font-semibold text-blue">사진 {images.length}</span>}
    </div>
  );

  return (
    <div className="border-b border-line py-5">
      <div className="flex gap-4 sm:gap-5">
        {thumbEl}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
            <div className="flex items-center gap-2 min-w-0">
              {isNotice ? (
                <span className="flex-none inline-block text-[11px] font-bold text-white bg-red rounded-[5px] px-1.5 py-0.5">공지</span>
              ) : (
                n.postNo && <span className="flex-none font-mono text-[12.5px] text-ink-faint">#{n.postNo}</span>
              )}
              <span className="truncate font-bold text-[15px] sm:text-[16px] text-ink">{n.title}</span>
            </div>
            <div className="flex-none">{meta}</div>
          </div>

          {n.body && (
            // 본문 아무 곳이나 클릭하면 펼치기/닫기가 토글된다.
            <p
              onClick={() => setOpen((v) => !v)}
              className={`mt-2 max-w-[85ch] text-ink-soft text-[13px] sm:text-[13.5px] leading-relaxed whitespace-pre-line cursor-pointer ${
                open ? "" : "line-clamp-2"
              }`}
            >
              {n.body}
            </p>
          )}

          {hasDetail && (
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="inline-flex items-center gap-1.5 rounded-sm bg-blue px-3.5 py-2 text-[12.5px] font-bold text-white hover:bg-[#1e4fd6] transition-colors"
              >
                {open ? "닫기" : "전문 보기"}
                <svg viewBox="0 0 12 8" className={`w-2.5 h-2 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1.5 6 6.5 11 1.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 펼친 영역: 사진 그리드(클릭 시 확대). 사진 클릭은 본문을 닫지 않는다. */}
      {open && images.length > 0 && (
        <div className="pt-4 sm:pl-[148px]">
          <ImageGallery images={images} minWidth={160} />
        </div>
      )}
    </div>
  );
}

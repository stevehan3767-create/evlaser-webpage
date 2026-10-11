"use client";

import { useState } from "react";

// 언론·방송 / 논문·학술 카드의 본문 + 액션 버튼.
// 전문 보기(펼침/접기)·원문 보기·다운로드를 한 줄에 나란히, 버튼 형태로 배치한다.
export default function PressBody({
  body,
  linkUrl,
  pdfUrl,
  pdfName,
  viewOriginalLabel,
  downloadLabel,
}: {
  body: string | null;
  linkUrl: string | null;
  pdfUrl: string | null;
  pdfName: string | null;
  viewOriginalLabel: string;
  downloadLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {body && (
        // 펼친 상태에서는 본문 아무 곳이나 클릭하면 닫힌다.
        <p
          onClick={open ? () => setOpen(false) : undefined}
          className={`mt-2 whitespace-pre-line text-[13.5px] text-ink-soft leading-relaxed max-w-[75ch] ${
            open ? "cursor-pointer" : "line-clamp-3"
          }`}
        >
          {body}
        </p>
      )}

      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        {body && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 rounded-sm bg-blue px-3.5 py-2 text-[12.5px] font-bold text-white hover:bg-[#1e4fd6] transition-colors"
          >
            {open ? (
              <>
                닫기
                <svg viewBox="0 0 12 8" className="w-2.5 h-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 6.5 6 1.5 11 6.5" />
                </svg>
              </>
            ) : (
              <>
                전문 보기
                <svg viewBox="0 0 12 8" className="w-2.5 h-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1.5 6 6.5 11 1.5" />
                </svg>
              </>
            )}
          </button>
        )}

        {linkUrl && (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-3.5 py-2 text-[12.5px] font-bold text-ink-soft hover:border-blue hover:text-blue transition-colors"
          >
            {viewOriginalLabel} ↗
          </a>
        )}

        {pdfUrl && (
          <a
            href={pdfUrl}
            download={pdfName ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm bg-red px-3.5 py-2 text-[12.5px] font-bold text-white hover:bg-[#c40025] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
            </svg>
            {downloadLabel}
          </a>
        )}
      </div>
    </>
  );
}

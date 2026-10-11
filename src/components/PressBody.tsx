"use client";

import { useState } from "react";

const IMG_SHADOW = "shadow-[0_6px_18px_rgba(17,20,24,0.14),0_1px_3px_rgba(17,20,24,0.08)]";

export interface PressImage {
  url: string;
  caption?: string | null;
  content?: string | null;
}

function PressImageGrid({ images }: { images: PressImage[] }) {
  return (
    <div className="grid gap-4 pb-1" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
      {images.map((img, i) => (
        <figure key={i} className={`rounded-xl overflow-hidden bg-surface ${IMG_SHADOW}`}>
          <div className="aspect-[4/3] bg-surface-alt overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.caption ?? ""} loading="lazy" className="w-full h-full object-cover" />
          </div>
          {(img.caption || img.content) && (
            <figcaption className="px-2.5 py-2">
              {img.caption && <b className="block text-[12px] font-bold text-ink leading-snug">{img.caption}</b>}
              {img.content && <span className="block mt-0.5 text-[11px] text-ink-faint leading-snug">{img.content}</span>}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

// 언론·방송 / 논문·학술 카드의 본문 + 사진 + 액션 버튼.
// 전문 보기(펼침/접기)·원문 보기·다운로드를 한 줄에 나란히, 버튼 형태로 배치한다.
// 펼치면 본문 전체 + 행사사진 그리드가 이어서 표시되고, 본문/사진 아무 곳이나(또는 "닫기") 누르면 접힌다.
export default function PressBody({
  body,
  linkUrl,
  pdfUrl,
  pdfName,
  viewOriginalLabel,
  downloadLabel,
  images = [],
}: {
  body: string | null;
  linkUrl: string | null;
  pdfUrl: string | null;
  pdfName: string | null;
  viewOriginalLabel: string;
  downloadLabel: string;
  images?: PressImage[];
}) {
  const [open, setOpen] = useState(false);
  const hasDetail = Boolean(body) || images.length > 0;

  return (
    <>
      {body && (
        // 본문 아무 곳이나 클릭하면 펼치기/닫기가 토글된다.
        <p
          onClick={() => setOpen((v) => !v)}
          className={`mt-2 whitespace-pre-line text-[13.5px] text-ink-soft leading-relaxed max-w-[75ch] cursor-pointer ${
            open ? "" : "line-clamp-3"
          }`}
        >
          {body}
        </p>
      )}

      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        {hasDetail && (
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

      {/* 펼친 영역: 행사사진 그리드. 아무 곳이나 클릭하면 닫힌다. */}
      {open && images.length > 0 && (
        <div onClick={() => setOpen(false)} className="cursor-pointer mt-4">
          <PressImageGrid images={images} />
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

const IMG_SHADOW = "shadow-[0_6px_18px_rgba(17,20,24,0.14),0_1px_3px_rgba(17,20,24,0.08)]";

export interface GalleryImage {
  url: string;
  caption?: string | null;
  content?: string | null;
}

// 행사사진 그리드 + 라이트박스.
// 사진을 클릭하면 확대(라이트박스)되고, 확대 상태에서 다시 클릭(또는 ESC)하면 원상태로 닫힌다.
// 사진 클릭은 펼친 본문을 닫지 않는다(본문 클릭/닫기 버튼으로만 접힘).
export default function ImageGallery({ images, minWidth = 180 }: { images: GalleryImage[]; minWidth?: number }) {
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  return (
    <>
      <div className="grid gap-4 pb-1" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))` }}>
        {images.map((img, i) => (
          <figure key={i} className={`rounded-xl overflow-hidden bg-surface ${IMG_SHADOW}`}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoom(i);
              }}
              aria-label="사진 확대"
              className="block w-full cursor-zoom-in"
            >
              <span className="block aspect-[4/3] bg-surface-alt overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.caption ?? ""} loading="lazy" className="w-full h-full object-cover transition-transform duration-200 hover:scale-[1.03]" />
              </span>
            </button>
            {(img.caption || img.content) && (
              <figcaption className="px-2.5 py-2">
                {img.caption && <b className="block text-[12px] font-bold text-ink leading-snug">{img.caption}</b>}
                {img.content && <span className="block mt-0.5 text-[11px] text-ink-faint leading-snug">{img.content}</span>}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {zoom !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-3 bg-black/85 p-4 cursor-zoom-out"
        >
          <button
            type="button"
            aria-label="닫기"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white text-2xl leading-none hover:bg-white/25"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[zoom].url}
            alt={images[zoom].caption ?? ""}
            className="max-w-[94vw] max-h-[82vh] object-contain rounded-md shadow-2xl"
          />
          {images[zoom].caption && (
            <p className="max-w-[90vw] text-center text-[13px] text-white/90">{images[zoom].caption}</p>
          )}
        </div>
      )}
    </>
  );
}

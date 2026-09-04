"use client";

import { useState, type ReactNode } from "react";

export default function LinkPreviewButton({
  url,
  label,
  className,
  children,
}: {
  url: string;
  label: string;
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children ?? label}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-surface w-full max-w-[960px] h-[85vh] flex flex-col shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 p-3 border-b border-line flex-none">
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-bold text-blue truncate">
                새 탭에서 열기 ↗
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="w-8 h-8 flex-none flex items-center justify-center text-ink-soft hover:text-red border border-line-strong rounded-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>
            </div>
            <iframe src={url} className="flex-1 w-full border-0" />
            <div className="p-2.5 border-t border-line text-[11.5px] text-ink-faint text-center flex-none">
              화면이 표시되지 않으면 위의 &quot;새 탭에서 열기&quot;를 이용해 주세요.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

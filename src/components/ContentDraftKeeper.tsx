"use client";

import { useEffect, useRef, useState } from "react";

// 저장하지 않은 입력을 브라우저(localStorage)에 자동 임시 보관하고, 편집 화면에
// 다시 들어왔을 때 복원할 수 있게 해준다. 저장(제출) 시 임시본은 삭제된다.
// 이미지 등 대용량 필드는 제외하고 텍스트 필드만 보관한다.
const FIELDS = ["title", "nameEn", "model", "description", "specTable", "oemSource"];

export default function ContentDraftKeeper({ storageKey }: { storageKey: string }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [draftMeta, setDraftMeta] = useState<{ has: boolean; at: number | null }>({ has: false, at: null });
  const hasDraft = draftMeta.has;
  const savedAt = draftMeta.at;

  const getForm = () => anchorRef.current?.closest("form") ?? null;

  useEffect(() => {
    let next: { has: boolean; at: number | null } = { has: false, at: null };
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        next = { has: true, at: typeof parsed?.t === "number" ? parsed.t : null };
      }
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftMeta(next);
  }, [storageKey]);

  useEffect(() => {
    const form = getForm();
    if (!form) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const save = () => {
      try {
        const data: Record<string, string> = {};
        for (const name of FIELDS) {
          const el = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
          if (el && "value" in el) data[name] = el.value;
        }
        localStorage.setItem(storageKey, JSON.stringify({ t: Date.now(), data }));
      } catch {}
    };
    const onInput = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(save, 600);
    };
    const onSubmit = () => {
      try {
        localStorage.removeItem(storageKey);
      } catch {}
    };
    form.addEventListener("input", onInput);
    form.addEventListener("submit", onSubmit);
    return () => {
      form.removeEventListener("input", onInput);
      form.removeEventListener("submit", onSubmit);
      if (timer) clearTimeout(timer);
    };
  }, [storageKey]);

  const restore = () => {
    const form = getForm();
    if (!form) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const data = (JSON.parse(raw).data ?? {}) as Record<string, string>;
      for (const name of FIELDS) {
        if (data[name] === undefined) continue;
        const el = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
        if (el && "value" in el) {
          el.value = data[name];
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
      setDraftMeta({ has: false, at: null });
    } catch {}
  };

  const discard = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    setDraftMeta({ has: false, at: null });
  };

  if (!hasDraft) return <div ref={anchorRef} className="hidden" />;

  const when = savedAt ? new Date(savedAt).toLocaleString("ko-KR") : "";

  return (
    <div ref={anchorRef} className="mb-4 flex flex-wrap items-center gap-3 border border-[#f5c26b] bg-[#fff8e8] px-4 py-3 rounded-sm text-[12.5px]">
      <span className="text-ink">
        저장하지 않은 임시 입력이 있습니다{when ? ` (${when})` : ""}. 이어서 작성하시겠어요?
      </span>
      <div className="flex gap-2">
        <button type="button" onClick={restore} className="px-3 py-1.5 bg-blue text-white font-bold rounded-sm">
          불러오기
        </button>
        <button type="button" onClick={discard} className="px-3 py-1.5 border border-line-strong font-bold rounded-sm">
          삭제
        </button>
      </div>
    </div>
  );
}

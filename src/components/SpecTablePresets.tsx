"use client";

import { standardSpecRows } from "@/lib/data";

// 관리자 사양서 입력을 빠르게 하기 위한 "사양 표 템플릿" — 버튼을 클릭하면
// 미리 짜인 표(항목 | 값)가 사양 표 입력칸(textarea id="specTable")에 채워지고,
// 관리자는 값만 수정하면 된다. 이미지 클릭 삽입과 동일한 사용감.
const PRESETS: { label: string; rows: string[] }[] = [
  {
    label: "표준 사양서 (기본 항목)",
    rows: standardSpecRows.map((r) => `${r} | `),
  },
  {
    label: "빈 표 (기본 5행)",
    rows: ["항목1 (Item) | ", "항목2 (Item) | ", "항목3 (Item) | ", "항목4 (Item) | ", "항목5 (Item) | "],
  },
];

export default function SpecTablePresets({ targetId }: { targetId: string }) {
  function insert(rows: string[], append: boolean) {
    const el = document.getElementById(targetId) as HTMLTextAreaElement | null;
    if (!el) return;
    const text = rows.join("\n");
    el.value = append && el.value.trim() ? el.value.replace(/\s*$/, "") + "\n" + text : text;
    el.focus();
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-2">
      <span className="text-[11.5px] text-ink-faint mr-1">표 템플릿 클릭 삽입:</span>
      {PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => insert(p.rows, false)}
          title="클릭하면 이 사양 표가 입력칸에 채워집니다 (기존 내용 대체)"
          className="px-2.5 py-1 border border-line-strong rounded-sm text-[11.5px] font-bold text-blue hover:border-blue hover:bg-surface-alt"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

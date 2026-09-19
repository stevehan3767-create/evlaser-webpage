"use client";

// 관리자 사양서 입력을 빠르게 하기 위한 "사양 표 템플릿" — 버튼을 클릭하면
// 미리 짜인 표(항목 | 값)가 사양 표 입력칸(textarea id="specTable")에 채워지고,
// 관리자는 값만 수정하면 된다. 이미지 클릭 삽입과 동일한 사용감.
const PRESETS: { label: string; rows: string[] }[] = [
  {
    label: "레이저 절단·정밀가공",
    rows: [
      "모델 (Model) | ",
      "레이저 종류 (Laser type) | ",
      "레이저 출력 (Laser power) | ",
      "스캔 범위 (Scan range) | ",
      "가공 영역 (Working area) | ",
      "반복 정밀도 (Repeatability) | ±  μm",
      "위치 정밀도 (Positioning accuracy) | ±  μm",
      "가공 패턴 (Processing pattern) | ",
      "사용 온도 (Ambient temperature) | 20 ℃ ± 2 ℃",
      "사용 습도 (Ambient humidity) | ≤ 60 % RH, 비결로 (Non-condensing)",
      "전원 (Power) | ",
    ],
  },
  {
    label: "레이저 마킹",
    rows: [
      "모델 (Model) | ",
      "레이저 종류 (Laser type) | ",
      "레이저 출력 (Laser power) | ",
      "파장 (Wavelength) | ",
      "마킹 범위 (Marking area) | ",
      "마킹 속도 (Marking speed) | ",
      "반복 정밀도 (Repeatability) | ±  μm",
      "최소 선폭 (Min. line width) | ",
      "냉각 방식 (Cooling) | ",
      "전원 (Power) | ",
    ],
  },
  {
    label: "레이저 용접",
    rows: [
      "모델 (Model) | ",
      "레이저 종류 (Laser type) | ",
      "레이저 출력 (Laser power) | ",
      "용접 방식 (Welding method) | ",
      "작업 영역 (Working area) | ",
      "위치 정밀도 (Positioning accuracy) | ±  μm",
      "냉각 방식 (Cooling) | ",
      "전원 (Power) | ",
      "외형 치수 (Dimensions) | ",
    ],
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

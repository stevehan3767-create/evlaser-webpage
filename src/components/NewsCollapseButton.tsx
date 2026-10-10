"use client";

// 펼쳐진 뉴스 글을 닫는 버튼. 클릭 시 가장 가까운 <details>를 닫고
// 해당 글 제목 위치로 스크롤을 되돌린다.
export default function NewsCollapseButton() {
  return (
    <button
      type="button"
      onClick={(e) => {
        const d = e.currentTarget.closest("details");
        if (d) {
          d.removeAttribute("open");
          d.scrollIntoView({ block: "nearest" });
        }
      }}
      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 py-2 text-[12.5px] font-bold text-ink-soft hover:border-blue hover:text-blue transition-colors"
    >
      닫기
      <svg viewBox="0 0 12 8" className="w-2.5 h-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 6.5 6 1.5 11 6.5" />
      </svg>
    </button>
  );
}

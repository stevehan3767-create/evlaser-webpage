"use client";

export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="print-btn">
      인쇄 / PDF로 저장
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import ItemCardsGrid, { type ItemCard } from "./ItemCardsGrid";
import type { IconName } from "@/lib/data";

export interface FinderCard extends ItemCard {
  // 축(group) → 이 설비가 가진 값(key) 목록. 예: { tech: ["cutting"], material: ["metalSteel","glass"] }
  facetKeys: Record<string, string[]>;
}

export interface FacetTile {
  itemKey: string;
  name: string;
  icon: string;
}

export interface FacetGroup {
  group: string;
  label: string;
  tiles: FacetTile[];
}

// 설비 파인더 — 기본 화면은 결과(설비 카드)만 보여 단순하게 두고, 필터는
// "필터" 버튼으로 여는 패널에서 조정한다. 한 축 안에서 여러 개를 고르면 OR,
// 축과 축 사이는 AND. 아무 것도 고르지 않은 축은 제약이 없다(=전체).
// 선택은 즉시 반영되며, 선택한 조건은 상단 요약칩으로 항상 확인·해제할 수 있다.
export default function LineupFinder({
  lineupCards,
  facets,
  emptyMessage,
}: {
  lineupCards: FinderCard[];
  facets: FacetGroup[];
  emptyMessage: string;
}) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [open, setOpen] = useState(false);
  // 초기 화면에는 설비를 보여주지 않는다. 조건을 고르거나 "모든 설비 보기"를 눌러야 표시.
  const [showAll, setShowAll] = useState(false);
  // "모든 설비 보기"를 켜기 직전의 선택 상태(다시 누르면 이 상태로 복귀).
  const [beforeAll, setBeforeAll] = useState<Record<string, string[]>>({});

  // 메인 화면의 "조건으로 설비 찾기"에서 넘어오면(?finder=open) 필터 패널을 자동으로 연다.
  useEffect(() => {
    let shouldOpen = false;
    try {
      shouldOpen = new URLSearchParams(window.location.search).get("finder") === "open";
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (shouldOpen) setOpen(true);
  }, []);

  // 패널이 열려 있는 동안에는 뒤 화면이 같이 스크롤되지 않게 한다.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function toggle(group: string, key: string) {
    // 조건을 직접 고르면 "모든 설비 보기" 모드는 해제한다.
    setShowAll(false);
    setSelected((prev) => {
      const cur = prev[group] ?? [];
      const next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
      const copy = { ...prev };
      if (next.length === 0) delete copy[group];
      else copy[group] = next;
      return copy;
    });
  }

  const activeGroups = Object.keys(selected);
  const filtered = lineupCards.filter((card) =>
    activeGroups.every((group) => {
      const have = card.facetKeys[group] ?? [];
      return selected[group].some((k) => have.includes(k));
    })
  );
  const selectedCount = activeGroups.reduce((n, g) => n + selected[g].length, 0);
  const hasSelection = selectedCount > 0;
  // 표시할 설비: 조건이 있으면 필터 결과, 없고 "모든 설비 보기"면 전체, 둘 다 아니면 없음.
  const visible = hasSelection ? filtered : showAll ? lineupCards : [];

  // "모든 설비 보기" 토글 — 켤 때 현재 선택을 기억하고, 다시 누르면 그 상태로 복귀한다.
  function toggleShowAll() {
    if (showAll) {
      setShowAll(false);
      setSelected(beforeAll);
    } else {
      setBeforeAll(selected);
      setSelected({});
      setShowAll(true);
    }
  }

  function reset() {
    setSelected({});
    setShowAll(false);
    setBeforeAll({});
  }

  function nameOf(group: string, key: string) {
    return facets.find((f) => f.group === group)?.tiles.find((t) => t.itemKey === key)?.name ?? key;
  }

  // 상단 3버튼을 하나의 통일된 디자인군으로 구성한다.
  // 공통: 같은 크기·모서리·글자, 브랜드 레드를 기준 색으로.
  const btnBase =
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-[12.5px] font-bold border transition-colors";
  const allOn = showAll && !hasSelection;
  const btnPrimary = `${btnBase} bg-red text-white border-red hover:bg-[#c40025]`; // 조건으로 찾기(주 버튼)
  const btnAll = `${btnBase} ${allOn ? "bg-red-soft text-red border-red" : "bg-surface text-ink border-line-strong hover:border-red hover:text-red"}`; // 모든 설비 보기
  const btnReset = `${btnBase} bg-surface text-ink-soft border-line-strong hover:border-red hover:text-red`; // 초기화

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={btnPrimary}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-none" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 5h18M6 12h12M10 19h4" />
          </svg>
          조건으로 찾기
          {selectedCount > 0 && (
            <span className="bg-white text-red rounded-full text-[10.5px] font-bold px-1.5 py-px">{selectedCount}</span>
          )}
        </button>

        <button
          type="button"
          onClick={toggleShowAll}
          aria-pressed={allOn}
          className={btnAll}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-none" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          모든 설비 보기
        </button>

        <button type="button" onClick={reset} className={btnReset}>
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-none" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          초기화
        </button>

        {activeGroups.flatMap((g) =>
          selected[g].map((k) => (
            <button
              key={`${g}-${k}`}
              type="button"
              onClick={() => toggle(g, k)}
              title="이 조건 해제"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red bg-red-soft text-red text-[11.5px] font-bold"
            >
              {nameOf(g, k)}
              <span className="opacity-60">✕</span>
            </button>
          ))
        )}

      </div>

      {hasSelection ? (
        <p className="text-[12.5px] text-ink-soft mb-4">
          조건에 맞는 설비 <b className="text-ink">{filtered.length}개</b> <span className="text-ink-faint">/ 전체 {lineupCards.length}개</span>
        </p>
      ) : showAll ? (
        <p className="text-[12.5px] text-ink-soft mb-4">
          전체 설비 <b className="text-ink">{lineupCards.length}개</b>
        </p>
      ) : null}

      {!hasSelection && !showAll ? (
        <div className="border border-dashed border-line-strong rounded-md bg-surface-alt/60 px-6 py-12 text-center">
          <p className="text-[14px] font-bold text-ink mb-1.5">찾으시는 조건을 선택해 주세요</p>
          <p className="text-[13px] text-ink-soft mb-5">
            위의 <b className="text-ink">&quot;조건으로 찾기&quot;</b>에서 기술종류·재료·산업분야를 고르면(복수 선택 가능) 맞는 설비가 표시됩니다.
          </p>
          <button type="button" onClick={toggleShowAll} className={btnAll}>
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-none" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            모든 설비 보기 ({lineupCards.length}개)
          </button>
        </div>
      ) : (
        <ItemCardsGrid
          items={visible}
          hrefFor={(k) => `/products/lineup/${k}`}
          minColWidth="220px"
          iconColorClass="text-red"
          emptyMessage={emptyMessage}
        />
      )}

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} aria-hidden />
          <aside
            role="dialog"
            aria-label="설비 조건 선택"
            className="absolute right-0 top-0 h-full w-[330px] max-w-[86vw] bg-surface flex flex-col shadow-[-6px_0_18px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-line flex-none">
              <span className="text-[13.5px] font-bold">설비 찾기 · 조건 선택</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="닫기" className="text-ink-faint text-[17px] leading-none px-1">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-1">
              {facets.map((f) => (
                <div key={f.group} className="py-3.5 border-b border-line last:border-b-0">
                  <div className="text-[12px] font-bold text-ink-soft mb-2">{f.label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {f.tiles.map((t) => {
                      const on = (selected[f.group] ?? []).includes(t.itemKey);
                      return (
                        <button
                          key={t.itemKey}
                          type="button"
                          onClick={() => toggle(f.group, t.itemKey)}
                          aria-pressed={on}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-sm text-[12px] font-semibold whitespace-nowrap transition-colors ${
                            on ? "bg-red text-white border-red" : "border-line-strong text-ink-soft hover:border-blue hover:text-blue"
                          }`}
                        >
                          <Icon name={t.icon as IconName} className="w-3.5 h-3.5 flex-none" strokeWidth={1.6} />
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 px-4 py-3 border-t border-line flex-none">
              <button
                type="button"
                onClick={reset}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-md border border-line-strong bg-surface-alt text-ink text-[12.5px] font-bold hover:border-red hover:text-red transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 flex-none" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                초기화
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-md border border-red bg-red text-white text-[12.5px] font-bold hover:bg-[#c40025] transition-colors"
              >
                적용 ({hasSelection ? filtered.length : 0}개)
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

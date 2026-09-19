"use client";

import { useState } from "react";
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

// 설비 파인더 — 여러 축(기술/재료/산업/발진방식/파장/펄스)을 조합해 설비를
// 걸러낸다. 한 축 안에서 여러 개를 고르면 OR, 축과 축 사이는 AND. 아무 것도
// 고르지 않은 축은 제약이 없다(=전체). 모든 필터링은 미리 받아둔 데이터로
// 클라이언트에서 즉시 처리하므로 새로고침이 없다.
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

  function toggle(group: string, key: string) {
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
  const anyActive = activeGroups.length > 0;

  return (
    <div>
      <div className="border border-line rounded-sm divide-y divide-line mb-5">
        {facets.map((f) => (
          <div key={f.group} className="p-3.5 sm:flex sm:items-start sm:gap-4">
            <span className="block sm:w-[84px] sm:flex-none text-[12.5px] font-bold text-ink-soft mb-2 sm:mb-0 sm:pt-1.5">
              {f.label}
            </span>
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

      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-[12.5px] text-ink-soft">
          전체 {lineupCards.length}개 중 <b className="text-ink">{filtered.length}개</b>
        </p>
        {anyActive && (
          <button type="button" onClick={() => setSelected({})} className="text-[12px] font-bold text-blue hover:underline">
            필터 초기화
          </button>
        )}
      </div>

      <ItemCardsGrid
        items={filtered}
        hrefFor={(k) => `/products/lineup/${k}`}
        minColWidth="190px"
        iconColorClass="text-red"
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

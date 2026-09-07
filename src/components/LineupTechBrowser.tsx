"use client";

import { useState } from "react";
import Icon from "./Icon";
import ItemCardsGrid, { type ItemCard } from "./ItemCardsGrid";
import type { IconName } from "@/lib/data";

export interface LineupCard extends ItemCard {
  techKeys: string[];
}

export interface TechTile {
  itemKey: string;
  name: string;
  icon: string;
}

export default function LineupTechBrowser({ lineupCards, techTiles }: { lineupCards: LineupCard[]; techTiles: TechTile[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = selected ? lineupCards.filter((c) => c.techKeys.includes(selected)) : lineupCards;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className={`px-3 py-2 border rounded-sm text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
            selected === null ? "bg-red text-white border-red" : "border-line-strong text-ink-soft hover:border-blue hover:text-blue"
          }`}
        >
          전체
        </button>
        {techTiles.map((t) => (
          <button
            key={t.itemKey}
            type="button"
            onClick={() => setSelected(t.itemKey)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 border rounded-sm text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
              selected === t.itemKey ? "bg-red text-white border-red" : "border-line-strong text-ink-soft hover:border-blue hover:text-blue"
            }`}
          >
            <Icon name={t.icon as IconName} className="w-3.5 h-3.5 flex-none" strokeWidth={1.6} />
            {t.name}
          </button>
        ))}
      </div>

      <ItemCardsGrid
        items={filtered}
        hrefFor={(k) => `/products/lineup/${k}`}
        minColWidth="190px"
        iconColorClass="text-red"
        emptyMessage="이 기술 카테고리에 등록된 설비가 없습니다."
      />
    </div>
  );
}

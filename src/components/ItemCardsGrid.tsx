import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import type { IconName } from "@/lib/data";

export interface ItemCard {
  itemKey: string;
  name: string;
  icon: string;
  imageUrl?: string;
}

// Presentational-only (no data fetching), so it can be rendered from either a
// Server Component (GroupItemGrid) or a Client Component (LineupTechBrowser).
export default function ItemCardsGrid({
  items,
  hrefFor,
  minColWidth = "190px",
  iconColorClass = "text-red",
  emptyMessage,
}: {
  items: ItemCard[];
  hrefFor: (itemKey: string) => string;
  minColWidth?: string;
  iconColorClass?: string;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return emptyMessage ? <p className="text-[13px] text-ink-faint py-8 text-center">{emptyMessage}</p> : null;
  }

  return (
    <div className="grid gap-px bg-line border border-line" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}, 1fr))` }}>
      {items.map((item) => (
        <Link
          key={item.itemKey}
          href={hrefFor(item.itemKey)}
          className="group bg-surface flex flex-col hover:bg-surface-alt transition-colors"
        >
          {item.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="w-full h-[72px] object-cover bg-surface-alt border-b border-line" />
          )}
          <div className="flex-1 px-3 py-2.5 flex items-center justify-center gap-2">
            <Icon name={item.icon as IconName} className={`w-5 h-5 flex-none ${iconColorClass}`} strokeWidth={1.5} />
            <h3 className="text-[13.5px] font-semibold leading-snug text-center">{item.name}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

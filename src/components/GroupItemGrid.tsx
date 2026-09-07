import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import { contentGroups, type IconName } from "@/lib/data";
import { contentItemRepo, contentPageRepo, seedContentItemsIfEmpty } from "@/lib/repo";

// Shared card grid for every /products/[group] listing (설비 라인업 / 기술종류별
// / 산업분야별 / 재료별): a small representative-image thumbnail on top (when
// the admin has registered one) with a centered icon + name row below.
export default async function GroupItemGrid({
  group,
  minColWidth = "190px",
  iconColorClass = "text-red",
}: {
  group: string;
  minColWidth?: string;
  iconColorClass?: string;
}) {
  const meta = contentGroups[group];
  await seedContentItemsIfEmpty(group, meta.itemSeeds);
  const [items, pages] = await Promise.all([
    contentItemRepo.listByGroup(group),
    contentPageRepo.listAll().catch(() => []),
  ]);
  const imageByKey = new Map(
    pages.filter((p) => p.groupKey === group && p.imageUrl).map((p) => [p.itemKey, p.imageUrl as string])
  );

  return (
    <div className="grid gap-px bg-line border border-line" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}, 1fr))` }}>
      {items.map((item) => {
        const imageUrl = imageByKey.get(item.itemKey);
        return (
          <Link
            key={item.id}
            href={`/products/${group}/${item.itemKey}`}
            className="group bg-surface flex flex-col hover:bg-surface-alt transition-colors"
          >
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="w-full h-[72px] object-cover bg-surface-alt border-b border-line" />
            )}
            <div className="flex-1 px-3 py-2.5 flex items-center justify-center gap-2">
              <Icon name={item.icon as IconName} className={`w-5 h-5 flex-none ${iconColorClass}`} strokeWidth={1.5} />
              <h3 className="text-[13.5px] font-semibold leading-snug text-center">{item.name}</h3>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

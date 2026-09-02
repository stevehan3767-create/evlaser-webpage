import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Icon from "@/components/Icon";
import { contentGroups } from "@/lib/data";
import { contentPageRepo, contentCaseRepo, seedContentIfEmpty } from "@/lib/repo";

export const dynamic = "force-dynamic";

const GROUP_EYEBROWS: Record<string, string> = {
  lineup: "EQUIPMENT LINEUP",
  tech: "TECHNOLOGY",
  industry: "INDUSTRY",
  material: "MATERIAL",
};

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ group: string; key: string }>;
}) {
  const { group, key } = await params;
  const meta = contentGroups[group];
  const item = meta?.items.find((i) => i.key === key);
  if (!meta || !item) notFound();

  await seedContentIfEmpty(group, meta.seeds);
  const [page, cases, tp, tLabel] = await Promise.all([
    contentPageRepo.get(group, key),
    contentCaseRepo.listByKey(group, key),
    getTranslations("contentPage"),
    meta.i18nNamespace ? getTranslations(meta.i18nNamespace) : Promise.resolve(null),
  ]);

  const label = tLabel ? tLabel(key) : meta.labelsKo[key];
  const title = page?.title || label;

  return (
    <div className="py-16 sm:py-22">
      <div className="mx-auto max-w-[1240px] px-7">
        <Link href={meta.backHref} className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue mb-6">
          ← {tp("backToList")}
        </Link>

        <span className="eyebrow">{GROUP_EYEBROWS[group]}</span>
        <div className="flex items-center gap-3 mt-2.5">
          <Icon name={item.icon} className="w-8 h-8 text-red flex-none" strokeWidth={1.5} />
          <h1 className="text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">{title}</h1>
        </div>

        <div className="mt-8 max-w-[74ch]">
          {page?.description ? (
            <p className="text-ink-soft text-[14.5px] leading-relaxed whitespace-pre-wrap">{page.description}</p>
          ) : (
            <p className="text-ink-faint text-[13.5px]">{tp("descriptionEmpty")}</p>
          )}
        </div>

        <div className="mt-14 pt-10 border-t border-line">
          <h2 className="text-[18px] font-bold mb-6">
            {tp("casesHeading")} <span className="font-mono text-ink-faint text-[13px]">({cases.length})</span>
          </h2>

          {cases.length === 0 ? (
            <p className="text-ink-faint text-[13.5px]">{tp("casesEmpty")}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cases.map((c) => (
                <div key={c.id} className="border border-line-strong bg-surface">
                  {(c.productImageUrl || c.equipmentImageUrl) && (
                    <div className="grid grid-cols-2 border-b border-line">
                      {c.productImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.productImageUrl} alt={c.productName} className="w-full aspect-square object-cover" />
                      ) : (
                        <div className="aspect-square bg-surface-alt" />
                      )}
                      {c.equipmentImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.equipmentImageUrl} alt={tp("equipmentImageLabel")} className="w-full aspect-square object-cover border-l border-line" />
                      ) : (
                        <div className="aspect-square bg-surface-alt border-l border-line" />
                      )}
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-2.5">
                    <h3 className="font-bold text-[14px]">{c.productName}</h3>
                    {c.videoUrl && (
                      <a href={c.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[12px] text-blue font-bold">
                        <Icon name="play" className="w-3.5 h-3.5 flex-none" />
                        {tp("videoLabel")}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

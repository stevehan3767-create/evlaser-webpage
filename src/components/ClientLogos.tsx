import { clientLogoRepo, seedClientLogosIfEmpty } from "@/lib/repo";
import { defaultClientNames } from "@/lib/data";

export default async function ClientLogos() {
  const logos = await seedClientLogosIfEmpty(defaultClientNames)
    .then(() => clientLogoRepo.list())
    .catch(() => []);
  if (logos.length === 0) return null;

  return (
    <div className="bg-surface py-14 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="text-center mb-9">
          <p className="font-mono text-[12px] font-bold tracking-[0.18em] text-red mb-2">OUR PARTNERS</p>
          <h2 className="font-[family-name:var(--font-display)] font-extrabold text-[22px] sm:text-[26px] text-ink tracking-tight">
            주요 고객사
          </h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {logos.map((l) => (
            <div
              key={l.id}
              title={l.name}
              className="flex items-center justify-center h-[84px] border border-line bg-white p-3 grayscale hover:grayscale-0 transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.logoUrl} alt={l.name} className="max-w-full max-h-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

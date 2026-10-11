import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { defaultClientNames } from "@/lib/data";
import { clientLogoRepo, seedClientLogosIfEmpty } from "@/lib/repo";

export const metadata: Metadata = {
  title: "회사소개 · 주요 고객사 | EV Laser",
  description: "㈜이브이레이저와 함께하는 국내외 주요 고객사·협력사입니다.",
};

export const dynamic = "force-dynamic";

export default async function CompanyClientsPage() {
  const t = await getTranslations("company");
  const clientLogos = await seedClientLogosIfEmpty(defaultClientNames)
    .then(() => clientLogoRepo.list())
    .catch(() => []);

  return (
    <section className="pt-10 pb-16 sm:pt-12 sm:pb-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">{t("clients.eyebrow")}</span>
        <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("clients.title")}</h2>
        <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("clients.desc")}</p>

        {clientLogos.length > 0 ? (
          <div className="mt-9 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-7 gap-y-5 justify-items-center">
            {clientLogos.map((l) => (
              <div
                key={l.id}
                title={l.name}
                className="flex items-center justify-center w-[80%] h-[55px] border border-line-strong bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {/* 로고는 박스 면적의 70% 이내(가로·세로 각 84%)로 배치해 여백을 둔다 */}
                <img src={l.logoUrl} alt={l.name} className="max-w-[84%] max-h-[84%] object-contain" />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-9 text-ink-faint text-[13.5px]">등록된 고객사 로고가 아직 없습니다.</p>
        )}
      </div>
    </section>
  );
}

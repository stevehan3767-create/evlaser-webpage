import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { patents as patentSeeds, certifications as certificationSeeds } from "@/lib/data";
import {
  patentRepo,
  certificationRepo,
  seedPatentsIfEmpty,
  seedCertificationsIfEmpty,
} from "@/lib/repo";

export const metadata: Metadata = {
  title: "회사소개 · 특허·인증 | EV Laser",
  description: "㈜이브이레이저가 보유한 인증서와 특허·상표 현황입니다.",
};

export const dynamic = "force-dynamic";

export default async function CompanyPatentsPage() {
  const t = await getTranslations("company");

  const [patentList, certList] = await Promise.all([
    seedPatentsIfEmpty(patentSeeds).then(() => patentRepo.list()).catch(() => []),
    seedCertificationsIfEmpty(certificationSeeds).then(() => certificationRepo.list()).catch(() => []),
  ]);

  return (
    <section className="pt-10 pb-16 sm:pt-12 sm:pb-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">{t("patents.eyebrow")}</span>
        <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("patents.title")}</h2>
        <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("patents.summary")}</p>

        {/* 인증서 — 상단 */}
        <h3 className="mt-10 mb-4 text-[16px] font-bold">
          {t("patents.certsHeading")} <span className="font-mono text-ink-faint text-[13px]">({certList.length})</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {certList.map((c) => (
            <a
              key={c.id}
              href={c.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-line-strong bg-surface hover:border-blue transition-colors"
            >
              <div className="relative aspect-[248/371] bg-surface-alt">
                <Image src={c.imageUrl} alt={c.title} fill sizes="200px" className="object-contain" />
              </div>
              <div className="p-2 text-center">
                <p className="text-[11px] text-ink-soft leading-snug line-clamp-2">{c.title}</p>
                {c.subtitle && <p className="text-[10.5px] text-ink-faint leading-snug mt-0.5">{c.subtitle}</p>}
              </div>
            </a>
          ))}
        </div>

        {/* 특허·상표 — 하단 (등록일 최신순) */}
        <h3 className="mt-12 mb-4 text-[16px] font-bold">
          {t("patents.patentsHeading")} <span className="font-mono text-ink-faint text-[13px]">({patentList.length})</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {patentList.map((p) => (
            <div key={p.id} className="border border-line-strong bg-surface hover:border-blue transition-colors">
              <a href={p.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative aspect-[248/371] bg-surface-alt">
                  <Image src={p.imageUrl} alt={p.title} fill sizes="200px" className="object-contain" />
                </div>
              </a>
              <div className="p-2 text-center">
                <p className="text-[11px] text-ink-soft leading-snug line-clamp-3">{p.title}</p>
                {p.registeredOn && <p className="text-[10.5px] text-ink-faint font-mono mt-0.5">{p.registeredOn}</p>}
                {p.fileUrl && (
                  <a
                    href={p.fileUrl}
                    download={p.fileName ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-bold text-blue hover:text-red"
                  >
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
                    </svg>
                    한글 번역본 PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import { officeSeeds } from "@/lib/data";
import { officeRepo, seedOfficesIfEmpty } from "@/lib/repo";
import { mapSearchUrl } from "@/lib/maps";
import GoogleMapEmbed from "./GoogleMapEmbed";
import NaverMapEmbed from "./NaverMapEmbed";

export default async function CompanyDirections() {
  const t = await getTranslations("company.directions");

  const offices = await seedOfficesIfEmpty(officeSeeds)
    .then(() => officeRepo.list())
    .catch(() => []);

  return (
    <section className="pt-10 pb-16 sm:pt-12 sm:pb-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight">{t("title")}</h2>
        <p className="mt-4 max-w-[68ch] text-ink-soft text-[14px] leading-relaxed">{t("desc")}</p>

        {offices.length === 0 ? (
          <p className="mt-9 text-ink-faint text-[13.5px]">{t("empty")}</p>
        ) : (
          <div className="mt-9 grid gap-6 md:grid-cols-2">
            {offices.map((o) => (
              <div key={o.id} className="border border-line bg-surface flex flex-col">
                {o.mapProvider === "google" ? (
                  <div className="border-b border-line-strong overflow-hidden">
                    <GoogleMapEmbed query={`${o.name} ${o.address}`} title={`${o.name} 지도`} />
                  </div>
                ) : o.lat !== null && o.lng !== null ? (
                  <div className="border-b border-line-strong overflow-hidden">
                    <NaverMapEmbed lat={o.lat} lng={o.lng} title={`${o.name} 지도`} />
                  </div>
                ) : null}

                <div className="p-5 flex flex-col gap-2.5">
                  <h3 className="flex items-center gap-2 text-[16px] font-bold">
                    <Icon name="pin" className="w-4 h-4 text-red flex-none" />
                    {o.name}
                  </h3>
                  <p className="text-ink-soft text-[13.5px] leading-relaxed">{o.address}</p>
                  <div className="flex flex-col gap-1 mt-0.5 text-[13px]">
                    {o.phone && (
                      <p className="flex gap-2">
                        <span className="font-bold text-ink-faint w-[46px] flex-none">{t("phoneLabel")}</span>
                        <span className="font-mono">{o.phone}</span>
                      </p>
                    )}
                    {o.email && (
                      <p className="flex gap-2">
                        <span className="font-bold text-ink-faint w-[46px] flex-none">{t("emailLabel")}</span>
                        <span className="font-mono break-all">{o.email}</span>
                      </p>
                    )}
                  </div>
                  <a
                    href={mapSearchUrl(o.mapProvider, `${o.name} ${o.address}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 text-[12.5px] font-bold text-blue hover:underline"
                  >
                    <Icon name="pin" className="w-3.5 h-3.5 flex-none" />
                    {o.mapProvider === "google" ? "Google 지도에서 보기" : "네이버 지도에서 보기"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link href="/global#offices" className="inline-flex items-center gap-1.5 mt-8 text-[13px] font-bold text-blue hover:underline">
          {t("viewAll")}
        </Link>
      </div>
    </section>
  );
}

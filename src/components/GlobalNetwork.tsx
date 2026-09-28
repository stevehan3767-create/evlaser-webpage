import { getTranslations, getLocale } from "next-intl/server";
import Icon from "./Icon";
import { officeSeeds } from "@/lib/data";
import { officeRepo, distributorRepo, seedOfficesIfEmpty, type OfficeRow, type DistributorRow } from "@/lib/repo";
import { countryFlag, countryName, isCountryCode } from "@/lib/countries";
import { mapSearchUrl } from "@/lib/maps";
import GoogleMapEmbed from "./GoogleMapEmbed";
import NaverMapEmbed from "./NaverMapEmbed";

// 네이버 지도 SDK는 NCP Client ID가 있어야 동작한다. 없으면 주소 기반 구글
// 임베드로 대체해 국내 사업장 지도가 항상 보이도록 한다.
const NAVER_ENABLED = !!process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

function MapLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[12px] font-bold text-blue whitespace-nowrap hover:underline"
    >
      <Icon name="pin" className="w-3.5 h-3.5 flex-none" />
      {label}
    </a>
  );
}

function OfficeTable({ headers, rows }: { headers: [string, string, string, string]; rows: OfficeRow[] }) {
  return (
    <div className="overflow-x-auto border border-line bg-surface">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="text-left font-mono text-[11px] tracking-wide text-ink-faint uppercase px-3.5 pb-3 border-b border-line-strong"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="font-bold flex items-center gap-2.5 px-3.5 py-4 border-b border-line align-top">
                <Icon name="pin" className="w-4 h-4 text-red flex-none" />
                {r.name}
              </td>
              <td className="px-3.5 py-4 border-b border-line text-[13.5px] align-top">
                <p>{r.address}</p>
                {/* 국내(naver) 사업장은 지도를 항상 임베드로 표시한다. 네이버 키+좌표가
                    있으면 네이버 지도, 없으면 주소 기반 구글 임베드로 자동 대체.
                    해외(google) 사업장은 임베드 없이 "지도에서 보기" 링크만 제공. */}
                {r.mapProvider === "naver" && (
                  <div className="mt-2.5 mb-1.5 border border-line-strong overflow-hidden rounded-sm">
                    {NAVER_ENABLED && r.lat !== null && r.lng !== null ? (
                      <NaverMapEmbed lat={r.lat} lng={r.lng} title={`${r.name} 지도`} />
                    ) : (
                      <GoogleMapEmbed query={`${r.name} ${r.address}`} title={`${r.name} 지도`} />
                    )}
                  </div>
                )}
                <MapLink
                  href={mapSearchUrl(r.mapProvider, `${r.name} ${r.address}`)}
                  label={r.mapProvider === "google" ? "Google 지도에서 보기" : "네이버 지도에서 보기"}
                />
              </td>
              <td className="px-3.5 py-4 border-b border-line text-[13.5px] font-mono align-top">{r.phone}</td>
              <td className="px-3.5 py-4 border-b border-line text-[13.5px] font-mono align-top">{r.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DistributorTable({
  headers,
  rows,
  locale,
}: {
  headers: [string, string, string, string];
  rows: DistributorRow[];
  locale: string;
}) {
  return (
    <div className="overflow-x-auto border border-line bg-surface">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="text-left font-mono text-[11px] tracking-wide text-ink-faint uppercase px-3.5 pb-3 border-b border-line-strong"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="font-bold flex items-center gap-2.5 px-3.5 py-4 border-b border-line">
                {isCountryCode(r.country) ? (
                  <>
                    <span className="text-[16px] leading-none flex-none">{countryFlag(r.country)}</span>
                    {countryName(r.country, locale)}
                  </>
                ) : (
                  <>
                    <Icon name="pin" className="w-4 h-4 text-red flex-none" />
                    {r.country}
                  </>
                )}
              </td>
              <td className="px-3.5 py-4 border-b border-line text-[13.5px]">
                <p>{r.partner}</p>
                <MapLink
                  href={mapSearchUrl("google", [r.partner, r.country, r.contact, r.phone].filter(Boolean).join(" "))}
                  label="Google 지도에서 보기"
                />
              </td>
              <td className="px-3.5 py-4 border-b border-line text-[13.5px]">{r.contact}</td>
              <td className="px-3.5 py-4 border-b border-line text-[13.5px] font-mono">{r.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function GlobalNetwork() {
  const t = await getTranslations("global");
  const locale = await getLocale();

  await seedOfficesIfEmpty(officeSeeds);
  const [offices, distributors] = await Promise.all([officeRepo.list(), distributorRepo.list()]);

  const officeHeaders: [string, string, string, string] = [
    t("table.location"),
    t("table.address"),
    t("table.phone"),
    t("table.email"),
  ];
  const distributorHeaders: [string, string, string, string] = [
    t("table.country"),
    t("table.partner"),
    t("table.contact"),
    t("table.phone"),
  ];

  return (
    <section id="global" className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("title")}
          </h1>
          <p className="text-ink-soft max-w-[58ch] mt-2.5">{t("desc")}</p>
        </div>
        <div id="offices" className="mb-10 scroll-mt-28">
          <h2 className="flex items-center gap-2.5 text-[16px] mb-4">
            <Icon name="build" className="w-[19px] h-[19px] text-blue" />
            {t("offices")}
          </h2>
          <OfficeTable headers={officeHeaders} rows={offices} />
        </div>
        <div id="distributors" className="scroll-mt-28">
          <h2 className="flex items-center gap-2.5 text-[16px] mb-4">
            <Icon name="handshake" className="w-[19px] h-[19px] text-blue" />
            {t("distributors")}
          </h2>
          {distributors.length === 0 ? (
            <p className="py-8 text-ink-soft text-[13.5px] border-t border-line">{t("distributorsEmpty")}</p>
          ) : (
            <DistributorTable headers={distributorHeaders} rows={distributors} locale={locale} />
          )}
        </div>
      </div>
    </section>
  );
}

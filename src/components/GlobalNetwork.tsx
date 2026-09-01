import { useTranslations } from "next-intl";
import Icon from "./Icon";
import { officeRows, distributorRows } from "@/lib/data";

function OfficeTable({
  headers,
  rows,
}: {
  headers: [string, string, string, string];
  rows: { location: string; address: string; phone: string; email: string }[];
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
            <tr key={r.location}>
              <td className="font-bold flex items-center gap-2.5 px-3.5 py-4 border-b border-line align-top">
                <Icon name="pin" className="w-4 h-4 text-red flex-none" />
                {r.location}
              </td>
              <td className="px-3.5 py-4 border-b border-line text-[13.5px] align-top">{r.address}</td>
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
}: {
  headers: [string, string, string, string];
  rows: { country: string; partner: string; contact: string; phone: string }[];
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
            <tr key={r.country}>
              <td className="font-bold flex items-center gap-2.5 px-3.5 py-4 border-b border-line">
                <Icon name="pin" className="w-4 h-4 text-red flex-none" />
                {r.country}
              </td>
              <td className="px-3.5 py-4 border-b border-line text-[13.5px]">{r.partner}</td>
              <td className="px-3.5 py-4 border-b border-line text-[13.5px]">{r.contact}</td>
              <td className="px-3.5 py-4 border-b border-line text-[13.5px] font-mono">{r.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GlobalNetwork() {
  const t = useTranslations("global");

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
  const offices = officeRows.map((r) => ({
    location: t(`rows.${r.key}`),
    address: r.address,
    phone: r.phone,
    email: r.email,
  }));

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
          <DistributorTable headers={distributorHeaders} rows={distributorRows} />
        </div>
      </div>
    </section>
  );
}

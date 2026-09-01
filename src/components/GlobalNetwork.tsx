import Icon from "./Icon";
import { officeRows, distributorRows } from "@/lib/data";

function NetworkTable({ rows }: { rows: { country: string; partner: string; contact: string; phone: string }[] }) {
  return (
    <div className="overflow-x-auto border border-line bg-surface">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr>
            {["국가", "파트너사", "담당자", "연락처"].map((h) => (
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
  return (
    <section id="global" className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">WORLDWIDE PRESENCE</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            글로벌 네트워크
          </h1>
          <p className="text-ink-soft max-w-[58ch] mt-2.5">
            전 세계 지사 및 대리점을 통해 가까운 곳에서 지원을 제공합니다.
          </p>
        </div>
        <div id="offices" className="mb-10 scroll-mt-28">
          <h3 className="flex items-center gap-2.5 text-[16px] mb-4">
            <Icon name="build" className="w-[19px] h-[19px] text-blue" />
            지사·연락처
          </h3>
          <NetworkTable rows={officeRows} />
        </div>
        <div id="distributors" className="scroll-mt-28">
          <h3 className="flex items-center gap-2.5 text-[16px] mb-4">
            <Icon name="handshake" className="w-[19px] h-[19px] text-blue" />
            대리점 찾기
          </h3>
          <NetworkTable rows={distributorRows} />
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import Icon from "./Icon";
import { sitemap } from "@/lib/data";

export default function Sitemap() {
  return (
    <section className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">SITE STRUCTURE</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            한눈에 보는 EV Laser
          </h2>
          <p className="text-ink-soft max-w-[58ch] mt-2.5">
            방문자가 원하는 정보를 가장 빠르게 찾을 수 있도록 설계된 사이트 구조입니다.
          </p>
        </div>
        <div className="grid gap-[26px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {sitemap.map((branch) => (
            <div key={branch.title} className={`bg-surface border ${branch.accent ? "border-red" : "border-line"}`}>
              <Link
                href={branch.titleHref}
                className={`flex items-center gap-2.5 px-4 py-3.5 border-b border-line hover:opacity-80 ${
                  branch.accent ? "bg-red-soft" : "bg-surface-alt"
                }`}
              >
                <Icon name={branch.icon} className={`w-[18px] h-[18px] flex-none ${branch.accent ? "text-red" : "text-blue"}`} />
                <span className="font-bold text-[13.5px]">{branch.title}</span>
              </Link>
              <ul className="py-1.5">
                {branch.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="relative block pl-[30px] pr-4 py-2 text-[12.8px] text-ink-soft hover:text-blue"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

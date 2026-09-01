import Icon from "./Icon";
import { resourceCards } from "@/lib/data";

export default function Resources() {
  return (
    <section id="resources" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">RESOURCE CENTER</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            자료실
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
          {resourceCards.map((c) => (
            <div key={c.title} className="border border-line bg-surface">
              <div
                className="h-[150px] flex items-center justify-center border-b border-line"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, var(--surface-alt) 0 10px, var(--surface) 10px 20px)",
                }}
              >
                <Icon name={c.icon} className="w-10 h-10 text-blue" />
              </div>
              <div className="p-5">
                <h3 className="text-[15.5px] mb-2">{c.title}</h3>
                <p className="text-[13px] text-ink-soft">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="inline-flex items-center gap-[7px] mt-11 text-[12px] text-blue bg-blue-soft border border-line-strong px-3.5 py-2.5 font-mono">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 12a8 8 0 0 1 14-5.2M20 12a8 8 0 0 1-14 5.2" />
            <polyline points="17 3 18 7 14 6.3" />
            <polyline points="7 21 6 17 10 17.7" />
          </svg>
          <span>주 2회 산업동향 자동 수집 · 담당자 검토·승인 후 게시</span>
        </div>
      </div>
    </section>
  );
}

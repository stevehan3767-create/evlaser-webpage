import Icon from "./Icon";
import { techItems } from "@/lib/data";

export default function TechSolutions() {
  return (
    <section id="tech" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">CORE TECHNOLOGY</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            기술종류별로 보는 레이저 솔루션
          </h2>
        </div>
        <div className="grid gap-px bg-line border border-line" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
          {techItems.map((t, i) => (
            <div key={t.label} className="bg-surface p-5 flex flex-col gap-2.5 min-h-[130px]">
              <span className="font-mono text-[10.5px] text-ink-faint tracking-wide">{String(i + 1).padStart(2, "0")}</span>
              <Icon name={t.icon} className="w-7 h-7 text-red" strokeWidth={1.5} />
              <h3 className="text-[14.5px] leading-snug mt-0.5">{t.label}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

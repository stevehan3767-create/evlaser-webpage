import { useTranslations } from "next-intl";
import Icon from "./Icon";
import { techItems, techDetailKeys } from "@/lib/data";

interface TechDetail {
  title: string;
  materials: string[];
  description: string[];
  features: string[];
  applications: string[];
  parameters: string;
}

interface SafetyPrinciple {
  title: string;
  desc: string;
}

interface SafetyDetail {
  title: string;
  intro: string[];
  principlesHeading: string;
  principlesIntro: string;
  principles: SafetyPrinciple[];
  importanceHeading: string;
  importance: string[];
}

function Tag({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 border border-line-strong text-[11px] font-mono text-ink-soft">
      {children}
    </span>
  );
}

function TechDetailBody({ data, t }: { data: TechDetail; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
      <div>
        <h4 className="text-[18px] font-bold mb-2">{data.title}</h4>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {data.materials.map((m) => (
            <Tag key={m}>{m}</Tag>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {data.description.map((p, i) => (
            <p key={i} className="text-ink-soft text-[13.5px] leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <h5 className="font-bold text-[13px] mb-2">{t("featuresHeading")}</h5>
          <ul className="flex flex-col gap-1.5">
            {data.features.map((f, i) => (
              <li key={i} className="text-[13px] text-ink-soft pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-blue">
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-[13px] mb-2">{t("applicationsHeading")}</h5>
          <ul className="flex flex-col gap-1.5">
            {data.applications.map((a, i) => (
              <li key={i} className="text-[13px] text-ink-soft pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-blue">
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-[13px] mb-2">{t("parametersHeading")}</h5>
          <p className="text-[12.5px] text-ink-faint leading-relaxed">{data.parameters}</p>
        </div>
      </div>
    </div>
  );
}

function SafetyDetailBody({ data }: { data: SafetyDetail }) {
  return (
    <div>
      <h4 className="text-[18px] font-bold mb-2">{data.title}</h4>
      <div className="flex flex-col gap-2 mb-6 max-w-[68ch]">
        {data.intro.map((p, i) => (
          <p key={i} className="text-ink-soft text-[13.5px] leading-relaxed">
            {p}
          </p>
        ))}
      </div>
      <h5 className="font-bold text-[15px] mb-1.5">{data.principlesHeading}</h5>
      <p className="text-ink-soft text-[13px] mb-4 max-w-[68ch]">{data.principlesIntro}</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {data.principles.map((p, i) => (
          <div key={i} className="flex gap-3 p-3.5 border border-line-strong bg-surface-alt">
            <Icon name="shield" className="w-5 h-5 text-blue flex-none" />
            <div>
              <p className="font-bold text-[13px]">{p.title}</p>
              <p className="text-[12.5px] text-ink-soft mt-1 leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <h5 className="font-bold text-[15px] mb-1.5">{data.importanceHeading}</h5>
      <div className="flex flex-col gap-2 max-w-[68ch]">
        {data.importance.map((p, i) => (
          <p key={i} className="text-ink-soft text-[13px] leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function TechSolutions() {
  const t = useTranslations("tech");
  const td = useTranslations("techDetails");

  return (
    <section id="tech" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("title")}
          </h2>
        </div>
        <div className="grid gap-px bg-line border border-line" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
          {techItems.map((item, i) => {
            const hasDetail = (techDetailKeys as readonly string[]).includes(item.key) || item.key === "safety";
            const number = String(i + 1).padStart(2, "0");

            if (!hasDetail) {
              return (
                <div key={`${item.key}-${i}`} className="bg-surface p-5 flex flex-col gap-2.5 min-h-[130px]">
                  <span className="font-mono text-[10.5px] text-ink-faint tracking-wide">{number}</span>
                  <Icon name={item.icon} className="w-7 h-7 text-red" strokeWidth={1.5} />
                  <h3 className="text-[14.5px] leading-snug mt-0.5">{t(item.key)}</h3>
                </div>
              );
            }

            return (
              <details key={`${item.key}-${i}`} className="group bg-surface p-5 min-h-[130px] open:col-span-full open:bg-surface-alt">
                <summary className="flex flex-col gap-2.5 cursor-pointer list-none marker:content-none">
                  <span className="flex items-center justify-between">
                    <span className="font-mono text-[10.5px] text-ink-faint tracking-wide">{number}</span>
                    <svg
                      viewBox="0 0 12 8"
                      className="w-3 h-2 text-ink-faint transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 1.5 6 6.5 11 1.5" />
                    </svg>
                  </span>
                  <Icon name={item.icon} className="w-7 h-7 text-red" strokeWidth={1.5} />
                  <h3 className="text-[14.5px] leading-snug mt-0.5">{t(item.key)}</h3>
                </summary>
                <div className="mt-6 pt-6 border-t border-line-strong">
                  {item.key === "safety" ? (
                    <SafetyDetailBody data={td.raw("safety") as SafetyDetail} />
                  ) : (
                    <TechDetailBody data={td.raw(item.key) as TechDetail} t={td} />
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}

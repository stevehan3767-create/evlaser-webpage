import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import ApplyButton from "./ApplyButton";
import { jobs } from "@/lib/data";

const VALUE_KEYS = ["expertise", "integrity", "challenge"] as const;

interface WorkConditions {
  employment: string;
  salary: string;
  location: string;
  schedule: string;
}

interface BenefitGroup {
  heading: string;
  items: string[];
}

interface HiringProcess {
  period: string;
  documents: string;
  method: string;
  steps: string;
}

interface JobDetail {
  title: string;
  type: string;
  loc: string;
  due: string;
  field: string;
  department: string;
  responsibilities: string[];
  requirements: string[];
  preferred: string[];
  workConditions: WorkConditions;
  benefits: BenefitGroup[];
  process: HiringProcess;
  notes: string[];
}

interface SimpleJob {
  title: string;
  type: string;
  loc: string;
  due: string;
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <li key={i} className="text-[13px] text-ink-soft pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-blue">
          {item}
        </li>
      ))}
    </ul>
  );
}

function SimpleJobCard({ job }: { job: SimpleJob }) {
  const t = useTranslations("careers");
  return (
    <div className="border border-line-strong border-l-4 border-l-red bg-surface p-[22px] flex flex-col gap-2.5">
      <Icon name="briefcase" className="w-6 h-6 text-red" />
      <h3 className="text-[16px]">{job.title}</h3>
      <div className="flex flex-wrap gap-2">
        <span className="font-mono text-[10.5px] text-ink-soft border border-line-strong px-2 py-[3px] tracking-wide">{job.type}</span>
        <span className="font-mono text-[10.5px] text-ink-soft border border-line-strong px-2 py-[3px] tracking-wide">{job.loc}</span>
        <span className="font-mono text-[10.5px] text-ink-soft border border-line-strong px-2 py-[3px] tracking-wide">{job.due}</span>
      </div>
      <ApplyButton jobTitle={job.title} label={t("apply")} className="mt-2 text-[12.5px] font-bold text-blue inline-flex items-center gap-[5px] self-start" />
    </div>
  );
}

function DetailedJobCard({ j }: { j: JobDetail }) {
  const t = useTranslations("careers");
  return (
    <details className="group border border-line-strong border-l-4 border-l-red bg-surface open:bg-surface-alt">
            <summary className="p-[22px] flex flex-col gap-2.5 cursor-pointer list-none marker:content-none">
              <div className="flex items-start justify-between gap-3">
                <Icon name="briefcase" className="w-6 h-6 text-red flex-none" />
                <svg
                  viewBox="0 0 12 8"
                  className="w-3 h-2 mt-1.5 text-ink-faint transition-transform group-open:rotate-180 flex-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 1.5 6 6.5 11 1.5" />
                </svg>
              </div>
              <h3 className="text-[16px] font-bold">{j.title}</h3>
              <p className="text-[12.5px] text-ink-soft">{j.field}</p>
              <div className="flex flex-wrap gap-2">
                <span className="font-mono text-[10.5px] text-ink-soft border border-line-strong px-2 py-[3px] tracking-wide">{j.type}</span>
                <span className="font-mono text-[10.5px] text-ink-soft border border-line-strong px-2 py-[3px] tracking-wide">{j.loc}</span>
                <span className="font-mono text-[10.5px] text-red border border-red px-2 py-[3px] tracking-wide">{j.due}</span>
              </div>
            </summary>

            <div className="px-[22px] pb-[22px] pt-2 border-t border-line-strong">
              <p className="text-[12.5px] text-ink-faint mb-6">{j.department}</p>

              <div className="grid gap-8 md:grid-cols-2 mb-8">
                <div>
                  <h4 className="font-bold text-[14px] mb-2.5">{t("responsibilitiesHeading")}</h4>
                  <List items={j.responsibilities} />
                </div>
                <div>
                  <h4 className="font-bold text-[14px] mb-2.5">{t("requirementsHeading")}</h4>
                  <List items={j.requirements} />
                </div>
                <div>
                  <h4 className="font-bold text-[14px] mb-2.5">{t("preferredHeading")}</h4>
                  <List items={j.preferred} />
                </div>
                <div>
                  <h4 className="font-bold text-[14px] mb-2.5">{t("workConditionsHeading")}</h4>
                  <dl className="flex flex-col gap-1.5 text-[13px]">
                    {(
                      [
                        ["employmentLabel", j.workConditions.employment],
                        ["salaryLabel", j.workConditions.salary],
                        ["locationLabel", j.workConditions.location],
                        ["scheduleLabel", j.workConditions.schedule],
                      ] as const
                    ).map(([labelKey, value]) => (
                      <div key={labelKey} className="flex gap-2">
                        <dt className="text-ink-faint w-[92px] flex-none">{t(labelKey)}</dt>
                        <dd className="text-ink-soft">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <h4 className="font-bold text-[14px] mb-3">{t("benefitsHeading")}</h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {j.benefits.map((b) => (
                  <div key={b.heading} className="border border-line p-3.5">
                    <p className="font-bold text-[12.5px] mb-1.5">{b.heading}</p>
                    <p className="text-[12px] text-ink-soft leading-relaxed">{b.items.join(" · ")}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h4 className="font-bold text-[14px] mb-2.5">{t("processHeading")}</h4>
                  <dl className="flex flex-col gap-1.5 text-[13px]">
                    {(
                      [
                        ["periodLabel", j.process.period],
                        ["documentsLabel", j.process.documents],
                        ["methodLabel", j.process.method],
                        ["stepsLabel", j.process.steps],
                      ] as const
                    ).map(([labelKey, value]) => (
                      <div key={labelKey} className="flex gap-2">
                        <dt className="text-ink-faint w-[92px] flex-none">{t(labelKey)}</dt>
                        <dd className="text-ink-soft">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <h4 className="font-bold text-[14px] mb-2.5">{t("notesHeading")}</h4>
                  <List items={j.notes} />
                </div>
              </div>

              <ApplyButton
                jobTitle={j.title}
                label={t("apply")}
                className="mt-8 inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025]"
              />
            </div>
          </details>
  );
}

export default function Careers() {
  const t = useTranslations("careers");

  return (
    <section id="careers" className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="inline-flex items-center gap-2 px-3.5 py-[7px] bg-red text-white font-bold text-[12px] tracking-wide mb-3.5">
          <span className="w-[7px] h-[7px] rounded-full bg-white animate-pulse" />
          {t("badge")}
        </div>
        <div className="flex flex-wrap justify-between items-end gap-6 mb-11">
          <div>
            <span className="eyebrow">{t("eyebrow")}</span>
            <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
              {t("title")}
            </h1>
            <p className="text-ink-soft mt-2.5">{t("desc")}</p>
          </div>
          <Link href="/support" className="inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025]">
            {t("viewAll")}
          </Link>
        </div>

        <div className="flex flex-col gap-[18px]">
          {jobs.map((job) =>
            job.detailed ? (
              <DetailedJobCard key={job.key} j={t.raw(`jobs.${job.key}`) as JobDetail} />
            ) : (
              <SimpleJobCard key={job.key} job={t.raw(`jobs.${job.key}`) as SimpleJob} />
            )
          )}
        </div>

        <div id="culture" className="mt-16 pt-16 border-t border-line scroll-mt-28">
          <span className="eyebrow">{t("culture.eyebrow")}</span>
          <h2 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("culture.title")}
          </h2>
          <div className="grid gap-[18px] mt-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {VALUE_KEYS.map((v) => (
              <div key={v} className="border border-line p-5">
                <h3 className="font-bold text-[15px]">{t(`culture.values.${v}.title`)}</h3>
                <p className="text-ink-soft text-[13.3px] mt-1.5">{t(`culture.values.${v}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

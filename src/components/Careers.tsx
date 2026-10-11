"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Icon from "./Icon";
import ApplyButton from "./ApplyButton";
import { jobs, recruitFields } from "@/lib/data";
import type { IconName } from "@/lib/data";

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

// 상시채용 모집 분야 카드 — 신입·경력 공통, 사이트 내 지원폼으로 상시 지원.
function FieldCard({ name, icon, desc, applyLabel }: { name: string; icon: IconName; desc: string; applyLabel: string }) {
  return (
    <div className="border border-line-strong border-l-4 border-l-red bg-surface p-[22px] flex flex-col gap-2.5">
      <Icon name={icon} className="w-6 h-6 text-red" />
      <h3 className="text-[16px] font-bold">{name}</h3>
      <div className="flex flex-wrap gap-2">
        <span className="font-mono text-[10.5px] text-ink-soft border border-line-strong px-2 py-[3px] tracking-wide">신입·경력</span>
        <span className="font-mono text-[10.5px] text-red border border-red px-2 py-[3px] tracking-wide">상시지원</span>
      </div>
      <p className="text-[13px] text-ink-soft leading-relaxed min-h-[60px]">{desc}</p>
      <ApplyButton
        jobTitle={name}
        label={applyLabel}
        className="mt-1 inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13px] border border-red hover:bg-[#c40025] self-start"
      />
    </div>
  );
}

function DetailedJobCard({ j, closed = false }: { j: JobDetail; closed?: boolean }) {
  const t = useTranslations("careers");
  return (
    <details className="group border border-line-strong border-l-4 border-l-red bg-surface open:bg-surface-alt">
      <summary className="p-[22px] flex flex-col gap-2.5 cursor-pointer list-none marker:content-none">
        <div className="flex items-start justify-between gap-3">
          <Icon name="briefcase" className="w-6 h-6 text-red flex-none" />
          <svg viewBox="0 0 12 8" className="w-3 h-2 mt-1.5 text-ink-faint transition-transform group-open:rotate-180 flex-none" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1.5 6 6.5 11 1.5" />
          </svg>
        </div>
        <h3 className="text-[16px] font-bold">{j.title}</h3>
        <p className="text-[12.5px] text-ink-soft">{j.field}</p>
        <div className="flex flex-wrap gap-2">
          <span className="font-mono text-[10.5px] text-ink-soft border border-line-strong px-2 py-[3px] tracking-wide">{j.type}</span>
          <span className="font-mono text-[10.5px] text-ink-soft border border-line-strong px-2 py-[3px] tracking-wide">{j.loc}</span>
          <span className={`font-mono text-[10.5px] px-2 py-[3px] tracking-wide border ${closed ? "text-ink-faint border-line-strong" : "text-red border-red"}`}>
            {closed ? "채용 마감" : j.due}
          </span>
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
              {([
                ["employmentLabel", j.workConditions.employment],
                ["salaryLabel", j.workConditions.salary],
                ["locationLabel", j.workConditions.location],
                ["scheduleLabel", j.workConditions.schedule],
              ] as const).map(([labelKey, value]) => (
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
              {([
                ["periodLabel", j.process.period],
                ["documentsLabel", j.process.documents],
                ["methodLabel", j.process.method],
                ["stepsLabel", j.process.steps],
              ] as const).map(([labelKey, value]) => (
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

        {closed ? (
          <span className="mt-8 inline-flex items-center gap-2 px-[18px] py-2.5 bg-surface-alt text-ink-faint font-bold text-[13.5px] border border-line-strong cursor-not-allowed">
            채용 마감
          </span>
        ) : (
          <ApplyButton
            jobTitle={j.title}
            label={t("apply")}
            className="mt-8 inline-flex items-center gap-2 px-[18px] py-2.5 bg-red text-white font-bold text-[13.5px] border border-red hover:bg-[#c40025]"
          />
        )}
      </div>
    </details>
  );
}

const PROCESS_STEPS = ["서류전형", "1차 면접", "2차 면접", "최종합격"] as const;

export default function Careers() {
  const t = useTranslations("careers");
  const benefits = (() => {
    try { return (t.raw("jobs.techSales.benefits") as BenefitGroup[]) ?? []; } catch { return [] as BenefitGroup[]; }
  })();
  const notes = (() => {
    try { return (t.raw("jobs.techSales.notes") as string[]) ?? []; } catch { return [] as string[]; }
  })();

  // 수시채용 = 채용 사유 발생 시 개별 공고(상세). 상시채용(분야별)과 분리해 운영.
  const occasionalJobs = jobs.filter((job) => job.detailed);
  // 진행 중(마감 아님) 수시공고가 있으면 수시채용을 기본 탭으로, 없으면 상시채용을 기본 탭으로.
  const hasActiveOccasional = occasionalJobs.some((job) => !job.closed);
  const [tab, setTab] = useState<"occasional" | "regular">(hasActiveOccasional ? "occasional" : "regular");

  const tabBtn = (active: boolean) =>
    `flex-1 sm:flex-none sm:min-w-[200px] px-6 py-3 text-[15px] font-bold rounded-t-md border-2 border-b-0 transition-colors ${
      active ? "bg-red text-white border-red" : "bg-surface-alt text-ink-faint border-transparent hover:text-ink-soft"
    }`;

  return (
    <section id="careers" className="py-16 sm:py-22 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="inline-flex items-center gap-2 px-3.5 py-[7px] bg-red text-white font-bold text-[12px] tracking-wide mb-3.5">
          <span className="w-[7px] h-[7px] rounded-full bg-white animate-pulse" />
          인재채용
        </div>
        <div className="max-w-[920px] mb-9">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("title")}
          </h1>
          <p className="text-ink-soft mt-2.5 leading-relaxed">
            ㈜이브이레이저는 레이저 기술의 미래를 함께 만들어갈 인재를 모집합니다. 채용은 <b className="text-ink">수시채용</b>과
            <b className="text-ink"> 분야별 상시채용</b>으로 운영되며, 관심 있는 지원자는 홈페이지를 통해 <b className="text-ink">언제든지 지원</b>하실 수 있습니다.
          </p>
        </div>

        {/* 전 분야 공통 우대사항 */}
        <div
          className="flex items-center gap-3 rounded-md border px-5 py-4 mb-10"
          style={{ borderColor: "#f0cf8a", borderLeft: "4px solid #e8a400", background: "linear-gradient(90deg,#fff7e6,#fffdf7)" }}
        >
          <span className="text-[22px] leading-none flex-none">🌐</span>
          <div>
            <p className="font-bold text-[14px] text-ink">공통 우대사항</p>
            <p className="text-[13px] text-ink-soft leading-relaxed mt-0.5">
              활발한 해외 진출과 글로벌 파트너 협업이 이루어지는 만큼, <b className="text-ink">전 분야에서 외국어(영어·중국어) 가능자를 우대</b>합니다.
            </p>
          </div>
        </div>

        {/* 탭 — 수시채용(왼쪽) · 상시채용(오른쪽) */}
        <div className="flex gap-2 border-b-2 border-line-strong" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "occasional"} onClick={() => setTab("occasional")} className={tabBtn(tab === "occasional")}>
            수시채용
          </button>
          <button type="button" role="tab" aria-selected={tab === "regular"} onClick={() => setTab("regular")} className={tabBtn(tab === "regular")}>
            상시채용
          </button>
        </div>

        {/* 탭 내용 */}
        <div className="pt-8">
          {tab === "occasional" ? (
            <div role="tabpanel">
              <h2 className="mb-1.5 text-[20px] sm:text-[24px] font-[family-name:var(--font-display)] tracking-tight">
                수시채용 <span className="text-[14px] text-ink-faint font-sans">(채용 사유 발생 시 개별 공고)</span>
              </h2>
              <p className="text-[13px] text-ink-soft mb-6">결원·증원 등 채용 사유가 발생하면 아래와 같이 개별 공고로 모집합니다.</p>
              {occasionalJobs.length > 0 ? (
                <div className="flex flex-col gap-[18px]">
                  {occasionalJobs.map((job) => (
                    <DetailedJobCard key={job.key} j={t.raw(`jobs.${job.key}`) as JobDetail} closed={job.closed} />
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-[13.5px] text-ink-faint border border-line rounded-sm bg-surface-alt">
                  현재 진행 중인 수시채용 공고가 없습니다. 상시채용으로 언제든지 지원해 주세요.
                </p>
              )}
            </div>
          ) : (
            <div role="tabpanel">
              <h2 className="mb-1.5 text-[20px] sm:text-[24px] font-[family-name:var(--font-display)] tracking-tight">
                상시채용 <span className="text-[14px] text-ink-faint font-sans">(분야별 · 신입/경력)</span>
              </h2>
              <p className="text-[13px] text-ink-soft mb-6">관심 분야에 언제든지 지원하실 수 있으며, 서류는 인재풀로 관리되어 채용 시 우선 검토됩니다.</p>
              <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                {recruitFields.map((f) => (
                  <FieldCard key={f.name} name={f.name} icon={f.icon} desc={f.desc} applyLabel={t("apply")} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 복지 및 혜택 */}
        {benefits.length > 0 && (
          <div className="mt-16 pt-16 border-t border-line">
            <span className="eyebrow">BENEFITS</span>
            <h2 className="mt-2.5 mb-6 text-[20px] sm:text-[24px] font-[family-name:var(--font-display)] tracking-tight">복지 및 혜택</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b) => (
                <div key={b.heading} className="rounded-md border border-line-strong bg-surface-alt p-4">
                  <p className="flex items-center gap-2 font-bold text-[13px] text-red mb-2 before:content-[''] before:w-[7px] before:h-[7px] before:rounded-full before:bg-red before:flex-none">
                    {b.heading}
                  </p>
                  <p className="text-[12.5px] text-ink-soft leading-relaxed">{b.items.join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 전형절차 */}
        <div className="mt-14">
          <span className="eyebrow">PROCESS</span>
          <h2 className="mt-2.5 mb-5 text-[20px] sm:text-[24px] font-[family-name:var(--font-display)] tracking-tight">전형절차</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
            {PROCESS_STEPS.map((s, i) => (
              <div key={s} className="relative flex-1 flex sm:block items-center gap-3 rounded-md border border-line-strong bg-surface-alt px-4 py-5 sm:text-center sm:mr-3 last:mr-0">
                <span className="w-8 h-8 flex-none inline-flex items-center justify-center rounded-full bg-red text-white font-bold text-[14px] sm:mx-auto sm:mb-2.5">
                  {i + 1}
                </span>
                <span className="font-bold text-[14px]">{s}</span>
                {i < PROCESS_STEPS.length - 1 && (
                  <span className="hidden sm:block absolute -right-[11px] top-1/2 -translate-y-1/2 text-line-strong text-[18px] z-10">›</span>
                )}
              </div>
            ))}
          </div>
          <dl className="mt-6 flex flex-col gap-1.5 text-[13px]">
            <div className="flex gap-2">
              <dt className="text-ink-faint w-[72px] flex-none">지원방법</dt>
              <dd className="text-ink-soft">홈페이지 상시 지원 (신입·경력)</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ink-faint w-[72px] flex-none">제출서류</dt>
              <dd className="text-ink-soft">이력서·자기소개서 (자유양식, 포트폴리오 등 첨부 가능)</dd>
            </div>
          </dl>
        </div>

        {/* 유의사항 */}
        {notes.length > 0 && (
          <div className="mt-14">
            <span className="eyebrow">NOTICE</span>
            <h2 className="mt-2.5 mb-4 text-[20px] sm:text-[24px] font-[family-name:var(--font-display)] tracking-tight">유의사항</h2>
            <div className="rounded-md border border-line-strong bg-surface p-5">
              <ul className="flex flex-col gap-2">
                {notes.map((n, i) => (
                  <li key={i} className="text-[13px] text-ink-soft pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-blue">
                    {n}
                  </li>
                ))}
                <li className="text-[13px] text-ink-soft pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-blue">
                  채용 관련 문의 : 경영지원팀 031-452-9860
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* 인재상 */}
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

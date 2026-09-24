import Link from "next/link";
import { analyticsRepo, contentItemRepo } from "@/lib/repo";

export const dynamic = "force-dynamic";

// 경로를 사람이 알아보기 쉬운 한글 이름으로 변환한다 (검색어는 디코딩해 표시).
const ROUTE_KO: Record<string, string> = {
  "": "🏠 메인 홈",
  company: "회사소개",
  products: "제품·기술",
  resources: "자료실",
  news: "뉴스·소식",
  careers: "채용",
  global: "글로벌 네트워크",
  support: "고객지원",
  "ceo-channel": "대표이사 직속 소통센터",
};
const GROUP_KO: Record<string, string> = {
  lineup: "설비 라인업", tech: "기술종류별", industry: "산업분야별", material: "재료별",
};
const SUPPORT_VIEW_KO: Record<string, string> = {
  contact: "문의하기", faq: "자주 묻는 질문", resources: "자료실",
};
const LOCALES = new Set(["ko", "en", "zh", "ja"]);

function prettyPath(raw: string, items: Record<string, Record<string, string>>): string {
  let path = raw;
  let query = "";
  const qi = raw.indexOf("?");
  if (qi >= 0) {
    path = raw.slice(0, qi);
    query = raw.slice(qi + 1);
  }
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep raw */
  }
  const params = new URLSearchParams(query);
  let seg = path.split("/").filter(Boolean);
  let langTag = "";
  if (seg.length && LOCALES.has(seg[0])) {
    if (seg[0] !== "ko") langTag = ` (${seg[0].toUpperCase()})`;
    seg = seg.slice(1);
  }
  const top = seg[0] ?? "";

  if (top === "search") {
    const q = params.get("q") || params.get("query") || params.get("keyword") || "";
    return (q ? `🔍 검색: "${q}"` : "🔍 검색") + langTag;
  }
  if (top === "products" && seg[1] === "industries") return `제품·기술 › 산업분야별${langTag}`;
  if (top === "products" && seg[1] === "materials") return `제품·기술 › 재료별${langTag}`;
  if (top === "products" && seg[1] && seg[2]) {
    const g = GROUP_KO[seg[1]] ?? seg[1];
    const name = items[seg[1]]?.[seg[2]] ?? seg[2];
    return `${g} › ${name}${langTag}`;
  }
  if (top === "support") {
    const view = params.get("view");
    const channel = params.get("channel");
    const suffix = view ? ` › ${SUPPORT_VIEW_KO[view] ?? view}` : channel ? ` › ${channel}` : "";
    return `고객지원${suffix}${langTag}`;
  }
  const base = ROUTE_KO[top] ?? (top ? `/${seg.join("/")}` : "🏠 메인 홈");
  return base + langTag;
}

const PERIODS: { key: string; label: string; days: number | null }[] = [
  { key: "today", label: "오늘", days: 1 },
  { key: "7d", label: "최근 7일", days: 7 },
  { key: "30d", label: "최근 30일", days: 30 },
  { key: "90d", label: "최근 90일", days: 90 },
  { key: "all", label: "전체", days: null },
];

function sinceFor(days: number | null): string {
  if (days === null) return "1970-01-01T00:00:00.000Z";
  if (days === 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function fmtDwell(ms: number): string {
  if (!ms) return "0초";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}초`;
  const m = Math.floor(s / 60);
  return `${m}분 ${s % 60}초`;
}

const COUNTRY_KO: Record<string, string> = {
  KR: "🇰🇷 대한민국", CN: "🇨🇳 중국", JP: "🇯🇵 일본", US: "🇺🇸 미국", IN: "🇮🇳 인도",
  DE: "🇩🇪 독일", VN: "🇻🇳 베트남", TW: "🇹🇼 대만", HK: "🇭🇰 홍콩", TH: "🇹🇭 태국",
  GB: "🇬🇧 영국", FR: "🇫🇷 프랑스", IT: "🇮🇹 이탈리아", RU: "🇷🇺 러시아", SG: "🇸🇬 싱가포르",
};
function countryLabel(code: string): string {
  return COUNTRY_KO[code] ?? code;
}

type Bucket = { label: string; count: number };

function BarList({
  title,
  rows,
  total,
  transform,
  empty = "데이터가 없습니다.",
}: {
  title: string;
  rows: Bucket[];
  total?: number;
  transform?: (label: string) => string;
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const sum = total ?? rows.reduce((n, r) => n + r.count, 0);
  return (
    <div className="border border-line rounded-sm p-4">
      <h3 className="text-[13.5px] font-bold mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-[12.5px] text-ink-faint">{empty}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-2 text-[12.5px]">
              <span className="w-[180px] flex-none truncate" title={transform ? transform(r.label) : r.label}>
                {transform ? transform(r.label) : r.label}
              </span>
              <span className="flex-1 h-[16px] bg-surface-alt rounded-sm overflow-hidden">
                <span className="block h-full bg-red/75" style={{ width: `${(r.count / max) * 100}%` }} />
              </span>
              <span className="w-[74px] flex-none text-right font-mono text-ink-soft">
                {r.count}
                {sum > 0 && <span className="text-ink-faint"> ({Math.round((r.count / sum) * 100)}%)</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period = PERIODS.find((p) => p.key === rawPeriod) ?? PERIODS[1];
  const since = sinceFor(period.days);

  // 페이지 경로 → 항목 한글명 매핑 (제품·기술 상세 경로를 사람이 읽기 쉽게)
  const itemNames: Record<string, Record<string, string>> = {};
  try {
    const groups = ["lineup", "tech", "industry", "material"];
    const lists = await Promise.all(groups.map((g) => contentItemRepo.listByGroup(g)));
    groups.forEach((g, i) => {
      itemNames[g] = Object.fromEntries(lists[i].map((it) => [it.itemKey, it.name]));
    });
  } catch {
    /* 매핑 실패 시 원본 경로로 표시 */
  }

  let error = "";
  let summary = { views: 0, visitors: 0, sessions: 0, avgDwellMs: 0 };
  let byDay: Bucket[] = [];
  let byCountry: Bucket[] = [];
  let byCity: Bucket[] = [];
  let byRefSource: Bucket[] = [];
  let byRefHost: Bucket[] = [];
  let byKeyword: Bucket[] = [];
  let byPath: Bucket[] = [];
  let byDevice: Bucket[] = [];
  let byBrowser: Bucket[] = [];
  let byOs: Bucket[] = [];
  let byTimezone: Bucket[] = [];
  let byCampaign: Bucket[] = [];
  let byHour: Bucket[] = [];
  let recent: Record<string, unknown>[] = [];

  try {
    [
      summary, byDay, byCountry, byCity, byRefSource, byRefHost, byKeyword, byPath,
      byDevice, byBrowser, byOs, byTimezone, byCampaign, byHour, recent,
    ] = await Promise.all([
      analyticsRepo.summary(since),
      analyticsRepo.byDay(since),
      analyticsRepo.grouped(since, "country"),
      analyticsRepo.grouped(since, "city"),
      analyticsRepo.grouped(since, "ref_source"),
      analyticsRepo.grouped(since, "ref_host"),
      analyticsRepo.grouped(since, "search_keyword", 20),
      analyticsRepo.grouped(since, "path", 15),
      analyticsRepo.grouped(since, "device"),
      analyticsRepo.grouped(since, "browser"),
      analyticsRepo.grouped(since, "os"),
      analyticsRepo.grouped(since, "timezone"),
      analyticsRepo.grouped(since, "utm_campaign"),
      analyticsRepo.byHour(since),
      analyticsRepo.recent(since, 40),
    ]);
  } catch {
    error = "분석 데이터를 불러오지 못했습니다. (데이터베이스 연결 확인 필요)";
  }

  const REF_SOURCE_KO: Record<string, string> = {
    direct: "직접 방문", search: "검색", social: "소셜", referral: "외부 링크", internal: "내부 이동",
  };
  const dayMax = Math.max(1, ...byDay.map((d) => d.count));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight">방문 분석</h1>
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map((p) => (
            <Link
              key={p.key}
              href={`/admin/analytics?period=${p.key}`}
              className={`px-3 py-1.5 text-[12.5px] border rounded-sm font-bold ${
                p.key === period.key ? "bg-ink text-white border-ink" : "border-line-strong text-ink-soft hover:border-blue"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {error ? (
        <p className="border border-red bg-red-soft text-ink p-4 rounded-sm text-[13px]">{error}</p>
      ) : (
        <>
          {/* 요약 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { k: "페이지뷰", v: summary.views.toLocaleString() },
              { k: "방문자 수(순)", v: summary.visitors.toLocaleString() },
              { k: "방문 세션", v: summary.sessions.toLocaleString() },
              { k: "평균 체류시간", v: fmtDwell(summary.avgDwellMs) },
            ].map((s) => (
              <div key={s.k} className="border border-line rounded-sm p-4">
                <div className="text-[12px] text-ink-soft mb-1">{s.k}</div>
                <div className="text-[22px] font-bold font-[family-name:var(--font-display)]">{s.v}</div>
              </div>
            ))}
          </div>

          {/* 일자별 추이 */}
          <div className="border border-line rounded-sm p-4 mb-6">
            <h3 className="text-[13.5px] font-bold mb-3">일자별 방문 추이</h3>
            {byDay.length === 0 ? (
              <p className="text-[12.5px] text-ink-faint">데이터가 없습니다.</p>
            ) : (
              <div className="flex items-end gap-1 h-[120px]">
                {byDay.map((d) => (
                  <div key={d.label} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0" title={`${d.label} · ${d.count}`}>
                    <span className="w-full bg-blue/70 rounded-t-sm" style={{ height: `${(d.count / dayMax) * 96}px` }} />
                    <span className="text-[9px] text-ink-faint truncate w-full text-center">{d.label.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <BarList title="국가별" rows={byCountry} total={summary.views} transform={countryLabel} />
            <BarList title="도시별" rows={byCity} total={summary.views} />
            <BarList title="유입 경로" rows={byRefSource} total={summary.views} transform={(l) => REF_SOURCE_KO[l] ?? l} />
            <BarList title="유입 사이트(추천·검색·소셜)" rows={byRefHost} empty="외부 유입 기록이 아직 없습니다." />
            <BarList title="사이트 내 검색어" rows={byKeyword} empty="검색 기록이 아직 없습니다." />
            <BarList title="가장 많이 본 페이지" rows={byPath} total={summary.views} transform={(p) => prettyPath(p, itemNames)} />
            <BarList title="캠페인(UTM)" rows={byCampaign} empty="UTM 캠페인 유입이 아직 없습니다." />
            <BarList title="접속 시간대(방문자 현지시각)" rows={byHour.filter((h) => h.count > 0)} empty="데이터가 없습니다." />
            <BarList title="기기" rows={byDevice} total={summary.views} />
            <BarList title="브라우저" rows={byBrowser} total={summary.views} />
            <BarList title="운영체제" rows={byOs} total={summary.views} />
            <BarList title="시간대(Timezone)" rows={byTimezone} total={summary.views} />
          </div>

          {/* 최근 방문 */}
          <h2 className="text-[15px] font-bold mt-8 mb-3">최근 방문 기록</h2>
          <div className="border border-line rounded-sm overflow-x-auto">
            <table className="w-full text-[12px] min-w-[720px]">
              <thead>
                <tr className="text-left text-ink-faint border-b border-line-strong">
                  <th className="px-3 py-2 font-mono font-normal">시각</th>
                  <th className="px-3 py-2 font-mono font-normal">국가·도시</th>
                  <th className="px-3 py-2 font-mono font-normal">페이지</th>
                  <th className="px-3 py-2 font-mono font-normal">유입</th>
                  <th className="px-3 py-2 font-mono font-normal">검색어</th>
                  <th className="px-3 py-2 font-mono font-normal">기기</th>
                  <th className="px-3 py-2 font-mono font-normal">체류</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-ink-faint">방문 기록이 아직 없습니다.</td>
                  </tr>
                ) : (
                  recent.map((r, i) => {
                    const c = r.country as string | null;
                    const city = r.city as string | null;
                    const src = r.ref_source as string | null;
                    const host = r.ref_host as string | null;
                    return (
                      <tr key={i} className="border-b border-line last:border-b-0">
                        <td className="px-3 py-2 whitespace-nowrap text-ink-soft">
                          {new Date(r.created_at as string).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{c ? countryLabel(c) : "-"}{city ? ` · ${city}` : ""}</td>
                        <td className="px-3 py-2 max-w-[240px] truncate" title={r.path as string}>{prettyPath(r.path as string, itemNames)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{REF_SOURCE_KO[src ?? ""] ?? src ?? "-"}{host ? ` (${host})` : ""}</td>
                        <td className="px-3 py-2">{(r.search_keyword as string) || "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{(r.device as string) || "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap font-mono">{fmtDwell((r.dwell_ms as number) ?? 0)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-[11.5px] text-ink-faint leading-relaxed">
            ※ 개인정보 보호: 방문자의 원본 IP 주소는 저장하지 않으며, 국가·도시·시간대만 집계에 사용합니다. 방문자 식별은
            브라우저에 저장되는 익명 ID로만 이루어지고 개인을 특정하지 않습니다. 검색엔진 정책상 외부 검색어(구글 등)는
            대부분 전달되지 않아, &quot;사이트 내 검색어&quot;는 홈페이지 자체 검색창에 입력된 내용만 집계됩니다.
          </p>
        </>
      )}
    </div>
  );
}

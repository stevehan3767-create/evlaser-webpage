import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { contentGroups, sitemap, ceoCards, jobs, patents, certifications } from "@/lib/data";
import {
  contentPageRepo,
  contentItemRepo,
  seedContentItemsIfEmpty,
  newsRepo,
  faqRepo,
  resourceRepo,
  officeRepo,
  distributorRepo,
} from "@/lib/repo";

export const dynamic = "force-dynamic";

interface SearchDoc {
  title: string;
  snippet: string;
  category: string;
  href: string;
}

function score(doc: SearchDoc, terms: string[]): number {
  const title = doc.title.toLowerCase();
  const body = doc.snippet.toLowerCase();
  let s = 0;
  for (const term of terms) {
    if (!term) continue;
    s += countOccurrences(title, term) * 5;
    s += countOccurrences(body, term) * 1;
  }
  return s;
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let idx = 0;
  while ((idx = haystack.indexOf(needle, idx)) !== -1) {
    count += 1;
    idx += needle.length;
  }
  return count;
}

function snippetAround(text: string, term: string, maxLen = 120): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const lower = clean.toLowerCase();
  const idx = term ? lower.indexOf(term.toLowerCase()) : -1;
  if (idx === -1) return clean.slice(0, maxLen) + (clean.length > maxLen ? "…" : "");
  const start = Math.max(0, idx - 40);
  const end = Math.min(clean.length, idx + term.length + 80);
  return (start > 0 ? "…" : "") + clean.slice(start, end) + (end < clean.length ? "…" : "");
}

type Translator = Awaited<ReturnType<typeof getTranslations>>;

// A handful of static text lives only as translated JSX props, not DB rows —
// pull it in the same way the page components that render it do (t()/t.raw())
// so the same words are searchable, and fall back to "" if a locale is
// missing an optional key instead of throwing.
function safeT(t: Translator, key: string): string {
  try {
    const v = t(key);
    return typeof v === "string" ? v : "";
  } catch {
    return "";
  }
}

function safeRaw(t: Translator, key: string): unknown {
  try {
    return t.raw(key);
  } catch {
    return undefined;
  }
}

async function buildDocs(): Promise<SearchDoc[]> {
  const docs: SearchDoc[] = [];

  const [pages, news, faqs, resources, offices, distributors, tCompany, tCeo, tSupport, tCareers, tNav] =
    await Promise.all([
      contentPageRepo.listAll().catch(() => []),
      newsRepo.list(true).catch(() => []),
      faqRepo.list().catch(() => []),
      resourceRepo.list().catch(() => []),
      officeRepo.list().catch(() => []),
      distributorRepo.list().catch(() => []),
      getTranslations("company"),
      getTranslations("ceo"),
      getTranslations("support"),
      getTranslations("careers"),
      getTranslations("nav"),
    ]);
  const pageMap = new Map(pages.map((p) => [`${p.groupKey}::${p.itemKey}`, p]));

  // 1. 제품·기술·산업·재료 상세페이지 (관리자 등록 항목/내용 + 시드 데이터)
  for (const [group, meta] of Object.entries(contentGroups)) {
    await seedContentItemsIfEmpty(group, meta.itemSeeds);
    const groupItems = await contentItemRepo.listByGroup(group);
    for (const item of groupItems) {
      const saved = pageMap.get(`${group}::${item.itemKey}`);
      const seed = meta.seeds.find((s) => s.key === item.itemKey);
      const title = saved?.title || seed?.title || item.name;
      const description = saved?.description || seed?.description || "";
      docs.push({ title, snippet: description, category: meta.labelKo, href: `/products/${group}/${item.itemKey}` });
    }
  }

  // 2. 뉴스·FAQ(관리자 등록)·자료실
  for (const n of news) {
    docs.push({ title: n.title, snippet: n.body, category: "뉴스·소식", href: "/news" });
  }
  for (const f of faqs) {
    docs.push({ title: f.question, snippet: f.answer, category: "자주 묻는 질문", href: "/support?view=faq" });
  }
  for (const r of resources) {
    docs.push({ title: r.title, snippet: r.description, category: "자료실", href: "/resources" });
  }

  // 3. 전체 메뉴(사이트맵) 항목 — 각 서브 메뉴의 실제 표시 라벨
  for (const branch of sitemap) {
    const branchLabel = safeT(tNav, `${branch.branchKey}.label`);
    for (const item of branch.items) {
      const label = safeT(tNav, `${branch.branchKey}.items.${item.key}`);
      if (!label) continue;
      docs.push({ title: label, snippet: "", category: branchLabel || "메뉴", href: item.href });
    }
  }

  // 4. 대표이사 직속 소통센터 (윤리경영/임직원 칭찬/고객불만)
  for (const c of ceoCards) {
    const title = safeT(tCeo, `cards.${c.id}.title`);
    const desc = safeT(tCeo, `cards.${c.id}.desc`);
    if (!title) continue;
    docs.push({ title, snippet: desc, category: safeT(tCeo, "title") || "대표이사 직속 소통센터", href: `/ceo-channel#${c.id}` });
  }

  // 5. 자주 묻는 질문 (고정 항목)
  const staticFaq = (safeRaw(tSupport, "faq") ?? {}) as Record<string, { q?: string; a?: string }>;
  for (const entry of Object.values(staticFaq)) {
    if (!entry?.q) continue;
    docs.push({ title: entry.q, snippet: entry.a ?? "", category: "자주 묻는 질문", href: "/support?view=faq" });
  }

  // 6. 회사소개 (인사말/연혁/조직도/사업분야/특허·인증)
  const greetingParagraphs = (safeRaw(tCompany, "greeting.paragraphs") ?? []) as string[];
  docs.push({
    title: safeT(tCompany, "greeting.title") || "인사말",
    snippet: greetingParagraphs.join(" "),
    category: safeT(tCompany, "title") || "회사소개",
    href: "/company#overview",
  });

  const historyItems = (safeRaw(tCompany, "history.items") ?? []) as { year: string; items: string[] }[];
  docs.push({
    title: safeT(tCompany, "history.title") || "연혁",
    snippet: historyItems.map((h) => `${h.year} ${h.items.join(" ")}`).join(" "),
    category: safeT(tCompany, "title") || "회사소개",
    href: "/company#history",
  });

  const orgUnits = (safeRaw(tCompany, "organization.units") ?? {}) as Record<string, { title: string; desc: string; tasks: string[] }>;
  docs.push({
    title: safeT(tCompany, "organization.title") || "조직도",
    snippet: [
      safeT(tCompany, "organization.desc"),
      ...Object.values(orgUnits).flatMap((u) => [u.title, u.desc, ...(u.tasks ?? [])]),
    ].join(" "),
    category: safeT(tCompany, "title") || "회사소개",
    href: "/company#organization",
  });

  docs.push({
    title: safeT(tCompany, "business.title") || "사업분야",
    snippet: safeT(tCompany, "business.desc"),
    category: safeT(tCompany, "title") || "회사소개",
    href: "/company#business",
  });

  docs.push({
    title: safeT(tCompany, "patents.title") || "특허 및 인증",
    snippet: [...patents.map((p) => p.title), ...certifications.map((c) => `${c.title} ${c.subtitle ?? ""}`)].join(" "),
    category: safeT(tCompany, "title") || "회사소개",
    href: "/company#patents",
  });

  // 7. 채용 (실제 채용공고 + 인재상)
  for (const job of jobs) {
    const base = `careers.jobs.${job.key}`;
    const title = safeT(tCareers, `${base}.title`);
    if (!title) continue;
    const parts = [
      safeT(tCareers, `${base}.field`),
      safeT(tCareers, `${base}.department`),
      ...((safeRaw(tCareers, `${base}.responsibilities`) as string[] | undefined) ?? []),
      ...((safeRaw(tCareers, `${base}.requirements`) as string[] | undefined) ?? []),
    ].filter(Boolean);
    docs.push({ title, snippet: parts.join(" "), category: "채용", href: "/careers" });
  }
  const cultureValues = (safeRaw(tCareers, "culture.values") ?? {}) as Record<string, { title: string; desc: string }>;
  docs.push({
    title: safeT(tCareers, "culture.title") || "인재상",
    snippet: Object.values(cultureValues)
      .map((v) => `${v.title} ${v.desc}`)
      .join(" "),
    category: "채용",
    href: "/careers#culture",
  });

  // 8. 글로벌 네트워크 (거점/대리점, 관리자 등록 내용)
  for (const o of offices) {
    docs.push({ title: o.name, snippet: [o.address, o.phone ?? "", o.email ?? ""].join(" "), category: "글로벌 네트워크", href: "/global#offices" });
  }
  for (const d of distributors) {
    docs.push({
      title: `${d.country} - ${d.partner}`,
      snippet: [d.contact ?? "", d.phone ?? ""].join(" "),
      category: "글로벌 네트워크",
      href: "/global#distributors",
    });
  }

  return docs;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const results =
    terms.length === 0
      ? []
      : (await buildDocs())
          .map((doc) => ({ doc, s: score(doc, terms) }))
          .filter((r) => r.s > 0)
          .sort((a, b) => b.s - a.s)
          .map((r) => r.doc);

  return (
    <div className="py-16 sm:py-22">
      <div className="mx-auto max-w-[820px] px-7">
        <span className="eyebrow">SEARCH</span>
        <h1 className="text-[24px] sm:text-[30px] font-[family-name:var(--font-display)] tracking-tight mt-2.5">
          {query ? <>&ldquo;{query}&rdquo; 검색결과</> : "검색"}
        </h1>

        {query && (
          <p className="text-[13px] text-ink-soft mt-3">
            총 <strong className="text-ink">{results.length}</strong>건의 결과를 연관도 순으로 표시합니다.
          </p>
        )}

        <div className="mt-8 flex flex-col divide-y divide-line border-t border-b border-line">
          {query === "" ? (
            <p className="py-10 text-[13.5px] text-ink-faint text-center">검색어를 입력해 주세요.</p>
          ) : results.length === 0 ? (
            <p className="py-10 text-[13.5px] text-ink-faint text-center">&ldquo;{query}&rdquo;에 대한 검색결과가 없습니다.</p>
          ) : (
            results.map((doc, i) => (
              <Link key={`${doc.href}-${i}`} href={doc.href} className="py-5 group">
                <span className="inline-block text-[11px] font-bold text-blue border border-blue rounded-sm px-1.5 py-0.5">
                  {doc.category}
                </span>
                <p className="mt-2 text-[15.5px] font-bold text-ink group-hover:text-blue">{doc.title}</p>
                {doc.snippet && (
                  <p className="mt-1.5 text-[13px] text-ink-soft leading-relaxed">{snippetAround(doc.snippet, terms[0] ?? "")}</p>
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

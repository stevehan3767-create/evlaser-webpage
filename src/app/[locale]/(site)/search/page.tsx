import { Link } from "@/i18n/navigation";
import { contentGroups } from "@/lib/data";
import { contentPageRepo, newsRepo, faqRepo, resourceRepo } from "@/lib/repo";

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

async function buildDocs(): Promise<SearchDoc[]> {
  const docs: SearchDoc[] = [];

  const [pages, news, faqs, resources] = await Promise.all([
    contentPageRepo.listAll().catch(() => []),
    newsRepo.list(true).catch(() => []),
    faqRepo.list().catch(() => []),
    resourceRepo.list().catch(() => []),
  ]);
  const pageMap = new Map(pages.map((p) => [`${p.groupKey}::${p.itemKey}`, p]));

  for (const [group, meta] of Object.entries(contentGroups)) {
    for (const item of meta.items) {
      const saved = pageMap.get(`${group}::${item.key}`);
      const seed = meta.seeds.find((s) => s.key === item.key);
      const title = saved?.title || seed?.title || meta.labelsKo[item.key] || item.key;
      const description = saved?.description || seed?.description || "";
      docs.push({
        title,
        snippet: description,
        category: meta.labelKo,
        href: `/products/${group}/${item.key}`,
      });
    }
  }

  for (const n of news) {
    docs.push({ title: n.title, snippet: n.body, category: "뉴스·소식", href: "/news" });
  }
  for (const f of faqs) {
    docs.push({ title: f.question, snippet: f.answer, category: "자주 묻는 질문", href: "/support" });
  }
  for (const r of resources) {
    docs.push({ title: r.title, snippet: r.description, category: "자료실", href: "/resources" });
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

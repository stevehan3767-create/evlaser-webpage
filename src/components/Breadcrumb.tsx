import { Link } from "@/i18n/navigation";

// 현재 위치를 보여주면서 상위 카테고리·홈으로 바로 이동할 수 있는 경로 표시.
// 마지막 항목(현재 페이지)은 링크 없이 강조 표시한다.
export type Crumb = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="현재 위치" className="mb-5">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px]">
        <li className="flex items-center gap-1.5">
          <Link href="/" className="inline-flex items-center gap-1 text-ink-faint hover:text-blue transition-colors">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
            </svg>
            홈
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              <span aria-hidden className="text-line-strong">›</span>
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className="font-bold text-ink">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="font-semibold text-blue hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

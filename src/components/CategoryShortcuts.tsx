import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import type { IconName } from "@/lib/data";

// 메인 화면의 4개 카테고리 "입구" 카드. 항목을 나열하지 않고 각 목록 페이지로
// 바로 이동시켜 첫 화면을 깔끔하게 유지한다.
const CARDS: { icon: IconName; title: string; desc: string; href: string }[] = [
  { icon: "machine", title: "설비 라인업", desc: "EV Laser의 전체 설비를 한눈에", href: "/products/lineup?finder=open" },
  { icon: "weld", title: "기술종류별", desc: "용접·절단·마킹 등 가공 기술로 찾기", href: "/products/tech" },
  { icon: "build", title: "산업분야별", desc: "자동차·반도체·전자 등 산업으로 찾기", href: "/products/industries" },
  { icon: "steel", title: "재료별", desc: "금속·플라스틱·유리 등 소재로 찾기", href: "/products/materials" },
];

export default function CategoryShortcuts() {
  return (
    <section className="py-14 sm:py-18 border-b border-line">
      <div className="mx-auto max-w-[1240px] px-7">
        <span className="eyebrow">FIND YOUR SOLUTION</span>
        <h2 className="mt-2.5 text-[22px] sm:text-[30px] font-[family-name:var(--font-display)] tracking-tight">무엇으로 찾으시겠어요?</h2>
        <p className="mt-3 text-ink-soft text-[14px]">원하는 방식을 선택하면 해당 목록으로 바로 이동합니다.</p>

        <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-3">
          {CARDS.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group border border-line rounded-lg p-5 sm:p-6 bg-surface text-center hover:border-blue hover:shadow-[0_6px_18px_rgba(11,77,162,0.12)] hover:-translate-y-0.5 transition-all"
            >
              <span className="w-[52px] h-[52px] rounded-xl bg-blue-soft text-blue flex items-center justify-center mx-auto mb-3 group-hover:bg-blue group-hover:text-white transition-colors">
                <Icon name={c.icon} className="w-6 h-6" strokeWidth={1.6} />
              </span>
              <span className="block text-[15.5px] font-bold">{c.title}</span>
              <span className="block mt-1 text-[11.5px] text-ink-faint leading-snug">{c.desc}</span>
              <span className="block mt-2.5 text-[11.5px] font-bold text-red">바로가기 →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

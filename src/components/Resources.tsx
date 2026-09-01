import Icon from "./Icon";
import { resourceRepo } from "@/lib/repo";
import type { IconName } from "@/lib/data";

const CATEGORIES: { key: string; icon: IconName; title: string; desc: string }[] = [
  { key: "doc", icon: "doc", title: "기술자료", desc: "백서, 스펙시트, 응용 리포트를 다운로드할 수 있습니다." },
  { key: "video", icon: "play", title: "동영상자료실", desc: "실제 장비 가동 영상과 공정 데모를 확인하세요." },
  { key: "case", icon: "case", title: "적용사례", desc: "산업별 도입 사례와 성과 데이터를 소개합니다." },
];

export default function Resources() {
  const items = resourceRepo.list();

  return (
    <section id="resources" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">RESOURCE CENTER</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            자료실
          </h1>
        </div>

        {CATEGORIES.map((cat) => {
          const catItems = items.filter((i) => i.category === cat.key);
          return (
            <div key={cat.key} className="mb-12 last:mb-0">
              <h2 className="flex items-center gap-2.5 text-[16px] mb-4">
                <Icon name={cat.icon} className="w-[19px] h-[19px] text-blue" />
                {cat.title}
              </h2>
              {catItems.length === 0 ? (
                <div className="border border-line bg-surface p-6 text-[13px] text-ink-soft">
                  {cat.desc} — 관리자 모드에서 자료를 등록하면 이곳에 표시됩니다.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
                  {catItems.map((item) => (
                    <div key={item.id} className="border border-line bg-surface p-5">
                      <h3 className="text-[15.5px] mb-2">{item.title}</h3>
                      <p className="text-[13px] text-ink-soft">{item.description}</p>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-[12.5px] font-bold text-blue"
                        >
                          바로가기 →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="inline-flex items-center gap-[7px] mt-4 text-[12px] text-blue bg-blue-soft border border-line-strong px-3.5 py-2.5 font-mono">
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

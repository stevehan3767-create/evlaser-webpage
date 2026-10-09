import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Icon from "./Icon";
import LinkPreviewButton from "./LinkPreviewButton";
import { resourceRepo } from "@/lib/repo";
import type { IconName } from "@/lib/data";

const CATEGORIES: { key: string; icon: IconName }[] = [
  { key: "doc", icon: "doc" },
  { key: "video", icon: "play" },
  { key: "case", icon: "case" },
];

// 유튜브 URL에서 영상 ID를 뽑아 미리보기 썸네일 주소를 만든다. (그 외 링크는 null)
function youtubeThumb(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

function VideoThumb({ url, title }: { url: string | null; title: string }) {
  const thumb = youtubeThumb(url);
  const inner = (
    <div className="relative aspect-video overflow-hidden rounded-md border border-line bg-surface-alt">
      {thumb ? (
        // 외부(YouTube) 썸네일은 방문자 브라우저에서 로드 — 일반 img 사용
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-soft to-surface-alt text-blue/70">
          <Icon name="play" className="w-9 h-9" />
        </div>
      )}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
          <svg viewBox="0 0 24 24" className="w-5 h-5 ml-0.5" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </div>
  );
  if (!url) return <div className="mb-3">{inner}</div>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block mb-3">
      {inner}
    </a>
  );
}

export default async function Resources({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat: rawCat } = await searchParams;
  const activeCat = CATEGORIES.some((c) => c.key === rawCat) ? (rawCat as string) : CATEGORIES[0].key;

  const t = await getTranslations("resources");
  const items = await resourceRepo.list();
  const activeItems = items.filter((i) => i.category === activeCat);
  const activeCategory = CATEGORIES.find((c) => c.key === activeCat)!;

  return (
    <section id="resources" className="py-16 sm:py-22 border-b border-line bg-surface-alt">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance">
            {t("title")}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/resources?cat=${c.key}`}
              className={`flex items-center gap-2 px-4 py-2 text-[13.5px] font-bold border rounded-sm transition-colors ${
                c.key === activeCat
                  ? "bg-red text-white border-red"
                  : "bg-surface text-ink-soft border-line-strong hover:border-red hover:text-red"
              }`}
            >
              <Icon name={c.icon} className="w-[17px] h-[17px]" />
              {t(`categories.${c.key}.title`)}
            </Link>
          ))}
        </div>

        <div>
          {activeItems.length === 0 ? (
            <div className="border border-line bg-surface p-6 text-[13px] text-ink-soft">
              {t(`categories.${activeCategory.key}.desc`)} — {t("emptyNote")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
              {activeItems.map((item) => (
                <div key={item.id} className="border border-line bg-surface p-5">
                  {activeCat === "video" && <VideoThumb url={item.url} title={item.title} />}
                  <h3 className="text-[15.5px] mb-2">{item.title}</h3>
                  <p className="text-[13px] text-ink-soft">{item.description}</p>
                  {item.url && (
                    <LinkPreviewButton url={item.url} label={`${t("linkCta")} →`} className="mt-3 inline-block text-[12.5px] font-bold text-blue" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

import Link from "next/link";
import Icon from "./Icon";
import { ceoCards } from "@/lib/data";

export default function CeoChannel() {
  return (
    <section id="ceo-channel" className="py-16 sm:py-22 bg-blue-deep-2 text-white">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-9">
          <span className="eyebrow !text-[#8fb3ea]">CEO DIRECT CHANNEL</span>
          <h1 className="mt-2.5 text-[24px] sm:text-[32px] font-[family-name:var(--font-display)] tracking-tight text-balance text-white">
            대표이사 직속 소통센터
          </h1>
          <p className="text-[#aec2de] max-w-[58ch] mt-2.5">
            고객님과 임직원의 목소리에 대표이사가 직접 귀를 기울이고 개선하겠습니다.
          </p>
        </div>
        <div className="flex gap-3.5 p-[18px] bg-white/6 border border-white/18 mb-9">
          <Icon name="lock" className="w-[22px] h-[22px] text-[#8fb3ea] flex-none" />
          <p className="text-[13px] text-[#d3dfef]">
            본 채널은 대표이사 직속으로 운영되며, 제보자의 신원과 내용은 철저히 비밀이 보장되고 어떠한 불이익도 없는
            보호조치가 적용됩니다. 접수된 내용은 대표이사 개인 메일(sbhan3763@naver.com)로 즉시 전달됩니다.
          </p>
        </div>
        <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {ceoCards.map((c) => (
            <div
              key={c.title}
              id={c.id}
              className="bg-white/4 border border-white/16 border-t-[3px] border-t-red p-[26px] flex flex-col gap-3 scroll-mt-28"
            >
              <Icon name={c.icon} className="w-[30px] h-[30px] text-red" />
              <h3 className="text-[16.5px] text-white">{c.title}</h3>
              <p className="text-[13px] text-[#b7c4d8]">{c.desc}</p>
              <Link href={`/support?channel=${c.id}`} className="mt-auto text-[12.5px] font-bold text-white inline-flex items-center gap-[5px]">
                {c.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

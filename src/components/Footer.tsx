import Link from "next/link";
import Logo from "./Logo";
import Icon from "./Icon";
import { companyNav, productsNav, resourcesNav, globalNav, supportNav } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-blue-deep-2 text-[#b7c4d8] pt-16">
      <div className="mx-auto max-w-[1240px] px-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] gap-8 pb-12 border-b border-white/12">
        <div>
          <Link href="/" className="inline-flex items-center mb-4 text-white">
            <Logo className="w-[140px]" />
          </Link>
          <p className="text-[13px] leading-relaxed opacity-[.85] max-w-[38ch]">
            EV Laser는 2002년 설립 이래 한 우물을 파온 레이저기술 전문기업으로, 정밀 레이저 기술로 자동차, 반도체,
            바이오의료, 항공 등 첨단 제조 산업을 지원하는 글로벌 레이저 솔루션 기업입니다.
          </p>
          <p className="mt-4 text-[12.5px] leading-8 opacity-80">
            (주)이브이레이저 · 대표이사 한상배
            <br />
            본사: 경기도 군포시 고산로148번길 17, 군포IT밸리 B동 313호(15850)
            <br />
            레이저기술센터: 경기도 군포시 농심로2, 삼보스카이비즈 706호(15845)
            <br />
            T. 031-452-9860
          </p>
        </div>
        <FootCol title="회사소개" items={companyNav.slice(1, 4)} />
        <FootCol title="제품·기술" items={productsNav} />
        <FootCol
          title="자료실"
          items={[...resourcesNav.slice(0, 2), { label: "뉴스·소식", href: "/news" }]}
        />
        <FootCol
          title="문의하기"
          items={[
            ...supportNav.slice(0, 1),
            { label: "채용", href: "/careers" },
            globalNav[1],
            { label: "대표이사 직속 소통센터", href: "/ceo-channel", accent: true },
          ]}
        />
      </div>
      <div className="mx-auto max-w-[1240px] px-7 flex justify-between items-center gap-4 py-[22px] text-[12px] flex-wrap">
        <span>© 2026 EV Laser Co., Ltd. All rights reserved.</span>
        <a href="#" className="flex items-center gap-1.5 opacity-70 hover:opacity-100">
          <Icon name="lock" className="w-[13px] h-[13px]" />
          관리자 로그인
        </a>
      </div>
    </footer>
  );
}

function FootCol({ title, items }: { title: string; items: { label: string; href: string; accent?: boolean }[] }) {
  return (
    <div>
      <h4 className="text-white text-[12px] tracking-wide uppercase font-mono mb-4">{title}</h4>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className={`text-[13.3px] opacity-[.85] hover:opacity-100 hover:text-white ${item.accent ? "text-[#ff7a90]" : ""}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

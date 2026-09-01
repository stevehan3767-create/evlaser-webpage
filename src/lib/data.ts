export type IconName =
  | "car" | "battery" | "semi" | "bio" | "home" | "ship" | "aero" | "machine"
  | "steel" | "display" | "defense" | "precision" | "etc"
  | "weld" | "cut" | "mark" | "clean" | "drill" | "heat" | "clad" | "print3d"
  | "medical" | "safety" | "measure"
  | "doc" | "play" | "case" | "pin" | "globe" | "bell" | "lock" | "build"
  | "flag" | "people" | "shield" | "star" | "alert" | "handshake" | "briefcase";

export interface Industry {
  icon: IconName;
  label: string;
}

export const industries: Industry[] = [
  { icon: "car", label: "자동차" },
  { icon: "battery", label: "밧데리" },
  { icon: "semi", label: "반도체" },
  { icon: "bio", label: "바이오의료헬스" },
  { icon: "home", label: "생활·가전" },
  { icon: "ship", label: "조선" },
  { icon: "aero", label: "항공" },
  { icon: "machine", label: "기계" },
  { icon: "steel", label: "철강" },
  { icon: "display", label: "디스플레이" },
  { icon: "defense", label: "방위산업" },
  { icon: "precision", label: "정밀가공" },
  { icon: "etc", label: "기타" },
];

export interface TechItem {
  icon: IconName;
  label: string;
}

export const techItems: TechItem[] = [
  { icon: "weld", label: "플라스틱 용접" },
  { icon: "weld", label: "금속·알루미늄·동 용접" },
  { icon: "weld", label: "유리 용접" },
  { icon: "cut", label: "레이저 절단" },
  { icon: "mark", label: "레이저마킹(조각·인쇄)" },
  { icon: "clean", label: "레이저 클리닝(세정)" },
  { icon: "precision", label: "레이저정밀(미세)가공" },
  { icon: "drill", label: "레이저드릴링" },
  { icon: "heat", label: "레이저열처리(가열)" },
  { icon: "clad", label: "레이저클래딩(코팅)" },
  { icon: "print3d", label: "3D프린팅" },
  { icon: "medical", label: "의료기기" },
  { icon: "safety", label: "레이저안전" },
  { icon: "etc", label: "기타" },
];

export const companyNav = [
  { label: "인사말·개요", href: "/company" },
  { label: "연혁", href: "/company#history" },
  { label: "사업분야", href: "/company#business" },
  { label: "특허·인증", href: "/company#patents" },
  { label: "오시는 길", href: "/global#offices" },
];

export const productsNav = [
  { label: "기술종류별", href: "/products#tech" },
  { label: "산업분야별", href: "/products#industries" },
  { label: "재료별", href: "/products#tech" },
];

export const resourcesNav = [
  { label: "기술자료", href: "/resources" },
  { label: "동영상자료실", href: "/resources" },
  { label: "적용사례", href: "/resources" },
];

export const newsNav = [
  { label: "회사소식", href: "/news" },
  { label: "전시회소식", href: "/news" },
  { label: "산업동향", href: "/news" },
];

export const careersNav = [
  { label: "채용공고", href: "/careers" },
  { label: "인재상", href: "/careers#culture" },
];

export const globalNav = [
  { label: "지사·연락처", href: "/global#offices" },
  { label: "대리점 찾기", href: "/global#distributors" },
];

export const supportNav = [
  { label: "문의하기(Q&A)", href: "/support" },
  { label: "자주 묻는 질문", href: "/support#faq" },
];

export interface SitemapBranch {
  icon: IconName;
  title: string;
  titleHref: string;
  items: { label: string; href: string }[];
  accent?: boolean;
}

export const sitemap: SitemapBranch[] = [
  { icon: "build", title: "회사소개", titleHref: "/company", items: companyNav },
  { icon: "cut", title: "제품·기술", titleHref: "/products", items: productsNav },
  { icon: "doc", title: "자료실", titleHref: "/resources", items: resourcesNav },
  { icon: "bell", title: "뉴스·소식", titleHref: "/news", items: newsNav },
  { icon: "people", title: "채용", titleHref: "/careers", items: careersNav },
  { icon: "globe", title: "글로벌 네트워크", titleHref: "/global", items: globalNav },
  { icon: "flag", title: "문의하기", titleHref: "/support", items: supportNav },
  {
    icon: "lock",
    title: "관리자 모드",
    titleHref: "#",
    items: [
      { label: "자료·콘텐츠 관리", href: "#" },
      { label: "문의·회원 관리", href: "#" },
    ],
  },
  {
    icon: "alert",
    title: "대표이사 직속 소통센터",
    titleHref: "/ceo-channel",
    items: [
      { label: "윤리경영 신고센터", href: "/ceo-channel#ethics" },
      { label: "임직원 칭찬방", href: "/ceo-channel#praise" },
      { label: "CEO 직속 고객불만", href: "/ceo-channel#complaint" },
    ],
    accent: true,
  },
];

export const resourceCards = [
  { icon: "doc" as IconName, title: "기술자료", desc: "백서, 스펙시트, 응용 리포트를 다운로드할 수 있습니다." },
  { icon: "play" as IconName, title: "동영상자료실", desc: "실제 장비 가동 영상과 공정 데모를 확인하세요." },
  { icon: "case" as IconName, title: "적용사례", desc: "산업별 도입 사례와 성과 데이터를 소개합니다." },
];

export const officeRows = [
  { country: "Korea (HQ)", partner: "EV Laser 본사", contact: "영업지원팀", phone: "+82 31 452 9860" },
  { country: "Korea (Laser Tech Center)", partner: "레이저기술센터", contact: "기술지원팀", phone: "+82 31 452 9860" },
];

export const distributorRows = [
  { country: "United States", partner: "EVL Americas Inc.", contact: "J. Carter", phone: "+1 000 000 0000" },
  { country: "Germany", partner: "EVL Europe GmbH", contact: "M. Weber", phone: "+49 000 000000" },
  { country: "China", partner: "EVL China Co., Ltd.", contact: "L. Wang", phone: "+86 000 0000 0000" },
  { country: "Japan", partner: "EVL Japan K.K.", contact: "K. Sato", phone: "+81 00 0000 0000" },
];

export const newsItems = [
  { tag: "회사소식", title: "EV Laser, 차세대 배터리 용접 라인 공급 계약 체결", date: "2026.08.24" },
  { tag: "산업동향", title: "반도체 패키징 공정용 초정밀 마킹 기술 동향", date: "2026.08.11" },
  { tag: "전시회소식", title: "SEMICON Korea 2026 참가 및 부스 안내", date: "2026.07.29" },
  { tag: "회사소식", title: "EV Laser, 글로벌 인증(ISO) 갱신 완료", date: "2026.06.15" },
];

export const jobs = [
  { title: "레이저 응용기술 엔지니어", type: "정규직·경력", loc: "군포 본사", due: "상시채용" },
  { title: "해외영업(글로벌마케팅) 담당자", type: "정규직·신입/경력", loc: "군포 본사", due: "상시채용" },
];

export const ceoCards = [
  {
    id: "ethics",
    icon: "shield" as IconName,
    title: "윤리경영 신고센터",
    desc: "기업 내 부정·비리, 금품 수수, 직장 내 괴롭힘 등을 철저한 보안 속에 익명 또는 실명으로 제보해 주세요.",
    cta: "신고하기",
  },
  {
    id: "praise",
    icon: "star" as IconName,
    title: "임직원 칭찬방",
    desc: "고객님께 감동을 드린 임직원을 추천해 주세요. 대표이사가 직접 격려하고 포상합니다.",
    cta: "칭찬하기",
  },
  {
    id: "complaint",
    icon: "alert" as IconName,
    title: "CEO 직속 고객불만",
    desc: "일반 상담으로 해결되지 않은 불편사항을 대표이사가 직접 챙겨 신속히 해결해 드립니다.",
    cta: "접수하기",
  },
];

export const faqs = [
  { q: "견적은 어떻게 요청하나요?", a: "문의 양식에 산업분야와 요구사항을 남겨주시면 담당팀에서 안내드립니다." },
  { q: "해외 설치·지원이 가능한가요?", a: "글로벌 네트워크를 통해 현지 대리점이 설치 및 유지보수를 지원합니다." },
  { q: "기술자료 열람에 별도 가입이 필요한가요?", a: "공개 자료는 로그인 없이 열람 가능하며, 일부 상세자료는 담당자 확인 후 제공됩니다." },
];

export const showcaseSlides = [
  { icon: "weld" as IconName, tag: "BATTERY WELDING", title: "배터리팩 레이저 용접 라인", from: "#0B4DA2", to: "#062C63" },
  { icon: "cut" as IconName, tag: "PRECISION CUTTING", title: "정밀 금속부품 레이저 절단", from: "#E4002B", to: "#7A0016" },
  { icon: "semi" as IconName, tag: "SEMICONDUCTOR MARKING", title: "반도체 부품 레이저 마킹", from: "#0B4DA2", to: "#12213B" },
  { icon: "clad" as IconName, tag: "SURFACE CLADDING", title: "레이저 클래딩 표면 코팅", from: "#062C63", to: "#0B4DA2" },
  { icon: "print3d" as IconName, tag: "ADDITIVE MANUFACTURING", title: "금속 3D프린팅 설비", from: "#3A3F47", to: "#12151A" },
];

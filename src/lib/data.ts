export type IconName =
  | "car" | "battery" | "semi" | "bio" | "home" | "ship" | "aero" | "machine"
  | "steel" | "display" | "defense" | "precision" | "etc"
  | "weld" | "cut" | "mark" | "clean" | "drill" | "heat" | "clad" | "print3d"
  | "medical" | "safety" | "measure"
  | "doc" | "play" | "case" | "pin" | "globe" | "bell" | "lock" | "build"
  | "flag" | "people" | "shield" | "star" | "alert" | "handshake" | "briefcase";

export interface Industry {
  icon: IconName;
  key: string;
}

export const industries: Industry[] = [
  { icon: "car", key: "automotive" },
  { icon: "battery", key: "battery" },
  { icon: "semi", key: "semiconductor" },
  { icon: "bio", key: "bioHealth" },
  { icon: "home", key: "homeAppliance" },
  { icon: "ship", key: "shipbuilding" },
  { icon: "aero", key: "aerospace" },
  { icon: "machine", key: "machinery" },
  { icon: "steel", key: "steel" },
  { icon: "display", key: "display" },
  { icon: "defense", key: "defense" },
  { icon: "precision", key: "precisionMachining" },
  { icon: "etc", key: "other" },
];

export interface TechItem {
  icon: IconName;
  key: string;
}

export const techItems: TechItem[] = [
  { icon: "weld", key: "plasticWelding" },
  { icon: "weld", key: "metalWelding" },
  { icon: "weld", key: "glassWelding" },
  { icon: "cut", key: "cutting" },
  { icon: "mark", key: "marking" },
  { icon: "mark", key: "etching" },
  { icon: "clean", key: "cleaning" },
  { icon: "precision", key: "precisionMachining" },
  { icon: "drill", key: "drilling" },
  { icon: "heat", key: "heatTreatment" },
  { icon: "clad", key: "cladding" },
  { icon: "print3d", key: "print3d" },
  { icon: "medical", key: "medical" },
  { icon: "safety", key: "safety" },
  { icon: "etc", key: "other" },
];

// Tech items with real, user-provided detail content (source: evlaser.co.kr
// "사업소개 > 주요공법" pages). See messages `techDetails` namespace.
// "safety" uses a different content shape and is rendered separately.
export const techDetailKeys = [
  "plasticWelding",
  "etching",
  "cleaning",
  "cutting",
  "marking",
  "heatTreatment",
  "cladding",
];

export interface NavItem {
  key: string;
  href: string;
}

export const companyNav: NavItem[] = [
  { key: "overview", href: "/company" },
  { key: "history", href: "/company#history" },
  { key: "business", href: "/company#business" },
  { key: "patents", href: "/company#patents" },
  { key: "directions", href: "/global#offices" },
];

export const productsNav: NavItem[] = [
  { key: "byTech", href: "/products#tech" },
  { key: "byIndustry", href: "/products#industries" },
  { key: "byMaterial", href: "/products#tech" },
];

export const resourcesNav: NavItem[] = [
  { key: "docs", href: "/resources" },
  { key: "videos", href: "/resources" },
  { key: "cases", href: "/resources" },
];

export const newsNav: NavItem[] = [
  { key: "company", href: "/news" },
  { key: "exhibition", href: "/news" },
  { key: "industry", href: "/news" },
];

export const careersNav: NavItem[] = [
  { key: "openings", href: "/careers" },
  { key: "culture", href: "/careers#culture" },
];

export const globalNav: NavItem[] = [
  { key: "offices", href: "/global#offices" },
  { key: "distributors", href: "/global#distributors" },
];

export const supportNav: NavItem[] = [
  { key: "contact", href: "/support" },
  { key: "faq", href: "/support#faq" },
];

export interface SitemapBranch {
  icon: IconName;
  branchKey: string;
  navKey: string;
  titleHref: string;
  items: NavItem[];
  accent?: boolean;
}

export const sitemap: SitemapBranch[] = [
  { icon: "build", branchKey: "company", navKey: "company", titleHref: "/company", items: companyNav },
  { icon: "cut", branchKey: "products", navKey: "products", titleHref: "/products", items: productsNav },
  { icon: "doc", branchKey: "resources", navKey: "resources", titleHref: "/resources", items: resourcesNav },
  { icon: "bell", branchKey: "news", navKey: "news", titleHref: "/news", items: newsNav },
  { icon: "people", branchKey: "careers", navKey: "careers", titleHref: "/careers", items: careersNav },
  { icon: "globe", branchKey: "global", navKey: "global", titleHref: "/global", items: globalNav },
  { icon: "flag", branchKey: "support", navKey: "support", titleHref: "/support", items: supportNav },
  {
    icon: "lock",
    branchKey: "admin",
    navKey: "admin",
    titleHref: "#",
    items: [
      { key: "contentMgmt", href: "#" },
      { key: "memberMgmt", href: "#" },
    ],
  },
  {
    icon: "alert",
    branchKey: "ceo",
    navKey: "ceo",
    titleHref: "/ceo-channel",
    items: [
      { key: "ethics", href: "/ceo-channel#ethics" },
      { key: "praise", href: "/ceo-channel#praise" },
      { key: "complaint", href: "/ceo-channel#complaint" },
    ],
    accent: true,
  },
];

// Real addresses (source: evlaser.co.kr "오시는 길" page, provided by the user).
export const officeRows = [
  {
    key: "hq",
    address: "경기도 군포시 고산로 148번길 17 군포IT밸리 B동 313호 (15850)",
    phone: "+82 31 452 9860",
    email: "info@evlaser.co.kr",
  },
  {
    key: "techCenter",
    address: "경기도 군포시 농심로2 삼보 스카이비즈 706-709호 (15845)",
    phone: "+82 31 452 9860",
    email: "info@evlaser.co.kr",
  },
  {
    key: "suzhou",
    address: "1F, Building 1, Xinyi Vaogu Wisdom Industrial Park, 415 Changyang Street, Suzhou Industrial Park, Suzhou City, Jiangsu Province, China (215000)",
    phone: "+86 512 6515 8026",
    email: "info@evlaser.cn",
  },
];

export const distributorRows = [
  { country: "United States", partner: "EVL Americas Inc.", contact: "J. Carter", phone: "+1 000 000 0000" },
  { country: "Germany", partner: "EVL Europe GmbH", contact: "M. Weber", phone: "+49 000 000000" },
  { country: "China", partner: "EVL China Co., Ltd.", contact: "L. Wang", phone: "+86 000 0000 0000" },
  { country: "Japan", partner: "EVL Japan K.K.", contact: "K. Sato", phone: "+81 00 0000 0000" },
];

// Seed data for the news database (Korean only — admin-authored content is not
// machine-translated; see AdminNews for adding real, dated announcements).
export const newsItems = [
  { tag: "회사소식", title: "EV Laser, 차세대 배터리 용접 라인 공급 계약 체결", date: "2026.08.24" },
  { tag: "산업동향", title: "반도체 패키징 공정용 초정밀 마킹 기술 동향", date: "2026.08.11" },
  { tag: "전시회소식", title: "SEMICON Korea 2026 참가 및 부스 안내", date: "2026.07.29" },
  { tag: "회사소식", title: "EV Laser, 글로벌 인증(ISO) 갱신 완료", date: "2026.06.15" },
];

export const jobs = [
  // Real, currently open posting (source: Saramin, provided by the user) — full detail.
  { key: "techSales", detailed: true },
  // Ongoing/rolling openings — summary only.
  { key: "laserEngineer", detailed: false },
  { key: "overseasSales", detailed: false },
];

export const ceoCards = [
  { id: "ethics", icon: "shield" as IconName },
  { id: "praise", icon: "star" as IconName },
  { id: "complaint", icon: "alert" as IconName },
];

// Real patent titles as registered with the Korean Intellectual Property
// Office (source: evlaser.co.kr "특허&인증서" page, provided by the user).
export const patents = [
  { image: "/images/patents/patent-01.jpg", title: "레이저빔 투과율 측정장치" },
  { image: "/images/patents/patent-02.jpg", title: "다중 레이저빔을 이용한 원통형플라스틱 배관 경방향 접근 방식 동시조사 레이저 용접장치" },
  { image: "/images/patents/patent-03.jpg", title: "레이저빔 반사채널 및 다관절로봇을 이용한 레이저플라스틱 용접장치" },
  { image: "/images/patents/patent-04.jpg", title: "레이저빔 반사채널 및 스캐너를 이용한 레이저플라스틱 용접장치" },
  { image: "/images/patents/patent-05.jpg", title: "레이저빔의 반사를 이용한 플라스틱 용접시스템" },
  { image: "/images/patents/patent-06.jpg", title: "타원궤적 추종형 레이저 융착장치" },
  { image: "/images/patents/patent-07.jpg", title: "클래딩장치" },
  { image: "/images/patents/patent-08.jpg", title: "지그 착탈식 레이저 융착장치" },
  { image: "/images/patents/patent-09.jpg", title: "레이저금속코팅장치" },
  { image: "/images/patents/patent-10.jpg", title: "대용량 배터리 케이스 레이저 융착장치" },
  { image: "/images/patents/patent-11.jpg", title: "레이저 융착용 리모콘 클램핑장치" },
  { image: "/images/patents/patent-12.jpg", title: "금속표면 경도측정장치를 채용한 레이저금속 표면 열처리 시스템" },
  { image: "/images/patents/patent-13.jpg", title: "압축기용 머플러 레이저 융착장치" },
  { image: "/images/patents/patent-14.jpg", title: "자동차용 연료필터 레이저 융착장치" },
  { image: "/images/patents/patent-15.jpg", title: "레이저를 이용한 진공챔버에서의 금속표면 열처리 장치" },
  { image: "/images/patents/patent-16.jpg", title: "레이저빔 투과율 측정장치" },
  { image: "/images/patents/patent-17.jpg", title: "자동차램프 레이저 융착방법/융착장치" },
  { image: "/images/patents/patent-18.jpg", title: "크랭크샤프트 레이저 열처리 장치" },
  { image: "/images/patents/patent-19.jpg", title: "레이저 금속 코팅장치용 노즐" },
  { image: "/images/patents/patent-20.jpg", title: "플라스틱 레이저 용접장치" },
  { image: "/images/patents/patent-21.jpg", title: "레이저 필름접장치" },
  { image: "/images/patents/patent-22.jpg", title: "레이저 플라스틱 용접시스템" },
  { image: "/images/patents/patent-23.jpg", title: "플라스틱 레이저용접의 클램핑 방법" },
];

// Real certifications (source: evlaser.co.kr "특허&인증서" page). Titles keep
// the official Korean document name with an English gloss for international
// standards, since these are registered document titles, not marketing copy.
export const certifications = [
  { image: "/images/certifications/cert-01.jpg", title: "ISO 9001:2015 / KS Q ISO 9001:2015", subtitle: "품질경영시스템 인증 (Quality Management System)" },
  { image: "/images/certifications/cert-02.jpg", title: "ISO 14001:2015 / KS I ISO 14001:2015", subtitle: "환경경영시스템 인증 (Environmental Management System)" },
  { image: "/images/certifications/cert-03.jpg", title: "CE 인증 (EC Declaration of Conformity)", subtitle: "ELCR LASER / ELCR-LC" },
  { image: "/images/certifications/cert-04.jpg", title: "CE 인증 (EC Declaration of Conformity)" },
  { image: "/images/certifications/cert-05.jpg", title: "CE 인증 (Declaration of Conformity)", subtitle: "ELCR LASER / ELCR-LC" },
  { image: "/images/certifications/cert-06.jpg", title: "공장등록증명(신청)서", subtitle: "Factory Registration Certificate" },
  { image: "/images/certifications/cert-07.jpg", title: "기업부설연구소 인정서", subtitle: "In-house R&D Institute Certification" },
  { image: "/images/certifications/cert-08.jpg", title: "경영혁신형 중소기업(Main-Biz) 확인서" },
  { image: "/images/certifications/cert-09.jpg", title: "뿌리기술 전문기업 지정증" },
  { image: "/images/certifications/cert-10.jpg", title: "CE 인증 (EC Declaration of Conformity)" },
  { image: "/images/certifications/cert-11.jpg", title: "소재·부품전문기업확인서" },
  { image: "/images/certifications/cert-12.jpg", title: "기술혁신형 중소기업(Inno-Biz) 확인서" },
  { image: "/images/certifications/cert-13.jpg", title: "벤처기업확인서" },
];

export const showcaseSlides = [
  { key: "s1", icon: "weld" as IconName, from: "#0B4DA2", to: "#062C63" },
  { key: "s2", icon: "cut" as IconName, from: "#E4002B", to: "#7A0016" },
  { key: "s3", icon: "semi" as IconName, from: "#0B4DA2", to: "#12213B" },
  { key: "s4", icon: "clad" as IconName, from: "#062C63", to: "#0B4DA2" },
  { key: "s5", icon: "print3d" as IconName, from: "#3A3F47", to: "#12151A" },
];

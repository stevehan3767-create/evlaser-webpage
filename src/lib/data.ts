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

export const officeRows = [
  { country: "Korea (HQ)", partnerKey: "hq", contactKey: "salesSupport", phone: "+82 31 452 9860" },
  { country: "Korea (Laser Tech Center)", partnerKey: "techCenter", contactKey: "techSupport", phone: "+82 31 452 9860" },
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
  { key: "laserEngineer" },
  { key: "overseasSales" },
];

export const ceoCards = [
  { id: "ethics", icon: "shield" as IconName },
  { id: "praise", icon: "star" as IconName },
  { id: "complaint", icon: "alert" as IconName },
];

export const showcaseSlides = [
  { key: "s1", icon: "weld" as IconName, from: "#0B4DA2", to: "#062C63" },
  { key: "s2", icon: "cut" as IconName, from: "#E4002B", to: "#7A0016" },
  { key: "s3", icon: "semi" as IconName, from: "#0B4DA2", to: "#12213B" },
  { key: "s4", icon: "clad" as IconName, from: "#062C63", to: "#0B4DA2" },
  { key: "s5", icon: "print3d" as IconName, from: "#3A3F47", to: "#12151A" },
];

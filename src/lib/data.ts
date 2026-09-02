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

// Korean labels for techItems, used only in the admin UI (which has no
// next-intl context — it lives outside the [locale] segment). The public
// site uses the translated `tech.<key>` messages instead.
export const techLabelsKo: Record<string, string> = {
  plasticWelding: "플라스틱 용접",
  metalWelding: "금속·알루미늄·동 용접",
  glassWelding: "유리 용접",
  cutting: "레이저 절단",
  marking: "레이저마킹(조각·인쇄)",
  etching: "레이저에칭(각인)",
  cleaning: "레이저 클리닝(세정)",
  precisionMachining: "레이저정밀(미세)가공",
  drilling: "레이저드릴링",
  heatTreatment: "레이저열처리(가열)",
  cladding: "레이저클래딩(코팅)",
  print3d: "3D프린팅",
  medical: "의료기기",
  safety: "레이저안전",
  other: "기타",
};

export interface OrgUnit {
  icon: IconName;
  key: string;
}

// Department breakdown provided by the user; role descriptions authored
// editorially (see messages `company.organization` namespace).
export const orgChart: OrgUnit[] = [
  { icon: "briefcase", key: "management" },
  { icon: "handshake", key: "domesticSales" },
  { icon: "globe", key: "overseasSales" },
  { icon: "build", key: "manufacturing" },
  { icon: "measure", key: "rnd" },
];

// Each of the 15 tech items links to its own detail page
// (/products/tech/[key]), admin-editable (title/long-form description +
// application-case cards) via /admin/tech-pages. These seeds carry the real,
// user-provided content (source: evlaser.co.kr "사업소개 > 주요공법" pages)
// for the 8 items already documented; the DB starts empty otherwise and the
// admin fills in the rest.
export const techPageSeeds: { key: string; title: string; description: string }[] = [
  {
    "key": "plasticWelding",
    "title": "레이저 플라스틱 용접 (Laser Plastics Welding)",
    "description": "레이저를 이용한 플라스틱 용접의 기본원리는, 레이저빔이 투과하는 광학적 특성을 가지는 상부층(Upper Layer) 모재와 레이저빔을 흡수하는 특성을 가진 하부층(Lower Layer) 모재가 위아래로 겹쳐지도록 배열하고, 여기에 레이저 빔을 위에서 조사하면 상부층을 투과한 레이저빔이 하부층의 계면에 도달하여 하부모재의 표면온도를 상승시키게 되고 이 과정에서 발생된 열이 상부층으로 전이되어 두 개의 모재가 용융되어 접합되는 것으로 요약할 수 있다.\n\n일반적으로 플라스틱의 접합을 위한 대표적인 공법으로는, 접착제를 이용한 방법과 초음파 및 진동의 마찰열을 이용한 방법, 열판을 이용한 방법 및 나사(Screw)를 체결하는 방법 등이 사용되어져 왔다.\n\n그러나 이들은 저마다의 장점이 있음에도 불구하고 외관품질문제, 수밀문제, 버 및 보푸라기 발생, 생산원가상승, 제품 디자인제약 및 작업환경문제, 낮은 생산성 등의 단점으로 인하여 대체공법에 대한 요구가 있어왔다.\n\n레이저를 이용한 플라스틱의 용접기술은, 위에서 언급한 기존의 플라스틱 접합공법에 비하여 여러 장점을 가지고 있으며 특히 수밀(리크)불량, 외관품질문제, 버 및 보푸라기로 인한 문제 등을 해결하고 높은 접합 강도를 달성할 수 있으며 설치공간의 제약이 적다는 특징이 있다. 또한, 사출공정에서의 사출변형 및 근본적인 문제점을 최소화하고 양산공정에서의 안정적인 품질 확보를 위해서는 제품의 디자인 단계에서부터 전문가의 도움을 받아 여러 기술적인 요인들을 충분히 검토하고 고려하여야 신기술 적용의 시행착오를 최소화할 수 있는 것으로 알려져 있다.\n\n[기술특징]\n- 비접촉식, 버(Burr) 및 보푸라기 발생 없음\n- 매우 우수한 용접 품질로 외관 불량 해결\n- 높은 작업 안정성 및 유연성 확보\n- 균일한 열 에너지 투입으로 기계적 스트레스 최소화\n- 2D/3D 형상 제품 적용 가능\n\n[적용분야]\n- 자동차 정밀 센서 부품\n- 자동차 액츄에이터 부품\n- 자동차 램프, 카메라 모듈 등 전장 부품\n\n[주요 변수]\n레이저 빔의 파장 및 특성, 레이저의 출력, 광학적인 특성, 소재의 투과율, 소재의 두께 및 색상, 이송장치·가압장치 및 품질관리 장치"
  },
  {
    "key": "etching",
    "title": "레이저 에칭 (Laser Etching)",
    "description": "레이저 에칭(Laser Etching)은 다양한 조각과 얕은 각인을 포괄하는 광범위한 용어입니다. 자동차 부품, 의료기기, 와인통, 마이크로 전자 부품, 묘비 등 다양한 제품과 거의 모든 재료에 적용이 가능합니다. 일반적으로 레이저 에칭은 단순히 표면 색상 또는 질감이 변하게 하는 것이 아니라 부품의 표면조도를 변화시킨다는 측면에서 마킹과 구분됩니다.\n\n레이저 에칭의 주요 용도는 다양한 재료에 미세한 패턴, 디자인, 텍스트, 이미지 등을 생성하는 것이며, 이 기술은 정밀성, 속도, 다재다능성으로 인해 여러 산업 분야에서 널리 사용됩니다.\n\n[기술특징]\n- 재료 다양성: 플라스틱, 금속, 유리, 세라믹 등 거의 모든 유형의 재료에 적용 가능\n- 정밀성: 레이저 빔을 사용하여 정밀한 패턴 생성 가능\n- 비접촉·비마모 가공\n\n[적용분야]\n- 자동차 부품, 의료기기, 마이크로 전자\n- 전자 기기와 같은 정밀 부품 제조\n- 금속, 플라스틱 각종 부품\n\n[주요 변수]\n레이저 파장, 출력, 조사 속도, 반복률, 스캔 패턴, 초점 위치"
  },
  {
    "key": "cleaning",
    "title": "레이저 클리닝 (Laser Cleaning)",
    "description": "레이저 클리닝(Laser Cleaning)은 고에너지 레이저 빔을 사용하여 표면의 오염 물질을 제거하는 비접촉 방식입니다.\n\n전달된 열은 재료를 녹여 용융 풀을 형성하고, 이후 대상 부위를 냉각하고 융합합니다. 이 기술은 다양한 산업에서 기존의 화학적 및 기계적 세척 방법에 비해 환경 친화적이고 정밀한 대안으로 주목받고 있습니다.\n\n[기술특징]\n- 열에 의한 오염물 제거: 표면 오염층을 급속히 가열해 기화시키거나 기체 압력과 충격파로 오염물 박리\n- 비접촉·비마모 가공: 기판 손상없이 오염물만 선택적 제거\n- 환경 친화적, 환경 오염 無, 폐기물 無\n\n[적용분야]\n- 항공우주 및 자동차 산업: 부품 세정, 페인트 제거, 유지보수\n- 금속 표면 청소: 녹, 산화물, 오일 제거\n- 문화 유산 보존: 섬세한 복원 작업\n- 제조 산업: 용접 및 코팅 전 표면 준비\n\n[주요 변수]\n펄스폭, 에너지 밀도, 스캔 속도, 조사 시간, 파장(보통 Fiber 1064nm)"
  },
  {
    "key": "cutting",
    "title": "레이저 플라스틱 커팅 (Laser Plastic Cutting)",
    "description": "레이저 플라스틱 커팅(Laser Plastic Cutting)은 고에너지 레이저 빔을 사용하여 플라스틱을 정밀하게 절단하는 기술입니다. 열을 이용한 비접촉 절단으로 변형을 최소화하며, 정밀한 가공이 가능합니다. 빠른 절단 속도와 높은 생산성으로 산업 전반에 다양하게 활용되고 있습니다. 다양한 플라스틱 재료에 적용 가능하며, 특히 복잡한 모양과 정밀한 디자인이 필요한 경우 유용합니다.\n\n[기술특징]\n- 고속 작업: 기계식 절단보다 훨씬 빠른 가공 속도로 생산성 향상 가능\n- 재료 다양성: 다양한 플라스틱(아크릴, 폴리카보네이트, 폴리에틸렌 등)에 광범위하게 적용 가능\n- 비접촉 가공: 물리적 접촉없이 가공되어 소재 손상 최소화\n\n[적용분야]\n- 디스플레이 부품, 의료기기용 정밀 부품\n- 아크릴·필름·플라스틱 부품 가공\n- 커팅, 완구·조명 부품 등 플라스틱 제품\n\n[주요 변수]\n출력, 조사 속도, 초점 직경, 가공 속도, 파장(CO₂ 10.6μm 등)"
  },
  {
    "key": "marking",
    "title": "레이저 마킹 (Laser Marking)",
    "description": "레이저 마킹(Laser Marking)은 레이저 광을 사용하여 재료의 표면을 변경하여 로고, 제품명, 시리얼 번호 등을 새기는 기술입니다. 표면을 변형하거나 카본화하여 선명하고 내구성 높은 마킹을 구현할 수 있습니다. 잉크나 화학 물질 없이 다양한 재질에 적용할 수 있어 친환경적입니다. 다양한 재료에 적용 가능하며, 특히 정밀하고 지속성이 높은 마킹이 필요한 산업에서 많이 사용됩니다.\n\n[기술특징]\n- 고정도 마킹: 정확한 위치에 정밀한 패턴 또는 문자 인쇄 가능\n- 반영구적: 지워지지 않고 내구성이 뛰어나 장기적 사용에 적합\n- 다양한 재료 적용 가능: 금속, 플라스틱, 목재 등 다양한 소재에 적용\n- 고속 처리: 빠른 마킹 속도로 생산 효율 극대화\n\n[적용분야]\n- 자동차 부품 가공(일련번호 마킹)\n- 전자부품 식별 코드 마킹\n- 의료기기 로고 인쇄\n- 산업용 부품, 소비재 등 제품 식별 마킹\n\n[주요 변수]\n파장(Fiber/CO₂/UV), 조사 시간, 빔 직경, 조사 속도, 초점 위치"
  },
  {
    "key": "heatTreatment",
    "title": "레이저 열처리 (Laser Heat Treatment)",
    "description": "레이저 열처리(Laser Heat Treatment)는 고에너지 레이저 빔을 사용하여 재료의 표면을 국부적으로 가열하여 경도를 높이고 내마모성을 향상시키는 기술입니다. 빠른 가열 및 냉각이 가능하여 변형을 최소화하며, 정밀한 부위별 열처리가 가능합니다. 다양한 산업에서 재료의 물리적 및 화학적 특성을 향상시키기 위해 사용됩니다.\n\n[기술특징]\n- 정밀 열처리: 국부적으로 고에너지를 집중해 미세한 영역만 정밀한 열처리 가능\n- 고밀도 에너지: 표면을 빠르게 가열, 미세구조 제어 가능\n- 재료 성능 향상: 경도, 인성, 피로강도 등 기계적 특성 개선, 내구성 강화\n\n[적용분야]\n- 자동차 산업, 부품 가공\n- 항공우주산업, 고강도 강재 및 엔진 부품 내구성 향상\n- 금속 가공, 절삭 공구·베어링·금형 내마모성 강화\n- 전자 및 전기 산업, 전자 부품의 표면 처리 및 개선에 사용\n\n[주요 변수]\n출력, 이송 속도, 빔 크기, 조사 시간, 냉각 속도"
  },
  {
    "key": "cladding",
    "title": "레이저 클래딩 (Laser Cladding)",
    "description": "레이저 클래딩(Laser Cladding)은 레이저 빔을 사용하여 금속 분말이나 와이어를 모재 표면에 용융시켜 코팅하는 방법입니다. 균일한 코팅층을 형성해 기존 소재보다 강한 특성을 부여해 부품 수명을 연장하는 데 효과적입니다. 이 기술은 내마모성, 내식성, 내열성 등을 향상시켜 다양한 산업에서 널리 사용됩니다.\n\n[기술특징]\n- 집중 가열 및 급속 냉각: 집중된 열을 사용하여 재료를 용융시키고, 급속 냉각을 통해 강한 금속 결합과 미세조직 형성\n- 열 영향 최소화: 공작물의 변형 및 손상 감소\n- 고품질 코팅: 높은 접착력과 균일한 코팅, 왜곡 및 희석율이 낮음\n- 고속 고정밀 코팅\n- 복잡 형상에도 적용 가능\n\n[적용분야]\n- 자동차 산업, 부품 가공\n- 항공우주산업, 고강도 부품 가공\n- 석유·해양 장비, 고하중 기계 부품, 발전 설비 가공\n- 고성능 산업용 금속, 금형 코팅·보수·수명 연장\n\n[주요 변수]\n분말 공급 속도, 레이저 출력, 트랙간 간격, 스캔 경로, 냉각 속도"
  },
  {
    "key": "safety",
    "title": "레이저 안전 (Laser Safety)",
    "description": "레이저 안전은 단순한 규제 요건이 아닌 책임입니다.\n\n이브이레이저는 국제 표준을 준수하고 최첨단 안전 조치를 구현하며, 인식을 고취함으로써, 안전을 기반으로 한 혁신과 성장을 만들어 가고 있습니다.\n\n[레이저 안전이란]\n레이저 안전은 레이저 사용과 관련된 위험을 완화하도록 설계된 관행, 표준 및 기술을 포함합니다.\n- 레이저 분류 이해: 다양한 레이저 유형은 무해한 1등급 장치에서부터 잘못 취급 시 심각한 부상을 입을 수 있는 고출력 4등급 레이저까지 다양한 수준의 위험을 초래합니다.\n- 보호 장비: 인증된 안전 안경, 장벽, 연동 장치를 사용하여 노출을 방지합니다.\n- 교육 및 인식: 안전한 작업을 보장하기 위해 잠재적인 위험과 모범 사례에 대해 사용자를 교육합니다.\n- 규정 준수: 글로벌 안전 표준을 준수하여 최고 수준의 보호 기능을 유지합니다.\n\n[레이저 안전이 중요한 이유]\n레이저는 매우 유용하지만 산업 및 의료 분야에서 사용되는 것과 같은 고출력 레이저는 안전하게 취급하지 않으면 눈 부상, 피부 화상 또는 화재 위험과 같은 위험을 초래할 수 있습니다. 기업은 사전 조치를 취함으로써 사고를 예방하고, 책임을 줄이고, 생산성을 향상시킬 수 있습니다.\n\n이브이레이저는 모든 레이저 설비에서 안전 표준을 준수하는 데 전념하며, 지속적인 연구 개발을 통해 고객에게 안전하고 신뢰할 수 있는 레이저 솔루션을 제공하는 것을 목표로 합니다.\n\n이브이레이저의 레이저 안전 솔루션을 통해 최고의 안전 기준을 확인하실 수 있습니다. 올바른 예방 조치와 기술을 사용하면 레이저는 산업 성장을 이끄는 안전하고 효과적인 도구가 됩니다."
  }
];


export interface NavItem {
  key: string;
  href: string;
}

export const companyNav: NavItem[] = [
  { key: "overview", href: "/company" },
  { key: "history", href: "/company#history" },
  { key: "organization", href: "/company#organization" },
  { key: "business", href: "/company#business" },
  { key: "patents", href: "/company#patents" },
  { key: "directions", href: "/global#offices" },
];

export const productsNav: NavItem[] = [
  { key: "lineup", href: "/products#lineup" },
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
    address: "Room 106, Zone C, Building 2, Dongshahu Fund Town, No. 345 Fengli Street, Industrial Park, Suzhou City, Jiangsu Province, China (215127)",
    phone: "+86 512 6515 8026",
    email: "info@evlaser.cn",
  },
];

// Real social links (source: evlaser.co.kr footer, provided by the user).
export const socialLinks = [
  { key: "facebook", url: "https://www.facebook.com/evlaser.co.kr" },
  { key: "instagram", url: "https://www.instagram.com/evlaser.co.kr/" },
  { key: "naverBlog", url: "https://blog.naver.com/evlaser" },
  { key: "youtube", url: "https://www.youtube.com/@evlaser.official" },
];

// Real product series (source: evlaser.co.kr homepage, provided by the user).
// Detailed specs/photos live on the real product pages, linked directly since
// they aren't available to reproduce here.
export const productLineup = [
  { name: "ELPW-TS Series", url: "https://evlaser.co.kr/product/view.php?idx=4" },
  { name: "ELPW-LS Series", url: "https://evlaser.co.kr/product/view.php?idx=5" },
  { name: "ELPW-LM Series", url: "https://evlaser.co.kr/product/view.php?idx=6" },
  { name: "ELPW-TM Series", url: "https://evlaser.co.kr/product/view.php?idx=7" },
  { name: "ELPW-CO Series", url: "https://evlaser.co.kr/product/view.php?idx=8" },
  { name: "ELPW-IS Series", url: "https://evlaser.co.kr/product/view.php?idx=9" },
  { name: "ELPW-MS Series", url: "https://evlaser.co.kr/product/view.php?idx=10" },
  { name: "ELPW-SS2 Series", url: "https://evlaser.co.kr/product/view.php?idx=11" },
  { name: "ELPW-SS1 Series", url: "https://evlaser.co.kr/product/view.php?idx=12" },
  { name: "ELPW-ES Series", url: "https://evlaser.co.kr/product/view.php?idx=13" },
  { name: "ELCR-D Series", url: "https://evlaser.co.kr/product/view.php?idx=15" },
  { name: "Laser Safety Solution", url: "https://evlaser.co.kr/product/view.php?idx=16" },
];

// No real distributor/partner list has been provided yet. Left empty rather
// than fabricated — GlobalNetwork renders an honest empty state instead of a
// table when this is empty. Populate with real partners once confirmed.
export const distributorRows: { country: string; partner: string; contact: string; phone: string }[] = [];

// Seed data for the news database (Korean only — admin-authored content is not
// machine-translated; see AdminNews for adding real, dated announcements).
// Left empty — no real, dated announcements have been provided yet. The news
// page shows an honest empty state until real items are added via /admin/news.
// Real news history (source: evlaser.co.kr homepage news feed, provided by
// the user). Text lightly cleaned of run-on spacing/HTML entities from the
// source markup; facts and dates kept as published.
export const newsItems: { tag: string; title: string; date: string; body: string }[] = [
  {
    tag: "회사소식",
    title: "이브이레이저, 경영혁신형 중소기업 '메인비즈' 선정",
    date: "2024.11.12",
    body: "이브이레이저는 중소벤처기업부로부터 경영혁신형 중소기업 인증을 획득했습니다. 메인비즈란 Management(경영), Innovation(혁신), Business(기업)의 합성어로서 중소기업 기술혁신 촉진법에 의거해 경영혁신 활동을 수행하고 마케팅, 조직관리, 생산성 향상 분야에 탁월한 경영 성과를 나타낸 기업을 중소벤처기업부가 평가하고 인증한 기업을 말합니다. 이는 국제협력기구(OECD) 기업혁신 지침인 '오슬로 매뉴얼'에 근거해 정부가 인프라, 활동, 성과 등 다양한 평가 기준 아래 우수한 중소기업을 선정하는 국가적 인증이기도 합니다. 이브이레이저는 2002년 창립 이후로 레이저 전문 기업으로 다양한 기술 인증과 총 24건의 특허 등록과 특허 출원을 하였습니다. 거의 모든 산업분야에 응용되는 레이저를 이용한 폭넓고 혁신적인 기술들을 개발하여 국내는 물론 유럽, 남미, 중국, 동남아 등 전 세계의 수많은 협력사들과 교류하면서 함께 성장해 왔습니다. ㈜이브이레이저의 전 임직원은 현재의 환경에 머무르고 만족하기보다는 \"더 좋은 레이저기술로 더 좋은 세상을 만들어간다\"는 목표로 더욱 노력할 것입니다. 감사합니다.",
  },
  {
    tag: "회사소식",
    title: "'유로비젼레이저' → '이브이레이저' 사명 변경 안내",
    date: "2021.06.18",
    body: "안녕하십니까 (주)이브이레이저입니다. 작년 8월 28일 이후 기존 \"유로비젼레이저\"에서 새로운 \"이브이레이저\"로 사명을 변경하게 되었습니다. 단순 상호 변경으로 기존 구성 및 연락 채널은 동일하오니 참고 부탁드리겠습니다. 감사합니다.",
  },
  {
    tag: "회사소식",
    title: "경기지방중소벤처기업 표창 시상",
    date: "2021.06.18",
    body: "안녕하세요 (주)이브이레이저입니다. 지난 12월 13일 경기지방중소벤처기업청장 주관으로 시행된 모범기업 표창에 저희 \"이브이레이저\"가 모범기업으로 선정되어 경기지방중소벤처기업청장 표창을 받게 되었습니다.",
  },
  {
    tag: "회사소식",
    title: "광융합신기술 광주시장 표창",
    date: "2021.06.18",
    body: "안녕하세요 (주)이브이레이저입니다. 지난 11월 20일 광주에서 개최된 광기술산업 로드쇼에 참가 및 광주광역시장 표창에 선정되었습니다. 이후 따로 개최된 기술확산 교류회를 통하여 \"레이저 플라스틱 접합 기술\"에 대한 대표님 세미나 자리가 있었습니다.",
  },
  {
    tag: "회사소식",
    title: "신기술개발 우수업체 정부시상",
    date: "2021.06.18",
    body: "안녕하세요 (주)이브이레이저입니다. 지난 6월 26일 산업통상자원부에서 실시한 \"광, LED, OLED, 레이저 산업 신기술 개발 우수업체\"에서 \"레이저 플라스틱 접합기술\"으로 우수한 성적을 거두어 산업통상자원부장관 수상을 받았습니다. 대표님 일정이 바쁘신 관계로 이광재 이사님께서 대신 수상을 하였습니다.",
  },
  {
    tag: "회사소식",
    title: "2015년 10월 8일 경기도 유망중소기업 인증",
    date: "2021.06.18",
    body: "안녕하세요. (주)유로비젼레이저가 2015년 10월 8일 경기도 유망중소기업 인증을 수상하였습니다. 더욱더 발전하고 노력하는 유로비젼레이저가 되겠습니다. 유로비젼레이저 임직원일동",
  },
  {
    tag: "회사소식",
    title: "한국해양대-유로비젼레이저, 산학협력 및 기증식",
    date: "2021.06.18",
    body: "한국해양대학교 해사산업연구소(소장 이상태)는 28일 오전 11시 해사대학 2층 회의실에서 ㈜유로비젼레이저(대표이사 한상배)와 산학협력 업무 협약식 및 교육실습용 레이저 마킹 시스템 기증식을 가졌다. 이 날 ㈜유로비젼레이저는 한국해양대 레이저응용기술지원센터(센터장 김종도) 레이저정밀가공실험실에서 학생들 교육용으로 사용될 5천만 원 상당의 '레이저 마킹 시스템'을 기증했으며, 해사대학 및 해사산업연구소와의 산학협력을 강화하기로 했다. 해사대학 이은방 학장은 \"해양·해사분야에서 첨단 레이저 기술의 중요성은 이미 세계가 주목하고 있으며 우리 대학이 리드로서의 큰 역할을 수행해야 할 것\"이라고 당부했다. 해사산업연구소 이상태 소장은 \"우리나라 제조업의 뿌리산업인 레이저 용접기술 및 표면처리 자동화 설비의 개발과 국산화에 전념하고 있는 한상배 대표님과 인연을 맺게 돼 기쁘다\"며 \"값진 기증에 깊이 감사드리며, 활발한 산학협력을 통해 관련 산업 발전에도 함께 기여하기를 바란다\"고 말했다. 김종도 레이저응용기술지원센터장은 \"이 레이저 마킹시스템은 20W Fiber Laser Marking System으로, 정밀가공부품의 시리얼넘버 등을 각인하는 등 그 용도는 매우 다양하다\"며 \"기존에 설치돼 있는 kW급 고출력레이저와 연계해 학부 및 대학원 학생의 교육과 실습 및 연구에 폭넓게 활용될 예정\"이라고 큰 기대감을 나타냈다. 한편 ㈜유로비젼레이저는 2002년 4월 레이저전문 벤처 기업으로 설립돼 레이저를 이용한 플라스틱의 용접, 레이저열처리, 레이저클래딩 그리고 레이저 솔더링 등의 매크로기술에서부터 반도체, 전자, 의료산업에서 요구되는 초정밀가공을 위한 마이크로, 나노가공기술의 개발에 이르기까지 많은 분야에서 기술력을 인정받고 있다.",
  },
  {
    tag: "회사소식",
    title: "2015년 5월 26일 ELCR Laser CE인증!",
    date: "2021.06.18",
    body: "안녕하세요 (주)유로비젼레이저입니다. 2015년 5월 26일 ELCR Laser CE인증을 받았습니다! 더욱더 발전하고 노력하는 유로비젼레이저가 되겠습니다. 유로비젼레이저 임직원일동",
  },
  {
    tag: "회사소식",
    title: "유로비젼레이저 대표 중소기업청장 표창을 수상하였습니다",
    date: "2021.06.18",
    body: "안녕하세요. (주)유로비젼레이저의 한상배 대표님이 2012년 12월 10일 벤처기업의 경영 및 생산성향상을 통하여 국가산업 발전에 기여한 공로를 인정받아 2014년 12월 12일 중소기업청장상 표창을 수상하였습니다. 더욱더 발전하고 노력하는 유로비젼레이저가 되겠습니다. 유로비젼레이저 임직원일동",
  },
  {
    tag: "회사소식",
    title: "미국레이저협회(LIA)에서 실시하는 레이저안전교육 수료",
    date: "2021.06.18",
    body: "2015년 10월 공지사항을 이제야 올립니다. (주)유로비젼레이저의 한상배 대표님이 2014년 10월 20일에서 25일까지 미국 San Diego에서 개최된 2014 ICALEO학회행사를 참가하였으며, 이 기간동안 미국레이저협회(Laser Institute of America)에서 공식적으로 주관하는 5일간(10/20~25일)의 \"Laser Safety Officer Training Course\"를 수료함으로써 레이저안전에 대한 전문교육을 마쳤습니다. 레이저안전에 관심이 있는 전세계의 레이저안전전문가들과 함께 많은 정보를 공유하고 레이저안전에 대한 전문적인 교육을 이수함으로써, 레이저안전 전문가로서 국내에서의 \"레이저안전\"에 대한 인식을 개선하고 레이저를 안전하게 사용하기위한 다양한 활동을 하게될것으로 기대됩니다. (주)유로비젼레이저",
  },
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

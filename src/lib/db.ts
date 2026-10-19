import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { techPageSeeds, specOptionDefaults, specOptionLegacyDefaults } from "./data";
import tidingsPosts from "./tidings-data.json";
import exhibitionPosts from "./exhibition-data.json";
import mainnewsPosts from "./mainnews-data.json";
import supportInquirySeed from "./support-inquiries-data.json";
import newsPlaceholderImages from "./news-placeholder-images.json";
import eventDates from "./event-dates.json";
import partnerLogos from "./partner-logos.json";

let sqlClient: NeonQueryFunction<false, false> | undefined;

function getSqlClient(): NeonQueryFunction<false, false> {
  if (!sqlClient) {
    const connectionString =
      process.env.DATABASE_URL ??
      process.env.POSTGRES_URL ??
      process.env.DATABASE_URL_UNPOOLED ??
      process.env.POSTGRES_URL_NON_POOLING;

    if (!connectionString) {
      throw new Error(
        "No Postgres connection string found. Set DATABASE_URL (or POSTGRES_URL) — " +
          "in Vercel, add a Postgres/Neon database under Project Settings > Storage."
      );
    }
    sqlClient = neon(connectionString);
  }
  return sqlClient;
}

// Lazily resolves the connection on first query, so pages/builds that never
// touch the database don't require DATABASE_URL to be set.
export const sql: NeonQueryFunction<false, false> = ((...args: Parameters<NeonQueryFunction<false, false>>) =>
  getSqlClient()(...args)) as NeonQueryFunction<false, false>;

declare global {
  var __evlaserSchemaReady: Promise<void> | undefined;
}

function createSchema(): Promise<void> {
  return (async () => {
    // Home page hero carousel slides (max 5, enforced in the admin action).
    await sql`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id TEXT PRIMARY KEY,
        image_url TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY,
        channel TEXT NOT NULL,
        name TEXT NOT NULL,
        company TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        industry TEXT,
        message TEXT NOT NULL,
        email_sent BOOLEAN NOT NULL DEFAULT false,
        email_error TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    // 메일 발송이 실패한 이유(설정 누락 vs 인증/연결 오류 등)를 관리자가
    // Vercel 로그 없이도 /admin/inquiries에서 바로 확인할 수 있도록 저장.
    await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS email_error TEXT`;

    await sql`
      CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    // 동영상자료실 등 자료 카드의 미리보기 썸네일(선택).
    await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS thumbnail_url TEXT`;

    await sql`
      CREATE TABLE IF NOT EXISTS news_items (
        id TEXT PRIMARY KEY,
        tag TEXT NOT NULL,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        body TEXT NOT NULL DEFAULT '',
        published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    // 언론·연구활동(Newsroom): 기사/방송/논문·학회 자료.
    // category: media(언론보도) | broadcast(방송) | paper(논문·학회)
    await sql`
      CREATE TABLE IF NOT EXISTS press_items (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL DEFAULT 'media',
        title TEXT NOT NULL,
        source TEXT,
        date TEXT,
        body TEXT NOT NULL DEFAULT '',
        link_url TEXT,
        pdf_url TEXT,
        pdf_name TEXT,
        thumbnail_url TEXT,
        published BOOLEAN NOT NULL DEFAULT true,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    // 구 홈페이지 게시판 이관용: 작성자/조회수/원글번호(공지 포함) 보존.
    await sql`ALTER TABLE news_items ADD COLUMN IF NOT EXISTS author TEXT`;
    await sql`ALTER TABLE news_items ADD COLUMN IF NOT EXISTS views INT`;
    await sql`ALTER TABLE news_items ADD COLUMN IF NOT EXISTS post_no TEXT`;

    // 뉴스 게시글에 첨부하는 사진(전시회 품목 사진 등). caption=제목, content=부가설명.
    await sql`
      CREATE TABLE IF NOT EXISTS news_images (
        id TEXT PRIMARY KEY,
        news_id TEXT NOT NULL,
        url TEXT NOT NULL,
        caption TEXT,
        content TEXT,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS news_images_news_idx ON news_images (news_id)`;

    // 언론·연구활동(press) 게시글 사진(행사사진 등). caption=제목, content=부가설명.
    await sql`
      CREATE TABLE IF NOT EXISTS press_images (
        id TEXT PRIMARY KEY,
        press_id TEXT NOT NULL,
        url TEXT NOT NULL,
        caption TEXT,
        content TEXT,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS press_images_press_idx ON press_images (press_id)`;

    // Admin-managed FAQ entries, shown on /support alongside the fixed
    // (translated) FAQ items already built into the page.
    await sql`
      CREATE TABLE IF NOT EXISTS faqs (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS offices (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        map_provider TEXT NOT NULL DEFAULT 'naver',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    // 국내 지사(본사/레이저기술센터)는 네이버지도, 해외 법인은 구글지도로
    // "찾아오시는 길" 링크를 연결하기 위한 지도 제공자 선택.
    await sql`ALTER TABLE offices ADD COLUMN IF NOT EXISTS map_provider TEXT NOT NULL DEFAULT 'naver'`;
    // 네이버 지도를 확대/축소 가능한 임베드 지도로 보여주려면 좌표가 필요
    // (네이버는 주소만으로 임베드가 되지 않음). 관리자가 선택적으로 입력.
    await sql`ALTER TABLE offices ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION`;
    await sql`ALTER TABLE offices ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION`;

    await sql`
      CREATE TABLE IF NOT EXISTS distributors (
        id TEXT PRIMARY KEY,
        country TEXT NOT NULL,
        partner TEXT NOT NULL,
        contact TEXT,
        phone TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    // Small admin-configurable key/value settings store (e.g. the recipient
    // email for job applications).
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;

    // Job applications submitted via the careers "지원하기" form. Only
    // metadata is stored here — attached files are forwarded as email
    // attachments only, never persisted.
    await sql`
      CREATE TABLE IF NOT EXISTS job_applications (
        id TEXT PRIMARY KEY,
        job_title TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT,
        file_names TEXT,
        email_sent BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    // Generic article storage shared by every /products/[group]/[key] section
    // (lineup/tech/industry/material): title + long-form description
    // (features/spec table authored as text), plus 적용사례 photos/videos below.
    await sql`
      CREATE TABLE IF NOT EXISTS content_pages (
        group_key TEXT NOT NULL,
        item_key TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        image_url TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (group_key, item_key)
      )
    `;
    // content_pages existed before these columns were added; make sure
    // older deployments pick them up too.
    await sql`ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS image_url TEXT`;
    // 사양서(카탈로그) 첨부파일 — 설비 라인업 등 각 항목에 PDF/이미지 등을 올려
    // 상세페이지에서 다운로드할 수 있게 한다. URL과 원본 파일명을 함께 저장.
    await sql`ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS spec_file_url TEXT`;
    await sql`ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS spec_file_name TEXT`;
    // 표준 사양서 자동 생성용 필드 — 자체 설비/해외 OEM 모두 동일하게 입력.
    // spec_table: "항목 | 값" 형식의 여러 줄. oem_source: OEM 원문 링크/출처.
    await sql`ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS name_en TEXT`;
    await sql`ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS model TEXT`;
    await sql`ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS is_oem BOOLEAN NOT NULL DEFAULT false`;
    await sql`ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS oem_source TEXT`;
    await sql`ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS spec_table TEXT`;
    // 옵션(Options): 관리자가 등록한 옵션 목록에서 선택한 값들을 쉼표로 이어 저장.
    await sql`ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS options TEXT`;

    // 적용사례 photos (max 5, enforced in the admin action).
    await sql`
      CREATE TABLE IF NOT EXISTS content_images (
        id TEXT PRIMARY KEY,
        group_key TEXT NOT NULL,
        item_key TEXT NOT NULL,
        url TEXT NOT NULL,
        caption TEXT,
        content TEXT,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`ALTER TABLE content_images ADD COLUMN IF NOT EXISTS content TEXT`;

    // 적용사례 videos (max 5, enforced in the admin action).
    await sql`
      CREATE TABLE IF NOT EXISTS content_videos (
        id TEXT PRIMARY KEY,
        group_key TEXT NOT NULL,
        item_key TEXT NOT NULL,
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        caption TEXT,
        content TEXT,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`ALTER TABLE content_videos ADD COLUMN IF NOT EXISTS content TEXT`;

    // Admin-managed item list for each /products/[group] group (설비 라인업 /
    // 기술종류별 / 산업분야별 / 재료별) — lets the admin add or remove items,
    // not just edit an existing one's content. Seeded once per group from
    // the built-in defaults in data.ts; after that the DB is authoritative.
    await sql`
      CREATE TABLE IF NOT EXISTS content_items (
        id TEXT PRIMARY KEY,
        group_key TEXT NOT NULL,
        item_key TEXT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (group_key, item_key)
      )
    `;

    // Generic many-to-many link between any two content_items rows — e.g.
    // which 기술/산업/재료 categories a given 설비 라인업 item belongs to, or
    // which 기술 a given 재료 can be processed with. (from_group, from_key) is
    // the item being edited; (to_group, to_key) is what it's linked to.
    await sql`
      CREATE TABLE IF NOT EXISTS content_item_links (
        from_group TEXT NOT NULL,
        from_key TEXT NOT NULL,
        to_group TEXT NOT NULL,
        to_key TEXT NOT NULL,
        PRIMARY KEY (from_group, from_key, to_group, to_key)
      )
    `;

    // Main-page "주요 고객사" logo strip.
    await sql`
      CREATE TABLE IF NOT EXISTS client_logos (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        logo_url TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    // 고객지원 문의접수 공개 게시판(관리자 관리). 구 홈페이지 문의접수 목록을
    // 이관해 보관하고, 신규 문의 접수 시 자동으로 한 줄 추가된다. 본문은 비공개.
    await sql`
      CREATE TABLE IF NOT EXISTS support_posts (
        id TEXT PRIMARY KEY,
        post_no TEXT,
        title TEXT NOT NULL,
        author TEXT,
        posted_on TEXT,
        status TEXT NOT NULL DEFAULT 'answered',
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    // 특허 목록. 등록날짜(registered_on) 기준으로 정렬해 노출한다. 등록일이
    // 아직 입력되지 않은 항목은 뒤로 밀리며 sort_order로 보조 정렬한다.
    await sql`
      CREATE TABLE IF NOT EXISTS patents (
        id TEXT PRIMARY KEY,
        image_url TEXT NOT NULL,
        title TEXT NOT NULL,
        registered_on DATE,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    // 선택: 특허 항목에 다운로드 파일(예: 한글 번역본 PDF) 첨부.
    await sql`ALTER TABLE patents ADD COLUMN IF NOT EXISTS file_url TEXT`;
    await sql`ALTER TABLE patents ADD COLUMN IF NOT EXISTS file_name TEXT`;

    // 사양서 옵션 마스터 목록. 관리자가 등록/삭제/정렬하며, 각 설비에서
    // 체크 선택한 항목이 사양서의 "옵션(Options)" 행으로 추가된다.
    await sql`
      CREATE TABLE IF NOT EXISTS spec_options (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    // 인증서 목록. 관리자가 지정한 표시 순서(sort_order)대로 노출한다.
    await sql`
      CREATE TABLE IF NOT EXISTS certifications (
        id TEXT PRIMARY KEY,
        image_url TEXT NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    // 방문 분석(홍보효과 측정)용 페이지뷰 로그. 개인정보 보호를 위해 원본 IP는
    // 저장하지 않고, 서버에서 국가·도시·시간대만 추출해 저장한다. 방문자 식별은
    // 브라우저에 저장되는 익명 ID(visitor_id)로만 하며 개인을 특정하지 않는다.
    await sql`
      CREATE TABLE IF NOT EXISTS page_views (
        id TEXT PRIMARY KEY,
        visitor_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        path TEXT NOT NULL,
        locale TEXT,
        referrer TEXT,
        ref_source TEXT,
        ref_host TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        search_keyword TEXT,
        country TEXT,
        city TEXT,
        timezone TEXT,
        hour_local INT,
        device TEXT,
        browser TEXT,
        os TEXT,
        language TEXT,
        dwell_ms INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS page_views_created_idx ON page_views (created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS page_views_visitor_idx ON page_views (visitor_id)`;

    // 해외 법인은 구글지도를 써야 하는데, map_provider 컬럼이 추가되기 전에
    // 이미 시딩된 환경에서는 기본값인 'naver'로 남아있을 수 있어 바로잡는다.
    await sql`UPDATE offices SET map_provider = 'google' WHERE name LIKE '%쑤저우%' AND map_provider <> 'google'`;

    // 기술종류별 항목명 변경(이미 시딩된 환경 보정) — 관리자가 바꾸지 않은 기본값만 갱신.
    await sql`UPDATE content_items SET name = '레이저마킹(인쇄·조각·각인)' WHERE group_key = 'tech' AND item_key = 'marking' AND name = '레이저마킹(조각·인쇄)'`;
    await sql`UPDATE content_items SET name = '레이저마킹(인쇄·조각)' WHERE group_key = 'tech' AND item_key = 'marking' AND name = '레이저마킹(인쇄·조각·각인)'`;
    await sql`UPDATE content_items SET name = '레이저에칭(어블레이션)' WHERE group_key = 'tech' AND item_key = 'etching' AND name = '레이저에칭(각인)'`;

    // 언론보도·방송 카테고리를 "언론·방송"(media)으로 통합.
    await sql`UPDATE press_items SET category = 'media' WHERE category = 'broadcast'`;
    // SBS Biz <오굿데이> 방송 썸네일(캡처 이미지) 지정 — 썸네일 없이 시딩된 환경 보정.
    await sql`UPDATE press_items SET thumbnail_url = '/press/sbsbiz-ohgoodday-2026.webp' WHERE link_url = 'https://programs.sbs.co.kr/sbsbiz/ohgoodday/clip/89058/22000633202' AND (thumbnail_url IS NULL OR thumbnail_url = '')`;
    // 자동차 램프 레이저 용접(페이스북) 영상 썸네일(캡처 이미지) 지정.
    await sql`UPDATE resources SET thumbnail_url = '/resources/lamp-welding.webp' WHERE url = 'https://www.facebook.com/share/v/1AeZiyuDfy/' AND (thumbnail_url IS NULL OR thumbnail_url = '')`;

    await ensureLaserSolderingTechItem();
    await ensureElectronics3cIndustry();
    await ensureSpecOptionsDefault();
    await ensureMetalWeek2026News();
    await ensureBusinessRegistrationCert();
    await ensurePressInterview2025();
    await ensureSswChinaUsPatents();
    await ensureSswChinaCertKo();
    await ensureCladdingCert2018();
    await ensureDedupeCladdingPatents();
    await ensureHeatTreatmentPatents();
    await ensureDeleteDupHeatPatents();
    await ensureKnownPatentDates();
    await ensureKitaMembershipCert();
    await ensureTidingsImport();
    await ensureDedupeCeCerts();
    await ensureYtnChoikangPress();
    await ensureMoveYtnResourceToPress();
    await ensureIntroVideo2025();
    await ensureIntroVideo2021();
    await ensureIntroVideo2021Feb();
    await ensureLampWeldingVideo2023();
    await ensurePressInterviewThumbnail();
    await ensureIntroVideo2021Jan();
    await ensureSbsBizBroadcast2026();
    await ensureResourceVideosImport();
    await ensureMetalCutVideoUpdate();
    await ensureRemoveSolderingVideo();
    await ensureRemoveTidingsLogoImages();
    await ensureRemoveNewsLogoImagesV2();
    await ensureFixPost111Images();
    await ensureNoticeLogoThumbnail();
    await ensureExhibitionImport();
    await ensureMetalWeek2026Views();
    await ensureMetalWeek2026ViewsAdjust();
    await ensureMainNewsIntegration();
    await ensureSupportPostsSeed();
    await ensureThermalSprayWs46();
    await ensureWs46Rewrite();
    await ensureThermalSprayWs53();
    await ensureHidec28();
    await ensureHidec28Photo2Caption();
    await ensureInvestnewsToPress();
    await ensureKslp2025ToPress();
    await ensureYtnFilmingToPress();
    await ensureKsmeJournalToPress();
    await ensureEconomyNewsToPress();
    await ensureKoplas2023ToPress();
    await ensureMarketingJobRemoveFromNews();
    await ensurePressBodiesReformat();
    await ensureWs46ReviewToPress();
    await ensureRaylaseTrainingFix();
    await ensureNewsCleanup();
    await ensureAllTextCleanupV2();
    await ensureHidec28ReviewToPress();
    await ensureDaejeonUspToPress();
    await ensureYongsa2015ToPress();
    await ensureKomaf2015ToExhibition();
    await ensureYongsa2013ToPress();
    await ensureGwangjuSeminarToPress();
    await ensureKyeongin2013ToPress();
    await ensureChinaSeminar2013ToPress();
    await ensureHeatTreat2012ToPress();
    await ensureBusanKoaashow2008ToExhibition();
    await ensureRenameNoticeFix();
    await ensureKoplas2008ToExhibition();
    await ensureTradenameNoticeFix();
    await ensureKimes2014ToExhibition();
    await ensureKomaf2015Date();
    await ensureSafeTyposV3();
    await ensureEventDatesPlus7();
    await ensurePartnerLogosImport();
    await ensureTechTaxonomyV1();
    await ensureTechContentV2();
    await ensureTechSceneImagesV1();
    await ensureTemplateCaseImagesV1();
    await ensureTechContentV4();
    await ensureRemoveTestLineupV1();
    await ensureMaterialContentV1();
    await ensureSafetyCategoryV1();
    await ensureTechDescRichV1();
    await ensureMaterialDescRichV1();
    await ensureCkdLineupV1();
    await ensureChanxanLineupV1();
    await ensureChanxanMedicalV1();
    await ensureChanxanCasesV1();
    await ensureHuiruiLineupV1();
  })();
}

// 재료별 설명을 레이저 가공 관점의 전문 자료로 보강(가공 특성·가능 공정·장점·유의사항·적용).
const RICH_MATERIAL_DESC: Record<string, string> = {
  metalSteel: [
    "금속·철강 (Metal · Steel)",
    "금속·철강은 산업용 레이저 가공의 가장 대표적인 소재로, 절단·용접·마킹·표면경화·클리닝·클래딩·드릴링 등 거의 모든 레이저 공정이 적용됩니다.",
    "",
    "[레이저 가공 특성]",
    "금속은 파이버 레이저 파장(약 1,064nm)에 잘 흡수되어 고효율 가공이 가능합니다. 다만 스테인리스·탄소강 등 종류에 따라 특성이 다릅니다.",
    "",
    "[가능한 레이저 가공]",
    "절단 · 용접 · 마킹/각인 · 표면경화(열처리) · 클리닝(녹·산화물 제거) · 클래딩(코팅·보수) · 드릴링",
    "",
    "[장점]",
    "- 고속·고정밀·비접촉, 자동화 용이",
    "- 얇은 판재부터 후판까지 넓은 두께 대응",
    "- 공구 마모 없이 복잡 형상 가공",
    "",
    "[적용 시 유의사항]",
    "- 표면 산화·오염 상태 관리, 보호가스·흄 배기",
    "- 두께·종류별 파라미터 최적화, 레이저 안전",
    "",
    "[적용 분야] 자동차 · 기계 · 조선 · 철강 · 금형",
  ].join("\n"),
  copperAluminum: [
    "동·알루미늄 (Copper · Aluminum)",
    "동·알루미늄은 전기·열전도가 우수해 배터리·전장의 핵심 소재이지만, 빛 반사율이 높아 레이저 가공 난이도가 높은 소재입니다.",
    "",
    "[레이저 가공 특성]",
    "적외선(1,064nm) 반사율이 높아, 그린(515nm)·블루 파장이나 빔 워블링·출력 제어로 안정적인 가공을 구현합니다.",
    "",
    "[가능한 레이저 가공]",
    "용접(배터리 탭·버스바) · 절단 · 마킹 · 클리닝",
    "",
    "[장점]",
    "- 동-알루미늄 등 이종금속 접합 대응",
    "- 저변형 정밀 접합, 고속 자동화",
    "",
    "[적용 시 유의사항]",
    "- 고반사 대응 파장·빔 제어 필요",
    "- 스패터·기공 관리, 레이저 안전(반사광 주의)",
    "",
    "[적용 분야] 배터리(2차전지) · 전기·전자 · 자동차 전장",
  ].join("\n"),
  plastic: [
    "플라스틱 (Plastics)",
    "플라스틱은 레이저 용접·절단·마킹에 널리 쓰이는 소재입니다. 특히 투과/흡수 특성을 이용한 레이저 플라스틱 용접은 ㈜이브이레이저의 핵심 기술입니다.",
    "",
    "[레이저 가공 특성]",
    "소재의 색상·첨가제에 따른 레이저 투과/흡수 특성이 가공 품질을 좌우합니다. 열가소성 수지가 주로 사용됩니다.",
    "",
    "[가능한 레이저 가공]",
    "플라스틱 용접 · 절단 · 마킹",
    "",
    "[장점]",
    "- 비접촉·무버(Burr)·무분진 청정 가공",
    "- 수밀·기밀 우수, 외관 손상 없는 미려한 접합",
    "",
    "[적용 시 유의사항]",
    "- 상·하부 소재의 투과/흡수 설계(용접)",
    "- 흄 배기, 소재별 파라미터, 레이저 안전",
    "",
    "[적용 분야] 자동차 부품(센서·램프·전장) · 의료기기 · 전자",
  ].join("\n"),
  glass: [
    "유리 (Glass)",
    "유리는 초단펄스 레이저로 절단·용접·마킹·에칭이 가능한 소재입니다. 미세 균열 없이 정밀 가공할 수 있습니다.",
    "",
    "[레이저 가공 특성]",
    "투명 소재 특성상 초단펄스(비선형 흡수) 또는 특정 파장을 이용해 저손상 가공을 구현합니다.",
    "",
    "[가능한 레이저 가공]",
    "유리 용접(접착제 없는 투명 접합) · 절단 · 마킹 · 에칭",
    "",
    "[장점]",
    "- 저손상·저균열 정밀 가공",
    "- 투명·고기밀 접합, 미세 패턴",
    "",
    "[적용 시 유의사항]",
    "- 표면 청정·밀착(용접), 파라미터 정밀 제어",
    "- 파편·레이저 안전 관리",
    "",
    "[적용 분야] 디스플레이 · 광학 · 의료·바이오",
  ].join("\n"),
  ceramic: [
    "세라믹 (Ceramic)",
    "세라믹은 경도가 높아 기계가공이 어렵지만, 레이저로 절단·드릴링·마킹·미세가공이 가능한 소재입니다.",
    "",
    "[레이저 가공 특성]",
    "취성(깨지기 쉬운) 소재이므로 비접촉·국부 가공으로 손상을 최소화하며, 초단펄스로 정밀도를 높입니다.",
    "",
    "[가능한 레이저 가공]",
    "절단 · 드릴링 · 마킹 · 정밀·미세가공",
    "",
    "[장점]",
    "- 비접촉으로 취성 재료 손상·크랙 최소",
    "- 미세·고정밀 가공, 공구 마모 없음",
    "",
    "[적용 시 유의사항]",
    "- 열충격·크랙 방지 파라미터 설정",
    "- 분진 배기, 레이저 안전",
    "",
    "[적용 분야] 반도체 · 전자부품 · 의료",
  ].join("\n"),
  pcb: [
    "PCB (인쇄회로기판)",
    "PCB는 레이저 드릴링(비아홀)·마킹·절단·솔더링에 쓰이는 소재입니다. 고밀도 전자회로 가공에 레이저가 널리 활용됩니다.",
    "",
    "[레이저 가공 특성]",
    "수지·동박·유리섬유 복합 구조로, 미세 비아홀과 정밀 가공에 UV·펄스 레이저가 적합합니다.",
    "",
    "[가능한 레이저 가공]",
    "드릴링(비아홀) · 마킹 · 절단(디패널) · 솔더링",
    "",
    "[장점]",
    "- 미세 비아·고밀도 가공, 비접촉 정밀",
    "- 열영향 최소, 고속 양산",
    "",
    "[적용 시 유의사항]",
    "- 층 구조별 파라미터, 탄화·잔류물 관리",
    "- 분진 배기, 레이저 안전",
    "",
    "[적용 분야] 전자·반도체 · 자동차 전장",
  ].join("\n"),
  preciousMetal: [
    "귀금속 (Precious Metals)",
    "금·은 등 귀금속은 레이저로 정밀 마킹·에칭·미세가공·용접이 가능한 소재입니다.",
    "",
    "[레이저 가공 특성]",
    "고반사·고가 소재로, 소재 손실을 최소화하는 미세·정밀 가공이 요구됩니다.",
    "",
    "[가능한 레이저 가공]",
    "마킹 · 에칭 · 정밀가공 · 용접(주얼리 수리 등)",
    "",
    "[장점]",
    "- 미세·고정밀, 소재 손실 최소",
    "- 반영구 마킹·각인, 정밀 수리",
    "",
    "[적용 시 유의사항]",
    "- 반사광 관리, 파라미터 정밀 제어",
    "- 레이저 안전",
    "",
    "[적용 분야] 주얼리 · 전자 · 의료",
  ].join("\n"),
  wood: [
    "나무(목재) (Wood)",
    "목재는 CO₂ 레이저로 절단·조각·마킹이 가능한 소재입니다.",
    "",
    "[가능한 레이저 가공] 절단 · 마킹(조각)",
    "[장점] 비접촉·고속, 복잡 패턴·조각 자유, 공구 마모 없음",
    "[적용 시 유의사항] 그을음·화재 관리, 배기·집진 필수, 수종별 파라미터",
    "[적용 분야] 공예 · 인테리어 · 간판",
  ].join("\n"),
  paper: [
    "종이 (Paper)",
    "종이·얇은 필름은 CO₂ 레이저로 정밀 절단·마킹이 가능한 소재입니다.",
    "",
    "[가능한 레이저 가공] 절단 · 마킹",
    "[장점] 고속·정밀, 복잡 형상·미세 커팅, 비접촉",
    "[적용 시 유의사항] 화재·그을음 관리, 배기 필수",
    "[적용 분야] 포장 · 라벨 · 인쇄·판촉물",
  ].join("\n"),
  fabric: [
    "천(옷감) (Fabric · Textile)",
    "직물·섬유는 레이저로 깨끗한 절단과 동시에 가장자리 융착(올풀림 방지)이 가능한 소재입니다.",
    "",
    "[가능한 레이저 가공] 절단 · 마킹(각인)",
    "[장점] 비접촉·고속, 복잡 패턴 자유, 절단면 융착으로 마감이 깔끔",
    "[적용 시 유의사항] 소재별 화재·그을음·변색 관리, 배기·집진 필수",
    "[적용 분야] 의류·패션 · 자동차 내장재 · 산업용 섬유",
  ].join("\n"),
  leather: [
    "가죽 (Leather)",
    "가죽은 레이저로 정밀 절단·조각·마킹이 가능한 소재입니다.",
    "",
    "[가능한 레이저 가공] 절단 · 마킹(조각)",
    "[장점] 비접촉·고속, 미세 패턴·로고 조각, 깔끔한 절단면",
    "[적용 시 유의사항] 냄새·그을음 관리, 배기 필수, 천연/합성 구분",
    "[적용 분야] 패션·잡화 · 자동차 내장",
  ].join("\n"),
  rubber: [
    "고무 (Rubber)",
    "고무는 레이저로 절단·마킹·스탬프(인장) 제작이 가능한 소재입니다.",
    "",
    "[가능한 레이저 가공] 절단 · 마킹 · 인장(스탬프) 조각",
    "[장점] 비접촉·고속, 정밀 패턴, 금형 없이 소량 제작",
    "[적용 시 유의사항] 가스·냄새 발생(배기 필수), 소재별 파라미터",
    "[적용 분야] 산업용 부품 · 인장(스탬프) · 가스켓",
  ].join("\n"),
  other: [
    "기타 소재 (Others)",
    "그 외 다양한 소재도 레이저 가공이 가능합니다. 소재의 광학·열적 특성과 요구 품질에 맞춰 최적의 레이저 공법(파장·펄스·파라미터)을 제안해 드립니다.",
    "",
    "[안내] 신규 소재·특수 요구사항은 사전 가공성 평가(테스트)를 권장합니다. 자세한 사항은 문의해 주세요.",
  ].join("\n"),
};
async function ensureMaterialDescRichV1(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'material_desc_rich_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();
  for (const [key, desc] of Object.entries(RICH_MATERIAL_DESC)) {
    await sql`
      INSERT INTO content_pages (group_key, item_key, description, updated_at)
      VALUES ('material', ${key}, ${desc}, ${now})
      ON CONFLICT (group_key, item_key) DO UPDATE SET description = EXCLUDED.description, updated_at = EXCLUDED.updated_at
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('material_desc_rich_v1', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// 해외 공급·협업사(중국 CKD, 심천창과달) 제품을 설비(lineup)에 자동 등록하는 파일럿.
// 카탈로그의 제품명·사진·특징을 기존 설비와 동일한 형식으로 등록하고, 기술종류(절단·
// 드릴링)·재료·산업에 연결한다. 사양 수치는 카탈로그가 이미지 기반이라 공란으로 두고
// (사양서 템플릿), 관리자가 카탈로그를 보고 직접 보정·공개한다.
interface CkdProduct {
  key: string;
  itemName: string; // content_items.name (모델/시리즈 — 카드 보조 라벨)
  title: string;
  nameEn: string;
  model: string;
  icon: string;
  description: string;
  specTable: string;
  imageUrl: string;
  links: [string, string][]; // [toGroup, toKey]
  cases: { url: string; caption: string }[]; // 적용사례 이미지
}
const CKD_OEM_SOURCE = "http://www.ckdseiki.com";
const CKD_PRODUCTS: CkdProduct[] = [
  {
    key: "ckdGlassCutDrill",
    itemName: "CKD Glass Series",
    title: "유리 레이저 절단·드릴링 시스템",
    nameEn: "Glass Laser Cutting & Drilling Machine",
    model: "CKD Glass Series",
    icon: "cut",
    description: [
      "유리 레이저 절단·드릴링 시스템",
      "초단펄스(피코초·펨토초) 레이저로 유리·강화유리·OLED 패널 등 취성 소재를 미세 균열 없이 절단·드릴링하는 시스템입니다. 중국 CKD(심천창과달)의 유리 레이저 가공 전용 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 비접촉·저손상 가공으로 칩핑(chipping)·미세 균열을 최소화하고 꺾임 강도 유지",
      "- 직선·곡선·이형(異形) 절단과 홀(hole) 가공을 한 장비에서 구현",
      "- 비전 정렬(CCD)로 마크·패턴 기준 고정밀 위치 보정",
      "- 듀얼 테이블 구조로 상·하차와 가공을 병행해 생산성 향상",
      "- 자체 개발 제어 소프트웨어로 레시피 전환 용이",
      "",
      "[적용 분야]",
      "스마트폰·태블릿 커버글라스, 디스플레이 패널, 반도체·전자부품용 유리",
      "",
      "[가공 소재]",
      "유리, 강화유리, 사파이어, OLED, 세라믹 등 취성 소재",
      "",
      "※ 중국 CKD와의 공급·협업 제품입니다. 모델별 상세 사양(출력·가공 두께·속도·정밀도 등)은 카탈로그 기준이며, 담당자 확인 후 사양서에 반영됩니다.",
    ].join("\n"),
    specTable: [
      "가공 방식 (Process) | 레이저 절단·드릴링 (비접촉)",
      "레이저 종류 (Laser type) | 모델별 상이 (UV·그린·피코초 등)",
      "가공 소재 (Material) | 유리·강화유리·사파이어·OLED·세라믹",
      "가공 두께 (Thickness) | 최대 약 19 mm (1-pass, 모델별 상이)",
      "가공 정밀도 (Accuracy) | ",
      "최소 절단폭/홀경 (Min. kerf / hole) | ",
      "작업 영역 (Working area) | ",
      "반복 정밀도 (Repeatability) | ",
      "비전 정렬 (Vision alignment) | CCD",
      "제어 소프트웨어 (Control S/W) | 자체 개발 (CKD)",
      "전원 (Power supply) | ",
      "설비 치수 (Dimensions) | ",
    ].join("\n"),
    imageUrl: "/images/lineup/ckd/ckd-glass-cutdrill.webp",
    links: [
      ["tech", "cutting"],
      ["tech", "drilling"],
      ["material", "glass"],
      ["industry", "display"],
      ["industry", "electronics3c"],
      ["industry", "semiconductor"],
    ],
    cases: [{ url: "/images/lineup/ckd/ckd-glass-lineup.webp", caption: "CKD 유리 레이저 절단·드릴링 설비 라인업" }],
  },
  {
    key: "ckdCeramicCutDrill",
    itemName: "CKD Ceramic Series",
    title: "세라믹·취성재료 레이저 절단·드릴링 시스템",
    nameEn: "Ceramic Laser Cutting & Drilling Machine",
    model: "CKD Ceramic Series",
    icon: "cut",
    description: [
      "세라믹·취성재료 레이저 절단·드릴링 시스템",
      "세라믹(알루미나·질화알루미늄 등)·사파이어 등 고경도 취성 소재를 레이저로 절단·드릴링하는 시스템입니다. 중국 CKD의 세라믹 레이저 가공 전용 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 초경도 세라믹을 비접촉으로 가공해 공구 마모·파손 없이 미세 형상 구현",
      "- 초단펄스 레이저로 열영향부(HAZ)를 최소화하고 크랙·치핑 억제",
      "- 미세 홀·슬롯·이형 절단 등 고정밀 패턴 가공",
      "- 비전 정렬 및 자동화 라인 연동 가능",
      "",
      "[적용 분야]",
      "반도체·전자부품용 세라믹 기판, LED, 전력반도체, 정밀부품",
      "",
      "[가공 소재]",
      "알루미나(Al₂O₃)·질화알루미늄(AlN) 등 세라믹, 사파이어, 취성 소재",
      "",
      "※ 중국 CKD와의 공급·협업 제품입니다. 모델별 상세 사양은 카탈로그 기준이며, 담당자 확인 후 사양서에 반영됩니다.",
    ].join("\n"),
    specTable: [
      "가공 방식 (Process) | 레이저 절단·드릴링 (비접촉)",
      "레이저 종류 (Laser type) | 모델별 상이 (초단펄스 등)",
      "가공 소재 (Material) | 세라믹(알루미나·AlN)·사파이어·취성 소재",
      "가공 두께 (Thickness) | ",
      "가공 정밀도 (Accuracy) | ",
      "최소 절단폭/홀경 (Min. kerf / hole) | ",
      "작업 영역 (Working area) | ",
      "반복 정밀도 (Repeatability) | ",
      "비전 정렬 (Vision alignment) | CCD",
      "제어 소프트웨어 (Control S/W) | 자체 개발 (CKD)",
      "전원 (Power supply) | ",
      "설비 치수 (Dimensions) | ",
    ].join("\n"),
    imageUrl: "/images/lineup/ckd/ckd-ceramic-cutdrill.webp",
    links: [
      ["tech", "cutting"],
      ["tech", "drilling"],
      ["material", "ceramic"],
      ["industry", "semiconductor"],
      ["industry", "electronics3c"],
    ],
    cases: [],
  },
  {
    key: "ckdOledCutDrill",
    itemName: "CKD OLED Series",
    title: "OLED 레이저 절단·드릴링 시스템",
    nameEn: "OLED Laser Cutting & Drilling Machine",
    model: "CKD OLED Series",
    icon: "cut",
    description: [
      "OLED 레이저 절단·드릴링 시스템",
      "OLED·플렉시블 디스플레이 패널 등 박막·취성 소재를 초단펄스 레이저로 저손상 절단·드릴링하는 시스템입니다. 중국 CKD의 디스플레이 레이저 가공 전용 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 박막·연성 패널을 비접촉·저열영향으로 미세 절단",
      "- 셀 단위 커팅·홀 가공 및 이형 커팅 대응",
      "- 비전 정렬로 패턴 기준 고정밀 위치 보정",
      "- 인라인 자동화 연동 가능",
      "",
      "[적용 분야]",
      "OLED·플렉시블 디스플레이, 터치패널, 전자부품",
      "",
      "[가공 소재]",
      "OLED, 박막 유리, 폴리이미드(PI) 등",
      "",
      "※ 중국 CKD와의 공급·협업 제품입니다. 모델별 상세 사양은 카탈로그 기준이며, 담당자 확인 후 사양서에 반영됩니다.",
    ].join("\n"),
    specTable: [
      "가공 방식 (Process) | 레이저 절단·드릴링 (비접촉)",
      "레이저 종류 (Laser type) | 모델별 상이 (초단펄스 등)",
      "가공 소재 (Material) | OLED·박막 유리·PI 등",
      "가공 정밀도 (Accuracy) | ",
      "최소 절단폭/홀경 (Min. kerf / hole) | ",
      "작업 영역 (Working area) | ",
      "비전 정렬 (Vision alignment) | CCD",
      "제어 소프트웨어 (Control S/W) | 자체 개발 (CKD)",
      "전원 (Power supply) | ",
      "설비 치수 (Dimensions) | ",
    ].join("\n"),
    imageUrl: "/images/lineup/ckd/ckd-oled-cutdrill.webp",
    links: [
      ["tech", "cutting"],
      ["tech", "drilling"],
      ["material", "glass"],
      ["industry", "display"],
      ["industry", "electronics3c"],
    ],
    cases: [],
  },
  {
    key: "ckdGlassLine",
    itemName: "CKD Glass Line",
    title: "유리 가공 자동화 라인 (Glass Line Solution)",
    nameEn: "Glass Processing Automation Line",
    model: "CKD Glass Line Solution",
    icon: "machine",
    description: [
      "유리 가공 자동화 라인 (Glass Line Solution)",
      "로딩·레이저 절단·브레이킹·검사·언로딩을 하나로 연결한 유리 가공 자동화 라인입니다. 중국 CKD의 턴키 라인 솔루션으로, 대량 생산 현장의 생산성·수율 향상을 지원합니다. ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 로딩~언로딩 전 공정 자동화(턴키)로 인건비 절감·수율 향상",
      "- 레이저 절단·드릴링·브레이킹·검사 공정 통합",
      "- 라인 구성(장비 수·배치)은 생산 품목에 맞춰 맞춤 설계",
      "- 자체 개발 제어·MES 연동 지원",
      "",
      "[적용 분야]",
      "스마트폰·태블릿 커버글라스, 디스플레이 패널 대량 생산",
      "",
      "[가공 소재]",
      "유리, 강화유리 등",
      "",
      "※ 중국 CKD와의 공급·협업 제품입니다. 라인 구성·상세 사양은 카탈로그 기준이며, 담당자 확인 후 사양서에 반영됩니다.",
    ].join("\n"),
    specTable: [
      "구성 (Configuration) | 로딩·절단·브레이킹·검사·언로딩 자동화 라인",
      "가공 방식 (Process) | 레이저 절단·드릴링 (비접촉)",
      "가공 소재 (Material) | 유리·강화유리",
      "생산 능력 (Throughput) | ",
      "라인 길이 (Line length) | ",
      "자동화 (Automation) | 턴키(맞춤 설계)",
      "제어 소프트웨어 (Control S/W) | 자체 개발 (CKD)",
      "전원 (Power supply) | ",
    ].join("\n"),
    imageUrl: "/images/lineup/ckd/ckd-glassline.webp",
    links: [
      ["tech", "cutting"],
      ["tech", "drilling"],
      ["material", "glass"],
      ["industry", "display"],
      ["industry", "electronics3c"],
    ],
    cases: [{ url: "/images/lineup/ckd/ckd-glassline-site.webp", caption: "CKD 유리 가공 자동화 라인 설치 현장" }],
  },
  {
    key: "ckdMetalCut",
    itemName: "CKD-POWER-FIBER",
    title: "금속 레이저 절단 시스템 (CKD-POWER-FIBER)",
    nameEn: "Metal Fiber Laser Cutting Machine",
    model: "CKD-POWER-FIBER",
    icon: "cut",
    description: [
      "금속 레이저 절단 시스템 (CKD-POWER-FIBER)",
      "고출력 파이버 레이저로 금속 판재를 고속·고정밀 절단하는 시스템입니다. 중국 CKD의 금속 절단 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 고출력 파이버 레이저 기반 고속 절단",
      "- 탄소강·스테인리스·알루미늄·동 등 다양한 금속 대응",
      "- 밀폐형 구조로 안전·집진 관리 용이",
      "- 자동 초점·비전 보정으로 가공 품질 안정화",
      "",
      "[적용 분야]",
      "기계·판금, 자동차 부품, 전자·정밀부품",
      "",
      "[가공 소재]",
      "탄소강·스테인리스·알루미늄·동 등 금속",
      "",
      "※ 중국 CKD와의 공급·협업 제품입니다. 출력·두께 등 상세 사양은 카탈로그 기준이며, 담당자 확인 후 사양서에 반영됩니다.",
    ].join("\n"),
    specTable: [
      "가공 방식 (Process) | 파이버 레이저 절단 (비접촉)",
      "레이저 종류 (Laser type) | 파이버 레이저 (출력 모델별 상이)",
      "가공 소재 (Material) | 탄소강·스테인리스·알루미늄·동",
      "가공 두께 (Thickness) | ",
      "절단 속도 (Cutting speed) | ",
      "작업 영역 (Working area) | ",
      "자동 초점 (Auto focus) | 지원",
      "전원 (Power supply) | ",
      "설비 치수 (Dimensions) | ",
    ].join("\n"),
    imageUrl: "/images/lineup/ckd/ckd-metal-cut.webp",
    links: [
      ["tech", "cutting"],
      ["material", "metalSteel"],
      ["material", "copperAluminum"],
      ["industry", "machinery"],
      ["industry", "steel"],
      ["industry", "automotive"],
    ],
    cases: [],
  },
  {
    key: "ckdMarking",
    itemName: "CKD F02 Series",
    title: "레이저 마킹 시스템 (파이버·UV·CO2)",
    nameEn: "Laser Marking System (Fiber / UV / CO2)",
    model: "CKD F02 Series",
    icon: "mark",
    description: [
      "레이저 마킹 시스템 (파이버·UV·CO2)",
      "파이버(Fiber)·UV·CO2 레이저 광원을 소재에 맞춰 선택할 수 있는 마킹·각인 시스템입니다. 금속·플라스틱·유리 등 다양한 소재에 반영구 마킹을 구현합니다. 중국 CKD의 마킹 시리즈(F02)로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- Fiber(금속)·UV(저열·정밀)·CO2(비금속) 광원 선택",
      "- 비접촉·반영구 마킹으로 로고·일련번호·2D코드 각인",
      "- 고속·고정밀 스캐너, 자동화 연동 가능",
      "",
      "[적용 분야]",
      "전자·전장 부품, 자동차 부품, 산업 부품 식별 마킹",
      "",
      "[가공 소재]",
      "금속, 플라스틱, 유리 등 (광원별 상이)",
      "",
      "※ 중국 CKD와의 공급·협업 제품입니다. 모델별(파이버/UV/CO2) 상세 사양은 카탈로그 기준이며, 담당자 확인 후 사양서에 반영됩니다.",
    ].join("\n"),
    specTable: [
      "가공 방식 (Process) | 레이저 마킹·각인 (비접촉)",
      "레이저 종류 (Laser type) | 파이버 / UV / CO2 (소재별 선택)",
      "가공 소재 (Material) | 금속·플라스틱·유리 등",
      "마킹 정밀도 (Accuracy) | ",
      "마킹 영역 (Marking area) | ",
      "마킹 속도 (Speed) | ",
      "제어 소프트웨어 (Control S/W) | 자체 개발 (CKD)",
      "전원 (Power supply) | ",
    ].join("\n"),
    imageUrl: "/images/lineup/ckd/ckd-marking-fiber.webp",
    links: [
      ["tech", "marking"],
      ["material", "metalSteel"],
      ["material", "plastic"],
      ["material", "glass"],
      ["industry", "electronics3c"],
      ["industry", "automotive"],
    ],
    cases: [{ url: "/images/lineup/ckd/ckd-marking-series.webp", caption: "CKD 레이저 마킹 시리즈(파이버·UV·CO2)" }],
  },
  {
    key: "ckd3dEngrave",
    itemName: "CKD 3D Engraving",
    title: "유리·크리스탈 3D 레이저 조각 시스템",
    nameEn: "Glass 3D Laser Engraving Machine",
    model: "CKD 3D Series",
    icon: "mark",
    description: [
      "유리·크리스탈 3D 레이저 조각 시스템",
      "유리·크리스탈 내부에 레이저 초점을 맞춰 미세 균열점을 형성, 입체(3D) 이미지를 각인하는 시스템입니다. 중국 CKD의 3D 조각 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 유리·크리스탈 내부 3D 입체 각인(서브서피스)",
      "- 표면 손상 없이 투명 소재 내부 가공",
      "- 사진·로고·문자의 3D 포인트 변환 소프트웨어 지원",
      "",
      "[적용 분야]",
      "크리스탈 기념품·시상품, 광학·장식 유리",
      "",
      "[가공 소재]",
      "유리, 크리스탈 등 투명 소재",
      "",
      "※ 중국 CKD와의 공급·협업 제품입니다. 상세 사양은 카탈로그 기준이며, 담당자 확인 후 사양서에 반영됩니다.",
    ].join("\n"),
    specTable: [
      "가공 방식 (Process) | 내부 3D 레이저 각인 (비접촉)",
      "레이저 종류 (Laser type) | 모델별 상이 (그린·초단펄스 등)",
      "가공 소재 (Material) | 유리·크리스탈 등 투명 소재",
      "가공 영역 (Working area) | ",
      "포인트 속도 (Dot speed) | ",
      "제어 소프트웨어 (Control S/W) | 자체 개발 (CKD)",
      "전원 (Power supply) | ",
    ].join("\n"),
    imageUrl: "/images/lineup/ckd/ckd-3d-engrave.webp",
    links: [
      ["tech", "marking"],
      ["tech", "etching"],
      ["material", "glass"],
      ["industry", "other"],
    ],
    cases: [{ url: "/images/lineup/ckd/ckd-3d-samples.webp", caption: "CKD 유리·크리스탈 3D 레이저 조각 샘플" }],
  },
];
async function ensureCkdLineupV1(): Promise<void> {
  // v3: CKD 전 제품(절단·드릴링·마킹·3D조각·자동화라인) 확장. content_pages는
  // upsert로 갱신하고, content_items/links는 중복 방지, 적용사례 이미지는 기존이
  // 없을 때만 추가한다(관리자가 올린 사진 보존).
  const flag = (await sql`SELECT value FROM settings WHERE key = 'ckd_lineup_v3'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();
  let order = 300;
  for (const p of CKD_PRODUCTS) {
    await sql`INSERT INTO content_items (id, group_key, item_key, name, icon, sort_order, created_at) VALUES (${newId()}, 'lineup', ${p.key}, ${p.itemName}, ${p.icon}, ${order}, ${now}) ON CONFLICT (group_key, item_key) DO NOTHING`;
    await sql`
      INSERT INTO content_pages (group_key, item_key, title, description, spec_table, image_url, model, name_en, is_oem, oem_source, updated_at)
      VALUES ('lineup', ${p.key}, ${p.title}, ${p.description}, ${p.specTable}, ${p.imageUrl}, ${p.model}, ${p.nameEn}, true, ${CKD_OEM_SOURCE}, ${now})
      ON CONFLICT (group_key, item_key) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, spec_table=EXCLUDED.spec_table, image_url=EXCLUDED.image_url, model=EXCLUDED.model, name_en=EXCLUDED.name_en, is_oem=EXCLUDED.is_oem, oem_source=EXCLUDED.oem_source, updated_at=EXCLUDED.updated_at
    `;
    for (const [tg, tk] of p.links) {
      await sql`INSERT INTO content_item_links (from_group, from_key, to_group, to_key) VALUES ('lineup', ${p.key}, ${tg}, ${tk}) ON CONFLICT DO NOTHING`;
    }
    const imgCnt = (await sql`SELECT COUNT(*)::int AS c FROM content_images WHERE group_key='lineup' AND item_key=${p.key}`) as { c: number }[];
    if ((imgCnt[0]?.c ?? 0) === 0) {
      for (let i = 0; i < p.cases.length; i++) {
        await sql`INSERT INTO content_images (id, group_key, item_key, url, caption, sort_order, created_at) VALUES (${newId()}, 'lineup', ${p.key}, ${p.cases[i].url}, ${p.cases[i].caption}, ${i}, ${now})`;
      }
    }
    order += 1;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('ckd_lineup_v3', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// 해외 공급·협업사(중국 CHANXAN 创轩激光, 쑤저우) 정밀 레이저 절단·미세가공·마킹
// 제품을 설비(lineup)에 등록. 카탈로그에서 실제 사진·실사양을 반영(기존 설비와 동일 형식).
const CHANXAN_OEM_SOURCE = "https://www.chanxan.com";
const CHANXAN_PRODUCTS: CkdProduct[] = [
  {
    key: "chanxanCw650r",
    itemName: "CW-650R",
    title: "CW-650R 레이저 절단기",
    nameEn: "Laser Cutting Machine",
    model: "CW-650R",
    icon: "cut",
    description: [
      "CW-650R 레이저 절단기",
      "휴대폰용 필름 등 박막 소재를 비접촉으로 고정밀 절단하는 레이저 절단기입니다. 중국 CHANXAN(创轩激光)의 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 비접촉 가공으로 버(burr) 없이 매끄럽고, 변형·표면 손상이 없음",
      "- 듀얼 드라이브 갠트리 + 고강성 모션 제어, 수입 레이저·광학계로 정밀 위치결정",
      "- 미세홀 진원도 우수, 직각 과소/과열 없음, R각·복잡 곡선·미세 패턴 왜곡 없음",
      "- 레이어드 커팅 지원 소프트웨어, 대/중/소 배치 생산·신제품 검증에 적합",
      "- CCD 자동 보정으로 절단 정밀도 향상, 24시간 연속 운전, 자동 상·하차 옵션",
      "",
      "[적용 분야]",
      "휴대폰 박막, 통신·소비자 전자, gdf필름·전자종이·편광필름·터치스크린 PET·OCA·플렉시블 OLED 등 고정밀 필름 절단",
      "",
      "[가공 소재]",
      "각종 필름·PET·OCA·플렉시블 OLED 등",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "모델 (Model) | CW-650R",
      "레이저 출력 (Laser power) | 30~150 W",
      "가공 영역 (Working area) | 600 × 500 mm",
      "위치결정 정밀도 (Positioning) | ±0.01 mm",
      "최대 이송 속도 (Max. moving speed) | 1,000 mm/s",
      "냉각 방식 (Cooling) | 수냉/공냉 (Water/air)",
      "전원 (Supply voltage) | AC 220V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-cw650r.webp",
    links: [
      ["tech", "cutting"],
      ["tech", "drilling"],
      ["material", "plastic"],
      ["material", "glass"],
      ["industry", "electronics3c"],
      ["industry", "display"],
    ],
    cases: [],
  },
  {
    key: "chanxanPicoMicro",
    itemName: "CX-2060PZ/PLT",
    title: "더블스테이션 피코초 레이저 미세가공 설비",
    nameEn: "Double-station Roll-to-sheet Picosecond Laser Micromachining Equipment",
    model: "CX-2060PZ/PLT",
    icon: "precision",
    description: [
      "더블스테이션 롤투시트 피코초 레이저 미세가공 설비",
      "커버필름 등 롤 소재를 피코초 레이저로 고속·고정밀 미세가공하는 더블스테이션(2헤드) 자동화 설비입니다. 중국 CHANXAN(创轩激光)의 FPC 전용 미세가공 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 2헤드 동시 가공으로 롤 소재(커버필름) 가공 효율 2배",
      "- 자동 피딩·자동 절단·자동 수거의 완전 자동화",
      "- 절단 가장자리 매끄럽고 탄화(carbonization) 거의 없음",
      "- 독자 설계 분광 시스템으로 동일 출력 대비 속도·품질 최적화",
      "- 네트워크 기능으로 생산 진척·가동 상태 원격 모니터링",
      "",
      "[적용 분야]",
      "FPC 커버필름 롤투시트·롤투롤, FPC 외형, FPC 부자재 가공",
      "",
      "[가공 소재]",
      "FPC 커버필름·PET 등 롤 소재",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "모델 (Model) | CX-2060PZ/PLT",
      "레이저 출력 (Laser power) | 나노초/피코초 선택 (Nanosecond/picosecond selectable)",
      "가공 영역 (Working area) | 270 × 610 mm",
      "위치결정 정밀도 (Positioning) | ±5 µm",
      "절단 속도 (Cutting speed) | ≤ 3,000 mm/s",
      "외형 치수 (Overall dimension) | 2,200 × 1,500 × 1,750 mm",
      "전원 (Supply voltage) | AC 380V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-pico-micro.webp",
    links: [
      ["tech", "cutting"],
      ["tech", "precisionMachining"],
      ["material", "plastic"],
      ["material", "pcb"],
      ["industry", "electronics3c"],
    ],
    cases: [],
  },
  {
    key: "chanxanHighprec",
    itemName: "CW-6060J",
    title: "고정밀 레이저 절단기",
    nameEn: "High Precision Laser Cutting Machine",
    model: "CW-6060J",
    icon: "cut",
    description: [
      "고정밀 레이저 절단기",
      "수입 QCW 준연속(fiber) 레이저와 대리석·열처리 강재 구조로 고정밀·장기 안정성을 구현한 레이저 절단기입니다. 중국 CHANXAN(创轩激光)의 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 수입 QCW 준연속 파이버 레이저, 전광 변환 효율 높고 운영비 낮음",
      "- 고정밀 대리석 + 열처리 강재 구조로 장기 안정성 확보",
      "- 빔 품질 우수, 무정비 수명 최대 10만 시간",
      "- 리니어 모터 + 대리석 정반으로 고속·고정밀 운전",
      "- CCD 비전 다중 위치결정 지원",
      "",
      "[적용 분야]",
      "LED 세라믹 기판 드릴링·절단, 자동차·LED 세라믹 회로기판 스크라이빙, 휴대폰 백플레이트·3C 전자, 시계 기어·안경테 정밀 외형 절단, 이어폰 스피커 드릴링",
      "",
      "[가공 소재]",
      "세라믹, 금속, 전자부품 등",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "모델 (Model) | CW-6060J",
      "가공 영역 (Working area) | 600 × 500 mm",
      "위치결정 정밀도 (Positioning) | ±3 µm",
      "레이저 출력 (Laser power) | 100 / 150 / 1,000 W",
      "절단 폭 (Cutting slit width) | 0.05 ~ 0.12 mm",
      "외형 치수 (Overall dimension) | 1,400 × 1,600 × 1,800 mm",
      "전원 (Supply voltage) | AC 380V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-highprec.webp",
    links: [
      ["tech", "cutting"],
      ["tech", "drilling"],
      ["material", "ceramic"],
      ["material", "metalSteel"],
      ["industry", "electronics3c"],
      ["industry", "automotive"],
      ["industry", "semiconductor"],
    ],
    cases: [],
  },
  {
    key: "chanxanFemtoUv",
    itemName: "CW-6050FZ/PZ/Z",
    title: "펨토·피코·나노·UV 레이저 절단기",
    nameEn: "Femtosecond/Picosecond/Nanosecond/UV Laser Cutting Machine",
    model: "CW-6050FZ/PZ/Z",
    icon: "cut",
    description: [
      "펨토·피코·나노·UV 레이저 절단기",
      "초단펄스 UV 피코초 레이저로 열영향부(HAZ)를 최소화한 '냉가공'을 구현하는 정밀 절단기입니다. 중국 CHANXAN(创轩激光)의 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 초단펄스 UV 레이저로 고효율·저열영향 '냉가공' 구현",
      "- 대리석 정반 X/Y축 리니어 모터 구동으로 고속·안정성 확보",
      "- 고화소 CCD 자동 정렬로 정밀 절단·정합",
      "- 대형 텔레센트릭 필드렌즈로 대면적 무이음(single) 가공, 최대 단일 200×200mm",
      "- 고정밀 갈바노미터로 반복 정밀도 1µm",
      "",
      "[적용 분야]",
      "휴대폰·통신·소비자 전자·반도체·연구·바이오의료. 플렉시블 OLED, LCP, PI필름, FPC, 나노골드, 편광필름, FPC 커버필름 등 비금속 복합소재의 정밀 절단·드릴링·에칭",
      "",
      "[가공 소재]",
      "PI필름·FPC·LCP·플렉시블 OLED·편광필름·나노골드 등 비금속 복합소재",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "모델 (Model) | CW-6050FZ/PZ/Z",
      "레이저 출력 (Laser power) | 10 / 30 / 35 W",
      "가공 영역 (Working area) | 500×500 / 600×900 mm (듀얼 테이블 맞춤)",
      "위치결정 정밀도 (Positioning) | ±1 µm",
      "반복 정밀도 (Repeatability) | ±1 µm",
      "외형 치수 (Overall dimension) | 1,700 × 1,600 × 2,200 mm",
      "전원 (Supply voltage) | AC 380V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-femto-uv.webp",
    links: [
      ["tech", "cutting"],
      ["tech", "drilling"],
      ["tech", "etching"],
      ["material", "plastic"],
      ["material", "pcb"],
      ["material", "glass"],
      ["industry", "electronics3c"],
      ["industry", "display"],
      ["industry", "semiconductor"],
      ["industry", "bioHealth"],
    ],
    cases: [],
  },
  {
    key: "chanxanGlass",
    itemName: "CW-6050IPL",
    title: "유리 레이저 절단기",
    nameEn: "Glass Laser Cutting Machine",
    model: "CW-6050IPL",
    icon: "cut",
    description: [
      "유리 레이저 절단기",
      "피코초 레이저로 유리를 치핑(가장자리 깨짐) 없이 고강도로 가공하는 전용 절단기입니다. 중국 CHANXAN(创轩激光)의 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 피코초 레이저로 절단 치핑 작고 절단 후 강도 높으며 열영향부 작음",
      "- 수입 렌즈 광학계로 고품질 빔 전송",
      "- 대리석 정반으로 평면도·내진성 우수, 장기 가공 안정성 확보",
      "- 수입 고속 갈바노미터로 가공 정밀도·장기 안정성 우수",
      "",
      "[적용 분야]",
      "유리 가공: 계기판·디스플레이 패널·사파이어·시계·내마모 스크린·전자부품·반도체 산업",
      "",
      "[가공 소재]",
      "유리, 사파이어 등 취성 소재",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "모델 (Model) | CW-6050IPL",
      "가공 영역 (Working area) | 500 × 500 mm",
      "위치결정 정밀도 (Positioning) | ±3 µm",
      "가공 치핑 (Processing chipping) | ≤ 20 µm",
      "이송 속도 (Moving speed) | 1,000 mm/s",
      "최소 홀 직경 (Min. hole diameter) | 0.2 ~ 1.5 mm",
      "외형 치수 (Overall dimension) | 1,800 × 1,600 × 2,200 mm",
      "전원 (Supply voltage) | AC 380V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-glass.webp",
    links: [
      ["tech", "cutting"],
      ["tech", "drilling"],
      ["material", "glass"],
      ["industry", "display"],
      ["industry", "electronics3c"],
      ["industry", "semiconductor"],
    ],
    cases: [],
  },
  {
    key: "chanxanCxhv",
    itemName: "CX-HV",
    title: "CX-HV 비전 이동 레이저 마킹기",
    nameEn: "Visual Mutual Shift Marking Machine",
    model: "CX-HV",
    icon: "mark",
    description: [
      "CX-HV 비전 이동 레이저 마킹기",
      "비전 시스템과 정밀 이동축으로 수작업 개입을 최소화한 고자동화 레이저 마킹기입니다. 중국 CHANXAN(创轩激光)의 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 이동 마킹으로 수작업 셋업 개입 최소화, 자동화 수준 향상",
      "- 고화소 비전 보조, 반복 위치결정 정밀도 ±0.01mm, 인식 속도 0.01s",
      "- 고정밀 서보 볼스크류 구동, 정밀 콜리메이터 검증으로 ±0.05mm 이내 안정",
      "- 전체 밀폐형 프레임으로 유럽 안전표준 충족",
      "- 비전 시스템이 파이버·UV·CO2·그린 등 모든 마킹 광원과 호환",
      "",
      "[적용 분야]",
      "고급 칩 마킹, 정밀 전자부품 스마트 식별 마킹, 자동차 버튼·비정형 정밀부품 마킹",
      "",
      "[가공 소재]",
      "금속·플라스틱·유리 등 (광원별 상이)",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "모델 (Model) | CX-HV",
      "레이저 출력 (Laser power) | 선택형 (Optional)",
      "가공 영역 (Working area) | 맞춤 제작 (Customizable)",
      "마킹 선속도 (Marking speed) | ≤ 8,000 mm/s",
      "반복 정밀도 (Repeatability) | ±0.002 mm",
      "소비 전력 (Whole power) | 1,200 W",
      "전원 (Supply voltage) | AC 220V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-cxhv.webp",
    links: [
      ["tech", "marking"],
      ["material", "metalSteel"],
      ["material", "plastic"],
      ["material", "glass"],
      ["industry", "electronics3c"],
      ["industry", "automotive"],
      ["industry", "semiconductor"],
    ],
    cases: [],
  },
];
async function ensureChanxanLineupV1(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'chanxan_lineup_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();
  let order = 320;
  for (const p of CHANXAN_PRODUCTS) {
    await sql`INSERT INTO content_items (id, group_key, item_key, name, icon, sort_order, created_at) VALUES (${newId()}, 'lineup', ${p.key}, ${p.itemName}, ${p.icon}, ${order}, ${now}) ON CONFLICT (group_key, item_key) DO NOTHING`;
    await sql`
      INSERT INTO content_pages (group_key, item_key, title, description, spec_table, image_url, model, name_en, is_oem, oem_source, updated_at)
      VALUES ('lineup', ${p.key}, ${p.title}, ${p.description}, ${p.specTable}, ${p.imageUrl}, ${p.model}, ${p.nameEn}, true, ${CHANXAN_OEM_SOURCE}, ${now})
      ON CONFLICT (group_key, item_key) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, spec_table=EXCLUDED.spec_table, image_url=EXCLUDED.image_url, model=EXCLUDED.model, name_en=EXCLUDED.name_en, is_oem=EXCLUDED.is_oem, oem_source=EXCLUDED.oem_source, updated_at=EXCLUDED.updated_at
    `;
    for (const [tg, tk] of p.links) {
      await sql`INSERT INTO content_item_links (from_group, from_key, to_group, to_key) VALUES ('lineup', ${p.key}, ${tg}, ${tk}) ON CONFLICT DO NOTHING`;
    }
    const imgCnt = (await sql`SELECT COUNT(*)::int AS c FROM content_images WHERE group_key='lineup' AND item_key=${p.key}`) as { c: number }[];
    if ((imgCnt[0]?.c ?? 0) === 0) {
      for (let i = 0; i < p.cases.length; i++) {
        await sql`INSERT INTO content_images (id, group_key, item_key, url, caption, sort_order, created_at) VALUES (${newId()}, 'lineup', ${p.key}, ${p.cases[i].url}, ${p.cases[i].caption}, ${i}, ${now})`;
      }
    }
    order += 1;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('chanxan_lineup_v1', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// 의료·바이오 확장: ① 신규 기술 '튜브·관재 레이저 절단'(tubeCutting) 추가,
// ② CHANXAN 의료 솔루션 제품 8종을 설비(lineup)에 등록(바이오의료헬스 산업 연결).
const TUBE_CUTTING_DESC = [
  "튜브·관재 레이저 절단 (Tube / Pipe Laser Cutting)",
  "가는 금속 튜브(관재)를 레이저로 정밀 절단·패턴 가공하는 기술입니다. 심혈관 스텐트, 카테터, 주사침(니들) 등 의료기기 제조의 핵심 공정으로, 비접촉·저변형으로 미세 형상을 구현합니다.",
  "",
  "[기술 원리]",
  "회전축 위에서 튜브를 돌리며 파이버·초단펄스 레이저로 관 벽을 따라 절단·천공해, 스텐트의 메시(mesh) 구조나 미세 슬롯·홀을 형성합니다.",
  "",
  "[가공 가능 재료]",
  "니티놀(Ni-Ti)·스테인리스(304·316L)·티타늄·코발트합금·순철·마그네슘합금 등 금속 튜브, 일부 플라스틱 관재",
  "",
  "[장점]",
  "- 비접촉·저열영향으로 미세 벽두께 튜브를 변형 없이 가공",
  "- 좁은 절단폭(수십 µm)과 높은 반복 정밀도",
  "- 복잡한 스텐트 메시·슬롯 패턴을 자유롭게 구현",
  "",
  "[적용 시 유의사항]",
  "- 재료·벽두께별 파라미터 최적화와 버(burr)·슬래그 후처리 관리",
  "- 미세 흄 배기, 레이저 안전",
  "",
  "[적용 분야]",
  "심혈관·말초 스텐트, 카테터, 주사침·캐뉼라 등 의료기기 정밀 가공",
].join("\n");

const CHANXAN_MED: CkdProduct[] = [
  {
    key: "chanxanMedTubeCut",
    itemName: "박벽 튜브 절단기",
    title: "정밀 박벽 튜브 레이저 절단기",
    nameEn: "Precision Thin-walled Tube Laser Cutting Machine",
    model: "SG Series (Fiber)",
    icon: "cut",
    description: [
      "정밀 박벽 튜브 레이저 절단기",
      "니티놀·스테인리스 등 박벽 금속 튜브를 파이버 레이저로 정밀 절단·천공하는 의료기기 전용 설비입니다. 스텐트·주사침 등 미세 관재 가공에 사용됩니다. 중국 CHANXAN(创轩激光)의 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 부품 단위부터 시스템 단위까지 유연한 맞춤 설계",
      "- 레이저 절단·드릴링(천공) 가공 지원",
      "- 연속 자동 피딩 및 관재 자동 상·하차 옵션",
      "- 정교한 외관·직관적 인터페이스로 조작 간편",
      "",
      "[적용 분야]",
      "심혈관·말초 스텐트, 카테터, 주사침·캐뉼라 등 의료기기 정밀 튜브 가공",
      "",
      "[가공 소재]",
      "304·316L·Ni-Ti(니티놀)·Ti·Al·코발트합금·순철·마그네슘합금 등 금속 튜브",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "가공 영역 (Working area) | 0 ~ 200 mm",
      "위치결정 정밀도 (Positioning) | ±10 µm",
      "최소 절단폭 (Min. cutting seam) | 80 µm",
      "최대 운행 속도 (Max. operating speed) | 200 mm/s",
      "레이저 종류 (Laser type) | 파이버 레이저 (Fiber)",
      "외형 치수 (Overall dimension) | 1,200 × 1,500 × 1,750 mm",
      "전원 (Supply voltage) | AC 220V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-med-tubecut.webp",
    links: [
      ["tech", "cutting"],
      ["tech", "drilling"],
      ["tech", "tubeCutting"],
      ["material", "metalSteel"],
      ["industry", "bioHealth"],
    ],
    cases: [],
  },
  {
    key: "chanxanMedHeartValve",
    itemName: "CW-5030R",
    title: "심장 판막(생체막) 레이저 절단기",
    nameEn: "Heart Valve Cutting Machine",
    model: "CW-5030R",
    icon: "cut",
    description: [
      "심장 판막(생체막) 레이저 절단기",
      "돼지·소 심막 등 의료용 생체 박막을 CO₂ 레이저로 고정밀 절단·개구하는 설비입니다. 중국 CHANXAN(创轩激光)의 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 소형 설계로 생산 공간 절약·비용 절감",
      "- 고정밀 벨트 모듈 가이드 + 경량 레이저 헤드로 고속 연동",
      "- 유효 가공 폭 500×300mm, 304 맞춤 스테인리스 트레이",
      "- 수입 고체(solid-state) 레이저",
      "",
      "[적용 분야]",
      "돼지심/소심 심막 등 의료용 생체 박막의 고정밀 절단·개구",
      "",
      "[가공 소재]",
      "심막 등 의료용 생체 박막 소재",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "모델 (Model) | CW-5030R",
      "레이저 출력 (Laser power) | 30 W",
      "가공 영역 (Working area) | 400 × 300 mm",
      "위치결정 정밀도 (Positioning) | ±0.05 mm",
      "절단 속도 (Cutting speed) | 500 mm/s",
      "레이저 종류 (Laser type) | CO₂ 레이저",
      "외형 치수 (Overall dimension) | 850 × 1,350 × 1,075 mm",
      "전원 (Supply voltage) | AC 220V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-med-heartvalve.webp",
    links: [
      ["tech", "cutting"],
      ["material", "other"],
      ["industry", "bioHealth"],
    ],
    cases: [],
  },
  {
    key: "chanxanMedCcdMark",
    itemName: "의료 CCD 마킹기",
    title: "의료용 CCD 비전 레이저 마킹기",
    nameEn: "CCD Laser Marking Machine (Medical)",
    model: "SG Series",
    icon: "mark",
    description: [
      "의료용 CCD 비전 레이저 마킹기",
      "고화소 CCD 비전으로 자동 인식·정렬·검사하며 의료기기에 로고·문자·2D코드를 마킹하는 설비입니다. 중국 CHANXAN(创轩激光)의 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 소재에 맞춰 UV·그린·파이버·CO₂ 광원 선택",
      "- 고정밀 CCD 자동 인식·위치결정·검출·등급(rating)",
      "- SHOPFLOW·MES·IMS·PMS 등 생산관리 시스템 연동",
      "- 대형·단두·플립·듀얼헤드, 반/완전 자동 등 다양한 모델 맞춤",
      "- 집진·정전기 제거 장치 옵션",
      "",
      "[적용 분야]",
      "혈당계·혈압계·귀체온계·바이오 검사시약 등 의료기기 및 플라스틱·금속 제품의 로고·문자·2D코드 마킹",
      "",
      "[가공 소재]",
      "플라스틱·금속 등 (광원별 상이)",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "레이저 출력 (Laser power) | 5 / 7 / 10 / 15 / 20 W",
      "마킹 범위 (Marking range) | 70 / 105 / 155 / 175 / 210 mm",
      "위치결정 정밀도 (Positioning) | 0.02 mm",
      "스캔 속도 (Scanning speed) | 6,000 ~ 22,000 mm/s",
      "광원 (Laser source) | UV / 그린 / 파이버 / CO₂ 선택",
      "전원 (Supply voltage) | AC 220V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-med-ccdmark.webp",
    links: [
      ["tech", "marking"],
      ["material", "plastic"],
      ["material", "metalSteel"],
      ["industry", "bioHealth"],
      ["industry", "electronics3c"],
    ],
    cases: [],
  },
  {
    key: "chanxanMedTubeMark",
    itemName: "세관 회전 마킹기",
    title: "세관(細管) 회전 레이저 마킹기",
    nameEn: "Rotary Laser Marking Machine for Thin Round Tubes",
    model: "SG Series",
    icon: "mark",
    description: [
      "세관(細管) 회전 레이저 마킹기",
      "가는 원형관(튜브)을 회전시키며 표면에 미세 패턴·눈금을 마킹하는 의료기기 전용 설비입니다. 중국 CHANXAN(创轩激光)의 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 가공 중 정밀 비전 위치결정 시스템",
      "- 극미세 표면에 복잡 패턴 조각, 등경관·이형관·반제품관·소형 평면 기기 가공",
      "- 마킹 선폭 <50µm, 회전 중 관재 반경방향 흔들림(런아웃) <5µm",
      "- 다양한 조합형 정밀 관재 자동 클램핑, 개방형 ECAD·레이저 CAM 소프트웨어",
      "",
      "[적용 분야]",
      "주사침·카테터 등 세관 마킹, 316L·Ni-Ti·Ti·Al·Cu·플라스틱 관재",
      "",
      "[가공 소재]",
      "316L·Ni-Ti·Ti·Al·Cu·플라스틱 등 관재",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "레이저 출력 (Laser power) | 20 / 30 / 50 W",
      "가공 영역 (Working area) | 관재 Φ0.3~Φ16.0 ±0.02mm, 평면 300×300mm",
      "위치결정 정밀도 (Positioning) | ±2 µm",
      "마킹 속도 (Marking speed) | ≤ 7,000 mm/s",
      "외형 치수 (Overall dimension) | 900 × 850 × 1,450 mm",
      "전원 (Supply voltage) | AC 220V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-med-tubemark.webp",
    links: [
      ["tech", "marking"],
      ["tech", "tubeCutting"],
      ["material", "metalSteel"],
      ["industry", "bioHealth"],
    ],
    cases: [],
  },
  {
    key: "chanxanMedCathMark",
    itemName: "CX-05ZRX",
    title: "의료 카테터 레이저 마킹기",
    nameEn: "Medical Catheter Laser Marking Machine",
    model: "CX-05ZRX",
    icon: "mark",
    description: [
      "의료 카테터 레이저 마킹기",
      "UV 레이저로 의료용 플라스틱·고무 카테터 표면에 문자·눈금(스케일)을 저열영향으로 마킹하는 설비입니다. 중국 CHANXAN(创轩激光)의 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 빔 품질 우수·초점 스폿 작아 열영향 작고 탄화 없음",
      "- X축 이동 마킹으로 대형 제품 마킹 범위 확대",
      "- 갈바노 고속 마킹, 카테터 180° 회전 마킹 지원",
      "- 이동 갈바노 헤드 + 회전 지그로 고속 자동 마킹",
      "",
      "[적용 분야]",
      "의료 플라스틱·고무 카테터 표면 마킹·눈금선, 의료기기·식품/의약 포장 식별",
      "",
      "[가공 소재]",
      "TPE·PTFE·TPU·PU·폴리우레탄·나일론·PVC·PP·PEEK·금속·유리 등",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "모델 (Model) | CX-05ZRX",
      "레이저 출력 (Laser power) | 5 / 8 / 10 / 15 W",
      "레이저 파장 (Wavelength) | 355 nm (UV)",
      "레이저 종류 (Laser type) | UV 레이저",
      "가공 영역 (Working area) | 100 × 100 mm (범위 맞춤)",
      "냉각 방식 (Cooling) | 전용 산업 항온 시스템",
      "전원 (Supply voltage) | AC 220V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-med-cathmark.webp",
    links: [
      ["tech", "marking"],
      ["material", "plastic"],
      ["industry", "bioHealth"],
    ],
    cases: [],
  },
  {
    key: "chanxanMedCathDrill",
    itemName: "CX-150S",
    title: "의료 카테터 레이저 드릴링기",
    nameEn: "Medical Catheter Laser Drilling Machine",
    model: "CX-150S",
    icon: "cut",
    description: [
      "의료 카테터 레이저 드릴링기",
      "CO₂ 레이저로 의료용 플라스틱 원형관(카테터) 표면을 천공·마킹하는 설비입니다. 중국 CHANXAN(创轩激光)의 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 수입/고품질 국산 CO₂ RF 레이저, 빔 품질·광전 변환 효율 우수",
      "- 조각 정밀도 높고 마킹 선명, 마모 적고 소모품 불필요",
      "- 긴 수명·안정 출력으로 장시간 연속 가동, 가스 충전 순환 사용",
      "- PLT·PCX·DXF·BMP 파일 지원, 자동 코딩·일련번호·배치·날짜·바코드·QR 마킹",
      "",
      "[적용 분야]",
      "의료용 플라스틱 원형관(카테터) 표면 천공·마킹",
      "",
      "[가공 소재]",
      "TPE·PTFE·TPU 관·PU 관·폴리우레탄·나일론·PVC·PP·PEEK 등",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "모델 (Model) | CX-150S",
      "레이저 출력 (Laser power) | 150 W",
      "레이저 파장 (Wavelength) | 10.64 µm (CO₂)",
      "가공 속도 (Marking speed) | ≤ 7,000 mm/s",
      "반복 정밀도 (Repeatability) | ±0.01 mm",
      "냉각 방식 (Cooling) | 내장 공냉 또는 외장 수냉",
      "전원 (Supply voltage) | AC 220V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-med-cathdrill.webp",
    links: [
      ["tech", "drilling"],
      ["tech", "tubeCutting"],
      ["material", "plastic"],
      ["industry", "bioHealth"],
    ],
    cases: [],
  },
  {
    key: "chanxanMedMicroFast",
    itemName: "CS-0605-V-A",
    title: "미(微)정밀 초고속 레이저 가공 시스템",
    nameEn: "Micro-precision Ultra-fast Laser Processing System",
    model: "CS-0605-V-A",
    icon: "precision",
    description: [
      "미(微)정밀 초고속 레이저 가공 시스템",
      "초단펄스(피코초) 레이저로 생체재료·박막을 열영향 없이 '냉가공'하는 미정밀 가공 시스템입니다. 중국 CHANXAN(创轩激光)의 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 초단펄스 레이저로 고효율·저열영향 '냉가공' 구현",
      "- 대리석 정반 X/Y축 리니어 모터 구동으로 고속·안정성 확보",
      "- 고인식률 CCD 자동 정렬로 정밀 절단·정합",
      "- 수입 레이저·광학계, 전광로 보호로 장시간 안정 가동",
      "",
      "[적용 분야]",
      "단백질 생체재료·TPU 막·전극 절단, 플렉시블 OLED·LCP·PI·FPC 등 정밀 가공",
      "",
      "[가공 소재]",
      "생체재료·TPU·전극·PI·FPC 등 비금속 복합소재",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "모델 (Model) | CS-0605-V-A",
      "레이저 출력 (Laser power) | 30 W",
      "광원 (Light source) | 피코초 (Picosecond)",
      "가공 영역 (Working area) | 500 × 610 mm (듀얼 테이블 맞춤)",
      "위치결정 정밀도 (Positioning) | ±1 µm",
      "절단 속도 (Cutting speed) | ≤ 3,000 mm/s",
      "냉각 방식 (Cooling) | 공냉/수냉",
      "전원 (Supply voltage) | AC 380V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-med-microfast.webp",
    links: [
      ["tech", "cutting"],
      ["tech", "precisionMachining"],
      ["tech", "etching"],
      ["material", "plastic"],
      ["material", "other"],
      ["industry", "bioHealth"],
      ["industry", "electronics3c"],
    ],
    cases: [],
  },
  {
    key: "chanxanMedMetal",
    itemName: "고정밀 금속 절단기",
    title: "고정밀 금속 레이저 절단기",
    nameEn: "High-precision Metal Laser Cutting Machine",
    model: "SG Series (Fiber)",
    icon: "cut",
    description: [
      "고정밀 금속 레이저 절단기",
      "고출력 파이버 레이저로 금속 박판·미세 금속을 고정밀 스크라이빙·절단·천공하는 설비입니다. 니티놀·귀금속·스틸 니들 등 의료·정밀 부품에 적합합니다. 중국 CHANXAN(创轩激光)의 설비로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 국제 일류급 레이저로 빔 품질·절단 품질 우수, 최소 선폭 50µm(소재별)",
      "- 듀얼 스크루·듀얼 모터 구동으로 생산성 향상, 운행 속도 1,000mm/s",
      "- 고속 절단·천공·마킹, 그래픽 배치·첨점 평활 소프트웨어",
      "- 전광로 파이버 전송으로 무정비, 절단 정밀도 ±25µm, 안정성 CPK>1.33",
      "",
      "[적용 분야]",
      "각종 금속 박판·미세 금속 스크라이빙·절단·천공, LED·정밀기계·반도체 제어소자·3C 부품, 니티놀 판·스틸 니들 등",
      "",
      "[가공 소재]",
      "스테인리스·니티놀·귀금속 등 금속 박판",
      "",
      "※ 중국 CHANXAN과의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "레이저 출력 (Laser power) | 1,000 ~ 2,000 W",
      "가공 범위 (Processing range) | 600 × 600 mm",
      "위치결정 정밀도 (Positioning) | ±0.006 mm",
      "절단 속도 (Cutting speed) | ≤ 1,000 mm/s",
      "레이저 종류 (Laser type) | 파이버 레이저 (Fiber)",
      "외형 치수 (Overall dimension) | 1,800 × 1,430 × 1,850 mm",
      "전원 (Supply voltage) | AC 220V ±10% 50Hz",
    ].join("\n"),
    imageUrl: "/images/lineup/chanxan/chanxan-med-metal.webp",
    links: [
      ["tech", "cutting"],
      ["tech", "drilling"],
      ["material", "metalSteel"],
      ["material", "preciousMetal"],
      ["industry", "bioHealth"],
      ["industry", "semiconductor"],
      ["industry", "electronics3c"],
    ],
    cases: [],
  },
];
async function ensureChanxanMedicalV1(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'chanxan_medical_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();
  // ① 신규 기술종류 'tubeCutting'(튜브·관재 레이저 절단) 추가
  await sql`INSERT INTO content_items (id, group_key, item_key, name, icon, sort_order, created_at) VALUES (${newId()}, 'tech', 'tubeCutting', ${"튜브·관재 레이저 절단"}, 'cut', 25, ${now}) ON CONFLICT (group_key, item_key) DO NOTHING`;
  await sql`
    INSERT INTO content_pages (group_key, item_key, title, description, image_url, updated_at)
    VALUES ('tech', 'tubeCutting', ${"튜브·관재 레이저 절단"}, ${TUBE_CUTTING_DESC}, ${"/images/tech/scenes/scene-cutting.webp"}, ${now})
    ON CONFLICT (group_key, item_key) DO UPDATE SET description=EXCLUDED.description, updated_at=EXCLUDED.updated_at
  `;
  // ② 의료 제품 8종 등록
  let order = 340;
  for (const p of CHANXAN_MED) {
    await sql`INSERT INTO content_items (id, group_key, item_key, name, icon, sort_order, created_at) VALUES (${newId()}, 'lineup', ${p.key}, ${p.itemName}, ${p.icon}, ${order}, ${now}) ON CONFLICT (group_key, item_key) DO NOTHING`;
    await sql`
      INSERT INTO content_pages (group_key, item_key, title, description, spec_table, image_url, model, name_en, is_oem, oem_source, updated_at)
      VALUES ('lineup', ${p.key}, ${p.title}, ${p.description}, ${p.specTable}, ${p.imageUrl}, ${p.model}, ${p.nameEn}, true, ${CHANXAN_OEM_SOURCE}, ${now})
      ON CONFLICT (group_key, item_key) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, spec_table=EXCLUDED.spec_table, image_url=EXCLUDED.image_url, model=EXCLUDED.model, name_en=EXCLUDED.name_en, is_oem=EXCLUDED.is_oem, oem_source=EXCLUDED.oem_source, updated_at=EXCLUDED.updated_at
    `;
    for (const [tg, tk] of p.links) {
      await sql`INSERT INTO content_item_links (from_group, from_key, to_group, to_key) VALUES ('lineup', ${p.key}, ${tg}, ${tk}) ON CONFLICT DO NOTHING`;
    }
    order += 1;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('chanxan_medical_v1', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// CHANXAN 산업·의료 설비에 카탈로그의 '가공 샘플(Sample show)' 이미지를 적용사례로 추가.
// 제품에 등록된 사진이 없을 때만 넣어 관리자 업로드분과 중복을 피한다.
const CHANXAN_CASE_IMAGES: { key: string; file: string }[] = [
  { key: "chanxanCw650r", file: "chanxan-cw650r-samples.webp" },
  { key: "chanxanPicoMicro", file: "chanxan-pico-micro-samples.webp" },
  { key: "chanxanHighprec", file: "chanxan-highprec-samples.webp" },
  { key: "chanxanFemtoUv", file: "chanxan-femto-uv-samples.webp" },
  { key: "chanxanGlass", file: "chanxan-glass-samples.webp" },
  { key: "chanxanCxhv", file: "chanxan-cxhv-samples.webp" },
  { key: "chanxanMedCcdMark", file: "chanxan-med-ccdmark-samples.webp" },
  { key: "chanxanMedTubeMark", file: "chanxan-med-tubemark-samples.webp" },
  { key: "chanxanMedTubeCut", file: "chanxan-med-tubecut-samples.webp" },
  { key: "chanxanMedHeartValve", file: "chanxan-med-heartvalve-samples.webp" },
  { key: "chanxanMedMicroFast", file: "chanxan-med-microfast-samples.webp" },
  { key: "chanxanMedMetal", file: "chanxan-med-metal-samples.webp" },
  { key: "chanxanMedCathMark", file: "chanxan-med-cathmark-samples.webp" },
  { key: "chanxanMedCathDrill", file: "chanxan-med-cathdrill-samples.webp" },
];
async function ensureChanxanCasesV1(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'chanxan_cases_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();
  for (const { key, file } of CHANXAN_CASE_IMAGES) {
    const cnt = (await sql`SELECT COUNT(*)::int AS c FROM content_images WHERE group_key='lineup' AND item_key=${key}`) as { c: number }[];
    if ((cnt[0]?.c ?? 0) > 0) continue;
    await sql`INSERT INTO content_images (id, group_key, item_key, url, caption, sort_order, created_at) VALUES (${newId()}, 'lineup', ${key}, ${`/images/lineup/chanxan/cases/${file}`}, ${"가공 샘플 (Processing samples)"}, 0, ${now})`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('chanxan_cases_v1', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// 해외 공급·협업사(중국 Huirui 南京辉锐光电, 난징) 레이저 클래딩 제품 등록 +
// 레이저 클래딩 기술 콘텐츠에 '고속 클래딩·브레이크 디스크' 응용 보강.
const HUIRUI_OEM_SOURCE = "http://www.huirui-tech.com";
const HUIRUI_CLADDING_APPENDIX = [
  "",
  "[고속 레이저 클래딩 · 브레이크 디스크 (응용)]",
  "고속 레이저 클래딩(High-Speed Laser Cladding)은 분말 사용률을 높이고 증착 속도를 크게 끌어올린 공정으로, 자동차 브레이크 디스크의 내마모·내식 코팅에 적용됩니다. 유럽 Euro 7 배출 기준(2026.11.29 시행)이 제동 시 미세먼지(PM) 배출을 규제하면서, 회색 주철 디스크 표면에 클래딩층을 형성하는 방식이 주목받고 있습니다.",
  "- 코팅 구조: 버퍼층 ~100µm + 내마모·내식층 ~250µm(연삭 후 ~200µm), 층간 야금 결합·무균열",
  "- 특성: 경도 ~440HV, 분말 사용률 ~90%, 상층 연삭량 <0.1mm",
  "- 생산성: 레이저 출력에 따라 디스크 1장당 6kW <7분 / 10kW <4분 / 24kW <2.5분",
  "- 응용: 브레이크 디스크 외에도 항공 터빈 블레이드·유압 피스톤로드·밸브 스템·터보차저 로터·압연롤 보수 등",
].join("\n");
const HUIRUI_PRODUCTS: CkdProduct[] = [
  {
    key: "huiruiBrakeDisc",
    itemName: "브레이크 디스크 클래딩",
    title: "고속 레이저 클래딩 브레이크 디스크 시스템",
    nameEn: "High-Speed Laser Cladding System for Brake Disc",
    model: "6 / 10 / 24 kW",
    icon: "clad",
    description: [
      "고속 레이저 클래딩 브레이크 디스크 시스템",
      "회색 주철 브레이크 디스크 표면에 레이저로 금속 분말을 용융·적층해 내마모·내식 코팅층을 형성하는 고속 클래딩 시스템입니다. 유럽 Euro 7 제동 미세먼지(PM) 규제 대응 솔루션으로, 중국 Huirui(南京辉锐光电)의 설비이며 ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 고속 레이저 클래딩으로 높은 증착 속도·분말 사용률(~90%)",
      "- 버퍼층+내마모·내식층의 야금 결합, 무균열·무기공 상층",
      "- 경도 ~440HV, 상층 연삭량 <0.1mm로 후가공 최소화",
      "- 자체 분말·공정 파라미터 데이터베이스, 폐루프 분말 공급 제어",
      "- 온라인 검사(분말-레이저 정렬·분말 유량 등) 지원",
      "",
      "[코팅 구조]",
      "모재(회색 주철) → 버퍼층 ~100µm → 내마모·내식층 ~250µm (연삭 후 ~200µm)",
      "",
      "[적용 분야]",
      "자동차 브레이크 디스크(Euro 7 대응) 내마모·내식 코팅",
      "",
      "[코팅 소재]",
      "In625+WC, 316+TiC, 430+TiC, S.S.+TiC 등 (분말)",
      "",
      "※ 중국 Huirui와의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "레이저 출력 (Laser power) | 6 / 10 / 24 kW (선택)",
      "코팅 구조 (Layer structure) | 버퍼 ~100µm + 내마모·내식 ~250µm (연삭 후 ~200µm)",
      "경도 (Hardness) | ~440 HV",
      "분말 사용률 (Powder usage) | ~90%",
      "디스크 1장 클래딩 시간 (Cycle) | 6kW <7분 / 10kW <4분 / 24kW <2.5분",
      "코팅 소재 (Coating powder) | In625+WC, 316+TiC, 430+TiC 등",
      "적용 (Application) | 브레이크 디스크 (Euro 7 대응)",
    ].join("\n"),
    imageUrl: "/images/lineup/huirui/huirui-brakedisc-cladding.webp",
    links: [
      ["tech", "cladding"],
      ["material", "metalSteel"],
      ["industry", "automotive"],
      ["industry", "machinery"],
    ],
    cases: [],
  },
  {
    key: "huiruiBrakeLine",
    itemName: "클래딩 양산 라인",
    title: "레이저 클래딩 브레이크 디스크 양산 라인",
    nameEn: "High-Speed Laser Cladding Brake Disc Production Line",
    model: "24 kW × 2 Line",
    icon: "machine",
    description: [
      "레이저 클래딩 브레이크 디스크 양산 라인",
      "전처리 검사부터 레이저 클래딩, 양면 연삭, 후처리 검사까지 자동화한 브레이크 디스크 클래딩 양산 라인입니다. 중국 Huirui(南京辉锐光电)의 턴키 라인으로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 24kW 레이저 클래딩 시스템 2기 구성으로 고생산성",
      "- 로봇 상·하차 + 슬라이드 레일 + 온라인 두께 측정 자동화",
      "- 전처리 검사 → 클래딩 → 양면 연삭 → 후처리 검사 통합",
      "- 코어 작업 영역 확장 모듈로 증설 대응",
      "- 생산라인 장비 독자 IP·국산화율 90% 이상, 국내 소재·공정 공급망 구축",
      "",
      "[생산 능력]",
      "듀얼 레이저 기준 연간 약 30만 디스크 (300일 × 18시간 기준)",
      "",
      "[적용 분야]",
      "자동차 브레이크 디스크 대량 클래딩 양산",
      "",
      "※ 중국 Huirui와의 공급·협업 제품입니다. 라인 구성·사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "구성 (Configuration) | 전처리 검사 → 레이저 클래딩 → 양면 연삭 → 후처리 검사 (자동화)",
      "레이저 클래딩 시스템 (Cladding system) | 24 kW × 2",
      "연삭 (Grinding) | 양면 연삭 (~60초)",
      "자동화 (Automation) | 로봇 상·하차, 슬라이드 레일, 온라인 두께 측정",
      "생산 능력 (Throughput) | 약 300,000 디스크/년 (듀얼, 300일×18h)",
      "디스크 사이즈 예 (Disc size) | 외경 345mm, 내경 233mm",
    ].join("\n"),
    imageUrl: "/images/lineup/huirui/huirui-brakedisc-cladding.webp",
    links: [
      ["tech", "cladding"],
      ["material", "metalSteel"],
      ["industry", "automotive"],
    ],
    cases: [],
  },
  {
    key: "huiruiRepair",
    itemName: "클래딩 보수 시스템",
    title: "레이저 클래딩 보수·표면강화 시스템",
    nameEn: "Laser Cladding Repair & Surface Strengthening System",
    model: "LMD / Cladding",
    icon: "clad",
    description: [
      "레이저 클래딩 보수·표면강화 시스템",
      "레이저 금속 적층(LMD)·고속 클래딩으로 고가 부품을 보수·복원하고 표면을 강화하는 시스템입니다. 중국 Huirui(南京辉锐光电)는 중국 최대 산업용 레이저 클래딩 설비 공급사로, ㈜이브이레이저가 국내 공급·기술지원을 담당합니다.",
      "",
      "[주요 특징]",
      "- 레이저 금속 적층(LMD)·고속 클래딩·적층 보수·표면 코팅 대응",
      "- 분말 공급기·클래딩 레이저 헤드·클래딩 노즐·통합 시스템 등 자체 제품군",
      "- 내마모·내식·내열 코팅으로 부품 수명 연장",
      "- 적용 시나리오별 맞춤 구성(로봇 연동 등)",
      "",
      "[적용 분야]",
      "항공 터빈(HPT) 블레이드 보수, 증기터빈 블레이드 보수, 유압 피스톤로드 내식 클래딩, 밸브 스템 보수, 터보차저 로터 보수, 압연롤 온라인 보수, 커팅 픽 내마모 클래딩 등",
      "",
      "[코팅 소재]",
      "인코넬·스텔라이트·탄화물 복합분말 등",
      "",
      "※ 중국 Huirui와의 공급·협업 제품입니다. 사양은 카탈로그 기준이며, 담당자 확인 후 반영됩니다.",
    ].join("\n"),
    specTable: [
      "공정 (Process) | LMD · 고속 클래딩 · 적층 보수 · 표면 코팅",
      "레이저 출력 (Laser power) | 1,000 ~ 6,000 W 급 (사양 선택)",
      "코팅 소재 (Coating material) | 인코넬·스텔라이트·탄화물 복합분말 등",
      "구성 (Components) | 분말 공급기 · 클래딩 레이저 헤드 · 클래딩 노즐 · 통합 시스템",
      "적용 (Application) | 항공·에너지·기계·조선·철강 부품 보수·표면강화",
    ].join("\n"),
    imageUrl: "/images/tech/scenes/scene-surface.webp",
    links: [
      ["tech", "cladding"],
      ["material", "metalSteel"],
      ["industry", "aerospace"],
      ["industry", "machinery"],
      ["industry", "shipbuilding"],
      ["industry", "steel"],
      ["industry", "automotive"],
    ],
    cases: [],
  },
];
async function ensureHuiruiLineupV1(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'huirui_lineup_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();
  // 레이저 클래딩 기술 콘텐츠에 고속 클래딩·브레이크 디스크 응용 섹션 보강(1회 추가)
  await sql`UPDATE content_pages SET description = description || ${HUIRUI_CLADDING_APPENDIX}, updated_at = ${now} WHERE group_key='tech' AND item_key='cladding' AND description NOT LIKE ${"%고속 레이저 클래딩 · 브레이크 디스크%"}`;
  // Huirui 제품 등록
  let order = 360;
  for (const p of HUIRUI_PRODUCTS) {
    await sql`INSERT INTO content_items (id, group_key, item_key, name, icon, sort_order, created_at) VALUES (${newId()}, 'lineup', ${p.key}, ${p.itemName}, ${p.icon}, ${order}, ${now}) ON CONFLICT (group_key, item_key) DO NOTHING`;
    await sql`
      INSERT INTO content_pages (group_key, item_key, title, description, spec_table, image_url, model, name_en, is_oem, oem_source, updated_at)
      VALUES ('lineup', ${p.key}, ${p.title}, ${p.description}, ${p.specTable}, ${p.imageUrl}, ${p.model}, ${p.nameEn}, true, ${HUIRUI_OEM_SOURCE}, ${now})
      ON CONFLICT (group_key, item_key) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, spec_table=EXCLUDED.spec_table, image_url=EXCLUDED.image_url, model=EXCLUDED.model, name_en=EXCLUDED.name_en, is_oem=EXCLUDED.is_oem, oem_source=EXCLUDED.oem_source, updated_at=EXCLUDED.updated_at
    `;
    for (const [tg, tk] of p.links) {
      await sql`INSERT INTO content_item_links (from_group, from_key, to_group, to_key) VALUES ('lineup', ${p.key}, ${tg}, ${tk}) ON CONFLICT DO NOTHING`;
    }
    order += 1;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('huirui_lineup_v1', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// 기술종류별 설명을 A4 1/2~1페이지 분량의 전문 기술자료로 보강(원리·가능재료·장점·
// 단점·유의사항·투자비용·유지보수·관리 등 사용자 관점 정보 포함). 기존 thin 설명 대체.
const RICH_TECH_DESC: Record<string, string> = {
  plasticWelding: [
    "레이저 플라스틱 용접 (Laser Plastic Welding)",
    "투과성 상부 플라스틱과 흡수성 하부 플라스틱을 겹친 뒤 레이저를 조사해, 계면에서 발생한 열로 두 소재를 녹여 접합하는 비접촉 용접 기술입니다. 자동차 부품의 정밀·기밀 접합에 널리 사용됩니다.",
    "",
    "[기술 원리]",
    "상부층을 투과한 레이저가 하부층 표면에서 흡수되어 발열하고, 그 열이 계면으로 전달되어 두 소재가 동시에 용융·접합됩니다. 소재의 투과/흡수 특성(색상·첨가제)이 품질을 좌우합니다.",
    "",
    "[가공 가능 재료]",
    "PP·PA(나일론)·PC·ABS·PMMA·PBT 등 열가소성 플라스틱. 상·하부 소재의 투과율/흡수율 조합이 중요합니다.",
    "",
    "[장점]",
    "- 비접촉·무진동으로 내부 부품 손상 없음",
    "- 버(Burr)·이물·분진이 없어 청정하고 수밀·기밀 우수",
    "- 외관 손상 없는 미려한 접합, 높은 접합 강도",
    "- 자동화·품질검사 연계 용이",
    "",
    "[단점·한계]",
    "- 상·하부 소재의 광학 특성이 맞아야 함(투과/흡수 설계 필요)",
    "- 접합면 밀착이 필요해 지그 정밀도가 요구됨",
    "- 일부 색상(예: 양쪽 흑색) 조합에 제약",
    "",
    "[적용 시 유의사항]",
    "- 설계 단계부터 소재·색상·접합구조를 함께 검토",
    "- 클램핑(가압) 균일성, 소재 로트별 투과율 산포 관리",
    "- 레이저 안전(차폐·보안경) 필수",
    "",
    "[투자·유지보수·관리]",
    "- 투자비용: 중급 수준(파이버/다이오드 레이저 + 스캐너/헤드 + 지그). 자동화·검사 수준에 따라 변동",
    "- 유지보수: 보호창 주기 교체·광학계 청결·칠러 관리. 소모품이 적어 유지비가 낮은 편",
    "- 관리: 소재 투과율 변동 모니터링, 정기 출력 점검",
  ].join("\n"),
  metalWelding: [
    "레이저 금속·알루미늄·동 용접 (Metal Welding)",
    "고출력 레이저로 금속 모재를 국부적으로 용융시켜 접합하는 정밀 용접 기술입니다. 깊고 좁은 용입과 작은 열영향부로 정밀 부품·이종금속 접합에 적합합니다.",
    "",
    "[기술 원리]",
    "집속된 고출력 빔이 금속 표면을 급속 가열·용융하며, 키홀(열전도형/키홀형) 모드로 깊은 용입을 형성합니다. 빔 워블링으로 용융풀을 제어해 기공·스패터를 줄입니다.",
    "",
    "[가공 가능 재료]",
    "탄소강·스테인리스·알루미늄·동·티타늄·니켈합금 등. 동·알루미늄은 고반사라 그린/블루 파장이나 빔 제어가 유리합니다.",
    "",
    "[장점]",
    "- 비접촉·고속·저변형, 깊고 좁은 비드",
    "- 미세·정밀 부품, 이종금속(동-알루미늄 등) 접합 대응",
    "- 자동화·실시간 품질 모니터링 용이",
    "",
    "[단점·한계]",
    "- 고반사·고열전도 금속(동·Al)은 공정 난이도가 높음",
    "- 갭(틈) 관리·지그 정밀도 요구, 보호가스 필요",
    "- 초기 공정 셋업·검증 비용",
    "",
    "[적용 시 유의사항]",
    "- 접합부 갭·표면 상태(산화·오염) 관리",
    "- 보호가스 종류·유량, 초점 위치 최적화",
    "- 흄 배기·레이저 안전 설비 필수",
    "",
    "[투자·유지보수·관리]",
    "- 투자비용: 중상급(고출력 파이버 레이저 + 가공 헤드/로봇 + 흄 배기). 출력·자동화에 따라 상이",
    "- 유지보수: 보호창·노즐 소모품 교체, 광학·칠러 관리",
    "- 관리: 보호가스·흄 배기 상태 점검, 정기 빔 품질 점검",
  ].join("\n"),
  glassWelding: [
    "레이저 유리 용접 (Glass Welding)",
    "초단펄스(피코·펨토초) 레이저로 유리와 유리, 또는 유리-금속을 접착제 없이 직접 접합하는 기술입니다. 투명하고 기밀성이 높은 접합부를 얻습니다.",
    "",
    "[기술 원리]",
    "초단펄스 레이저를 접합 계면에 집속하면 비선형 흡수로 국부 용융이 일어나 두 소재가 결합합니다. 열영향이 극히 작아 균열·변형이 적습니다.",
    "",
    "[가공 가능 재료]",
    "석영·붕규산·소다석회 등 각종 유리, 유리-금속/세라믹 이종 접합.",
    "",
    "[장점]",
    "- 접착제 없는 투명·고기밀 접합",
    "- 국부 가열로 균열·열변형 최소",
    "- 미세·정밀 접합, 청정 공정",
    "",
    "[단점·한계]",
    "- 접합면 밀착도(옵티컬 콘택트) 요구가 높음",
    "- 초단펄스 레이저 등 장비 단가가 높음",
    "- 공정 윈도우가 좁아 정밀 제어 필요",
    "",
    "[적용 시 유의사항]",
    "- 표면 평탄도·청정도 확보(밀착 접합)",
    "- 펄스 에너지·초점 심도 정밀 제어",
    "- 레이저 안전(초단펄스 고피크출력) 관리",
    "",
    "[투자·유지보수·관리]",
    "- 투자비용: 상급(초단펄스 레이저 + 정밀 스테이지/광학)",
    "- 유지보수: 광학계 정렬·청결 관리가 중요",
    "- 관리: 정밀 정반·환경(진동·온도) 관리",
  ].join("\n"),
  cutting: [
    "레이저 절단 (Laser Cutting)",
    "집속된 레이저 빔으로 소재를 녹이거나 기화시켜 절단하는 비접촉 가공입니다. 좁은 절단폭과 매끈한 절단면, 복잡 형상 대응이 강점입니다.",
    "",
    "[기술 원리]",
    "고밀도 빔이 소재를 용융·기화시키고, 어시스트 가스가 용융물을 불어내 절단합니다. 금속은 산소/질소, 비금속은 공기/질소 등을 사용합니다.",
    "",
    "[가공 가능 재료]",
    "탄소강·스테인리스·알루미늄·동 등 금속, 아크릴·PC·필름 등 플라스틱, 목재·종이·직물(비금속은 주로 CO₂).",
    "",
    "[장점]",
    "- 비접촉·고속, 좁은 절단폭과 정밀 형상",
    "- 공구 마모 없음, 복잡 패턴 자유도 높음",
    "- 열영향부가 작고 후가공 최소",
    "",
    "[단점·한계]",
    "- 두꺼운 고반사 금속은 난이도·비용 증가",
    "- 어시스트 가스·소모품 비용",
    "- 절단면 품질은 파라미터 최적화에 의존",
    "",
    "[적용 시 유의사항]",
    "- 재료·두께별 파워/속도/가스 최적화",
    "- 노즐·초점 위치 관리, 흄·분진 배기",
    "- 가연성 소재 화재·레이저 안전 관리",
    "",
    "[투자·유지보수·관리]",
    "- 투자비용: 중상급(파이버/CO₂ 레이저 + 커팅 헤드/모션). 출력·크기에 따라 상이",
    "- 유지보수: 노즐·보호창·렌즈 소모품, 가스 공급 관리",
    "- 관리: 광학 청결·초점 교정, 배기 필터 교체",
  ].join("\n"),
  drilling: [
    "레이저 드릴링 (Laser Drilling)",
    "레이저로 미세하고 종횡비가 높은 구멍을 비접촉·고속으로 가공하는 기술입니다. 공구 마모가 없고 미세·고정밀 홀 가공에 유리합니다.",
    "",
    "[기술 원리]",
    "펄스 레이저가 소재를 순간적으로 용융·기화(어블레이션)시켜 구멍을 형성합니다. 타격(Percussion)·트레판(Trepanning)·헬리컬 방식으로 홀 크기·품질을 제어합니다.",
    "",
    "[가공 가능 재료]",
    "금속(스테인리스·초합금), 세라믹, PCB(수지·동박), 실리콘, 유리 등.",
    "",
    "[장점]",
    "- 비접촉·무공구마모, 미세·고종횡비 홀",
    "- 고속 대량 천공, 경사홀·이형홀 대응",
    "- 다양한 난가공 소재 적용",
    "",
    "[단점·한계]",
    "- 테이퍼(홀 경사)·리캐스트층 관리 필요",
    "- 초고정밀은 초단펄스 등 고가 장비 요구",
    "- 두께·소재에 따라 생산성 편차",
    "",
    "[적용 시 유의사항]",
    "- 홀 품질(테이퍼·버·열영향) 기준 설정",
    "- 가공 방식·어시스트 가스 선택",
    "- 분진 배기·레이저 안전 관리",
    "",
    "[투자·유지보수·관리]",
    "- 투자비용: 중상급(펄스/UV/초단펄스 + 정밀 스캐너)",
    "- 유지보수: 광학계·스캐너 교정, 보호창 교체",
    "- 관리: 초점·빔 품질 점검, 배기 관리",
  ].join("\n"),
  marking: [
    "레이저 마킹 (Laser Marking)",
    "레이저로 표면을 변색·각인·조각하여 로고·일련번호·바코드·QR 등을 반영구적으로 표시하는 기술입니다. 잉크·소모품 없이 친환경적입니다.",
    "",
    "[기술 원리]",
    "빔이 표면층을 변색(어닐링)·용융·제거(어블레이션)시켜 대비를 형성합니다. 파장(파이버/UV/CO₂)과 파라미터로 소재별 최적 마킹을 구현합니다.",
    "",
    "[가공 가능 재료]",
    "금속·플라스틱·세라믹·유리·목재·귀금속 등 대부분의 소재(파장 선택 필요).",
    "",
    "[장점]",
    "- 고정밀·반영구, 위·변조 방지",
    "- 비접촉·무소모품(친환경), 고속 처리",
    "- 다양한 소재·2D/3D 곡면 대응",
    "",
    "[단점·한계]",
    "- 소재별 적정 파장 선택 필요(1대로 전 소재 불가)",
    "- 고대비 컬러 마킹은 제약",
    "- 미세 분진·흄 발생(배기 필요)",
    "",
    "[적용 시 유의사항]",
    "- 소재에 맞는 파장·파라미터 설정",
    "- 표면 상태·초점 관리, 배기",
    "- 레이저 안전(스캐너형 산란) 관리",
    "",
    "[투자·유지보수·관리]",
    "- 투자비용: 하중급(파이버 마커 보급형 ~ UV/정밀형). 가장 도입 부담이 낮은 편",
    "- 유지보수: 거의 무소모품(파이버), 보호창·렌즈 청결",
    "- 관리: 스캐너 교정, 배기 필터 점검",
  ].join("\n"),
  etching: [
    "레이저 에칭·스크라이빙 (Laser Etching / Scribing)",
    "레이저로 표면층을 미세하게 제거(어블레이션)해 패턴·질감·홈(스크라이브 라인)을 형성하는 기술입니다. 표면 조도를 바꾸는 점에서 마킹과 구분됩니다.",
    "",
    "[기술 원리]",
    "펄스 레이저가 표면을 얇게 제거하며 요철·패턴을 만듭니다. 스크라이빙은 분리·절단을 위한 미세 홈을 가공하는 방식입니다.",
    "",
    "[가공 가능 재료]",
    "금속·유리·세라믹·실리콘·박막(태양전지·디스플레이) 등.",
    "",
    "[장점]",
    "- 미세 패턴·고정밀, 비접촉·비마모",
    "- 깊이·질감 제어 가능",
    "- 박막 선택적 제거(스크라이빙) 대응",
    "",
    "[단점·한계]",
    "- 깊은 제거는 속도 저하",
    "- 열영향·잔류물 관리 필요",
    "- 초정밀은 초단펄스 요구",
    "",
    "[적용 시 유의사항]",
    "- 깊이·피치 등 패턴 사양 정의",
    "- 분진·잔류물 배기·세정",
    "- 레이저 안전 관리",
    "",
    "[투자·유지보수·관리]",
    "- 투자비용: 중급(파이버/UV ~ 초단펄스)",
    "- 유지보수: 광학·스캐너 교정, 보호창 교체",
    "- 관리: 초점·빔 품질, 배기 관리",
  ].join("\n"),
  cleaning: [
    "레이저 클리닝 (Laser Cleaning)",
    "레이저로 표면의 녹·산화물·도막·오염물을 비접촉으로 제거하는 친환경 세정 기술입니다. 약품·연마재 없이 선택적으로 오염층만 제거합니다.",
    "",
    "[기술 원리]",
    "펄스 레이저가 오염층을 순간 가열·기화시키거나 충격파로 박리합니다. 모재와 오염물의 흡수 차이를 이용해 기판 손상을 최소화합니다.",
    "",
    "[가공 가능 재료]",
    "금속(녹·산화물·오일), 도장면, 용접 전·후 표면, 금형, 문화재 등.",
    "",
    "[장점]",
    "- 비접촉·비마모, 기판 손상 최소",
    "- 약품·폐기물 없는 친환경 공정",
    "- 선택적·국부 세정, 자동화 용이",
    "",
    "[단점·한계]",
    "- 두꺼운 도막은 다중 패스로 속도 저하",
    "- 오염물 종류·두께별 파라미터 조정 필요",
    "- 분진·흄 배기 필요",
    "",
    "[적용 시 유의사항]",
    "- 모재 손상 없는 파라미터 설정(에너지 밀도)",
    "- 분진·흄 집진, 작업자 보호",
    "- 레이저 안전 관리",
    "",
    "[투자·유지보수·관리]",
    "- 투자비용: 중급(펄스 파이버 레이저 + 스캐너/핸드헬드). 휴대형은 상대적으로 저렴",
    "- 유지보수: 거의 무소모품(파이버), 보호창·집진 관리",
    "- 관리: 집진 필터 교체, 광학 청결",
  ].join("\n"),
  heatTreatment: [
    "레이저 열처리 (Laser Heat Treatment · 표면경화)",
    "고출력 레이저로 금속 표면을 급속 가열한 뒤 모재로의 자기냉각(self-quenching)으로 급랭시켜 마르텐사이트 경화층을 형성하는 표면경화 기술입니다.",
    "",
    "[기술 원리]",
    "표면을 오스테나이트화 온도(Ac₃ 이상, 용융 전)까지 가열하면, 빔이 지나간 뒤 열이 내부로 빠르게 확산되어 급랭·경화됩니다. 라인빔으로 넓은 폭을 균일 경화할 수 있습니다.",
    "",
    "[가공 가능 재료]",
    "탄소강·합금강·주철·금형강 등 경화능이 있는 철강계 금속.",
    "",
    "[장점]",
    "- 비접촉·국부 가열로 변형 최소",
    "- 별도 담금질 매체 불필요(자기냉각)",
    "- 부위 선택 경화, 자동화·정밀 제어",
    "",
    "[단점·한계]",
    "- 경화능이 낮은 소재는 효과 제한",
    "- 경화 깊이(보통 0.1~1.5mm)에 한계",
    "- 표면 흡수율 확보(흑화 등) 필요할 수 있음",
    "",
    "[적용 시 유의사항]",
    "- 소재 탄소량·경화능 확인",
    "- 온도(용융 방지) 실시간 피드백 제어",
    "- 레이저 안전 관리",
    "",
    "[투자·유지보수·관리]",
    "- 투자비용: 중상급(고출력 다이오드 레이저 + 모션/로봇 + 온도센서)",
    "- 유지보수: 광학·칠러·온도센서 관리",
    "- 관리: 경도·경화층 품질 주기 점검",
  ].join("\n"),
  cladding: [
    "레이저 클래딩 (Laser Cladding · 코팅)",
    "레이저로 금속 분말·와이어를 모재 표면에 용융·적층해 코팅층을 형성하는 기술입니다. 내마모·내식·내열성을 부여하고 부품을 보수·복원합니다.",
    "",
    "[기술 원리]",
    "레이저가 모재 표면과 공급되는 분말/와이어를 동시에 용융해 야금학적으로 결합된 코팅층을 형성합니다. 급속 냉각으로 치밀한 조직과 낮은 희석율을 얻습니다.",
    "",
    "[가공 가능 재료]",
    "모재: 철강·주철·합금. 코팅재: 스텔라이트·인코넬·탄화물 복합분말 등.",
    "",
    "[장점]",
    "- 내마모·내식·내열 코팅, 높은 접착력",
    "- 낮은 희석율·열변형, 치밀한 조직",
    "- 마모 부품 보수·수명 연장, 복잡 형상 대응",
    "",
    "[단점·한계]",
    "- 공정·분말 비용이 상대적으로 높음",
    "- 후가공(연삭) 필요할 수 있음",
    "- 파라미터·분말 공급 정밀 제어 요구",
    "",
    "[적용 시 유의사항]",
    "- 모재-코팅재 적합성·예열 검토",
    "- 분말 공급·보호가스 안정화",
    "- 분진·흄 배기, 레이저 안전",
    "",
    "[투자·유지보수·관리]",
    "- 투자비용: 상급(고출력 레이저 + 클래딩 헤드/분말공급 + 로봇)",
    "- 유지보수: 분말공급기·노즐·광학 관리",
    "- 관리: 코팅 두께·희석율·결함 품질 점검",
  ].join("\n"),
  soldering: [
    "레이저 솔더링 (Laser Soldering · 납땜)",
    "국부 집속된 레이저 열로 솔더를 녹여 전자부품·기판을 접합하는 비접촉 납땜 기술입니다. 인접 부품 열영향을 최소화하며 재현성 높은 접합부를 형성합니다.",
    "",
    "[기술 원리]",
    "레이저가 솔더·패드를 정확히 가열·용융해 접합합니다. 실시간 온도 피드백으로 과열 없이 일정한 품질을 유지합니다.",
    "",
    "[가공 가능 재료]",
    "PCB·FPC, 커넥터·리드, 카메라모듈·센서 등 전자부품(솔더: 유연/무연).",
    "",
    "[장점]",
    "- 비접촉으로 인두 팁 마모·오염 없음(균일 품질)",
    "- 국부 가열로 열민감·미세피치 부품 대응",
    "- 정밀 온도·시간 제어, 고속 처리",
    "",
    "[단점·한계]",
    "- 접합부 형상·솔더 공급 설계 필요",
    "- 반사·소재별 흡수차 관리",
    "- 초기 공정 셋업 비용",
    "",
    "[적용 시 유의사항]",
    "- 온도 프로파일·플럭스 관리",
    "- 접합부 위치 정밀도·비전 연동",
    "- 흄 배기·레이저 안전",
    "",
    "[투자·유지보수·관리]",
    "- 투자비용: 중급(다이오드/파이버 + 온도센서 + 솔더 공급)",
    "- 유지보수: 광학·온도센서·솔더 공급부 관리",
    "- 관리: 접합 품질(젖음·보이드) 주기 점검",
  ].join("\n"),
  precisionMachining: [
    "레이저 정밀·미세가공 (Precision / Micro Machining)",
    "초단펄스(피코·펨토초) 레이저로 열영향을 최소화하며 마이크로·나노 수준의 패턴·형상을 정밀 가공하는 기술입니다(콜드 어블레이션).",
    "",
    "[기술 원리]",
    "펄스 폭이 극히 짧아 열 확산 전에 소재가 제거되므로 열영향·버가 거의 없는 정밀 가공이 가능합니다.",
    "",
    "[가공 가능 재료]",
    "금속·세라믹·유리·실리콘·폴리머·박막 등 광범위.",
    "",
    "[장점]",
    "- 저열영향(콜드 가공), 버·크랙 최소",
    "- 마이크로·나노 정밀도, 고품질 가공면",
    "- 난가공·취성 소재 대응",
    "",
    "[단점·한계]",
    "- 재료 제거율이 낮아 대량·대면적은 불리",
    "- 초단펄스 장비 단가가 높음",
    "- 정밀 환경(진동·온도) 요구",
    "",
    "[적용 시 유의사항]",
    "- 가공 사양(치수·조도) 정의와 검증",
    "- 초점·빔 품질 정밀 관리",
    "- 레이저 안전(고피크출력) 관리",
    "",
    "[투자·유지보수·관리]",
    "- 투자비용: 상급(초단펄스 레이저 + 정밀 스테이지/스캐너)",
    "- 유지보수: 광학 정렬·청결, 스테이지 교정",
    "- 관리: 환경(온습도·진동) 관리, 빔 품질 점검",
  ].join("\n"),
  print3d: [
    "레이저 3D 프린팅·적층제조 (Additive Manufacturing)",
    "레이저로 금속 분말을 층별로 선택 용융·적층해 3차원 부품을 제조하는 적층제조(LPBF/DED) 기술입니다. 절삭 없이 복잡 형상·경량 구조를 구현합니다.",
    "",
    "[기술 원리]",
    "분말층에 레이저를 조사해 단면을 용융·고화하고, 이를 반복 적층해 부품을 완성합니다(분말베드융해 LPBF, 지향성에너지증착 DED 등).",
    "",
    "[가공 가능 재료]",
    "스테인리스·공구강·Ti·Al·Ni합금 등 금속 분말.",
    "",
    "[장점]",
    "- 복잡 형상·내부 유로·경량화 구현",
    "- 소량·맞춤형·보수(DED)에 유리",
    "- 재료 활용 효율, 설계 자유도",
    "",
    "[단점·한계]",
    "- 생산 속도·빌드 크기 제약, 단가 높음",
    "- 후처리(열처리·표면·서포트 제거) 필요",
    "- 분말 취급·품질 관리 난이도",
    "",
    "[적용 시 유의사항]",
    "- 소재·공정 파라미터 검증, 후처리 계획",
    "- 분말 취급 안전(비활성 분위기·분진)",
    "- 레이저 안전 관리",
    "",
    "[투자·유지보수·관리]",
    "- 투자비용: 상급(금속 AM 장비 + 분말·후처리 인프라)",
    "- 유지보수: 광학·리코터·필터·불활성가스 관리",
    "- 관리: 분말 재활용·품질, 빌드 품질 모니터링",
  ].join("\n"),
};
async function ensureTechDescRichV1(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'tech_desc_rich_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();
  for (const [key, desc] of Object.entries(RICH_TECH_DESC)) {
    await sql`
      INSERT INTO content_pages (group_key, item_key, description, updated_at)
      VALUES ('tech', ${key}, ${desc}, ${now})
      ON CONFLICT (group_key, item_key) DO UPDATE SET description = EXCLUDED.description, updated_at = EXCLUDED.updated_at
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('tech_desc_rich_v1', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// 레이저 안전 카테고리(별도): laservision 협력 기반 제품군 설명 + 표준 사양서 + 대표이미지.
const SAFETY_CONTENT: Record<string, { title: string; img: string; desc: string; spec: string }> = {
  safetyEyewear: {
    title: "레이저 안전 보안경 (Laser Safety Eyewear)", img: "safety-eyewear",
    desc: [
      "사용하는 레이저의 파장·출력에 맞춰 눈을 보호하는 레이저 안전 보안경입니다. 글라스·폴리카보네이트·박막 필터로 특정 파장을 차단하면서도 작업에 필요한 가시광은 확보합니다.",
      "", "[특징]",
      "- 레이저 파장별 맞춤 선택(UV ~ Far-IR)",
      "- 글라스/고글/페이스실드/헬멧 등 다양한 형태",
      "- 국제 표준(EN 207/208, ANSI Z136) 준수",
      "", "[적용] 레이저 가공·연구·의료 등 레이저를 다루는 모든 작업 환경",
    ].join("\n"),
    spec: [
      "제품 유형(Type) | 글라스 / 고글 / 페이스실드 / 헬멧",
      "적용 표준(Standards) | EN 207 · EN 208 · ANSI Z136",
      "보호 파장(Protected wavelength) | UV ~ Far-IR (레이저별 선택)",
      "광학 밀도(Optical Density, OD) | 파장별 L-rating(LB) 표기",
      "가시광 투과율(VLT) | 제품별 상이",
      "필터 소재(Filter) | 글라스 / 폴리카보네이트 / 박막",
      "인증(Certification) | CE 등",
    ].join("\n"),
  },
  safetyWindow: {
    title: "레이저 안전 윈도우 (Viewing Window)", img: "safety-window",
    desc: [
      "레이저 가공 공간을 안전하게 들여다볼 수 있는 레이저 차단 관찰창입니다. 특정 파장을 차단해 외부 작업자·관찰자를 보호하면서 내부 공정을 확인할 수 있습니다.",
      "", "[특징]",
      "- 레이저 파장별 차단, 공정 관찰 가능",
      "- 장비 커버·격실·인클로저에 적용",
      "- 맞춤 크기 제작",
      "", "[적용] 레이저 장비 커버·격실, 클린룸·연구실 관찰창",
    ].join("\n"),
    spec: [
      "적용 표준(Standards) | EN 207",
      "보호 파장(Protected wavelength) | 레이저별 선택",
      "광학 밀도(Optical Density, OD) | 파장별 표기",
      "가시광 투과율(VLT) | 제품별 상이",
      "크기(Size) | 맞춤 제작",
      "프레임(Frame) | 알루미늄 등",
    ].join("\n"),
  },
  safetyBarrier: {
    title: "레이저 안전 차폐 — 커튼·배리어·인클로저", img: "safety-barrier",
    desc: [
      "레이저 작업 구역을 물리적으로 구획해 산란·반사 레이저로부터 주변을 보호하는 차폐 솔루션입니다. 커튼·배리어·인클로저 형태로 작업 환경에 맞게 구성합니다.",
      "", "[특징]",
      "- 난연 특수소재로 레이저 차폐",
      "- 커튼/이동식 배리어/고정 인클로저 구성",
      "- 작업 공간에 맞춘 맞춤 제작",
      "", "[적용] 레이저 작업셀 구획, 생산라인·연구실 안전 구역",
    ].join("\n"),
    spec: [
      "제품 유형(Type) | 커튼 / 배리어 / 인클로저",
      "적용 표준(Standards) | EN 12254",
      "보호 파장(Protected wavelength) | 레이저별 선택",
      "내조사 정격(Rating) | 조사 시간·파워 정격",
      "소재(Material) | 난연 특수소재",
      "크기(Size) | 맞춤 제작",
    ].join("\n"),
  },
  safetySign: {
    title: "레이저 안전 표지 (Signs & Labels)", img: "safety-sign",
    desc: [
      "레이저 등급과 위험을 알리는 경고 표지·라벨입니다. 국제 표준에 따라 레이저 구역·장비에 부착해 작업자 안전과 규정 준수를 돕습니다.",
      "", "[특징]",
      "- 레이저 등급(Class)·위험 표시",
      "- 국제 표준(ANSI Z136, IEC 60825) 준수",
      "- 표준/맞춤 규격, 국·영문 제작",
      "", "[적용] 레이저 장비·출입문·작업구역 표시",
    ].join("\n"),
    spec: [
      "적용 표준(Standards) | ANSI Z136 · IEC 60825",
      "표시 등급(Laser Class) | Class 1 ~ 4",
      "소재(Material) | PVC / 알루미늄 등",
      "규격(Size) | 표준 / 맞춤",
      "언어(Language) | 국문 / 영문 등",
    ].join("\n"),
  },
};
async function ensureSafetyCategoryV1(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'safety_category_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();
  const base = "/images/safety/";
  let order = 0;
  for (const [key, c] of Object.entries(SAFETY_CONTENT)) {
    // 항목(content_items)도 선등록 — 목록/상세에서 바로 표시되도록.
    const icon = key === "safetyEyewear" ? "safety" : key === "safetyWindow" ? "glass" : key === "safetyBarrier" ? "shield" : "alert";
    const name = { safetyEyewear: "레이저 안전 보안경", safetyWindow: "레이저 안전 윈도우", safetyBarrier: "레이저 안전 차폐(커튼·배리어)", safetySign: "레이저 안전 표지" }[key] ?? key;
    await sql`INSERT INTO content_items (id, group_key, item_key, name, icon, sort_order, created_at) VALUES (${newId()}, 'safety', ${key}, ${name}, ${icon}, ${order}, ${now}) ON CONFLICT (group_key, item_key) DO NOTHING`;
    await sql`
      INSERT INTO content_pages (group_key, item_key, title, description, spec_table, image_url, updated_at)
      VALUES ('safety', ${key}, ${c.title}, ${c.desc}, ${c.spec}, ${base + c.img + ".webp"}, ${now})
      ON CONFLICT (group_key, item_key) DO UPDATE SET
        description = CASE WHEN content_pages.description IS NULL OR content_pages.description = '' THEN EXCLUDED.description ELSE content_pages.description END,
        spec_table = CASE WHEN content_pages.spec_table IS NULL OR content_pages.spec_table = '' THEN EXCLUDED.spec_table ELSE content_pages.spec_table END,
        image_url = EXCLUDED.image_url, updated_at = EXCLUDED.updated_at
    `;
    order++;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('safety_category_v1', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// 재료별 콘텐츠: 각 재료의 레이저 가공 설명 + 대표이미지(자작·라이선스 자유) 등록.
// 설명은 비어 있을 때만 채우고(관리자 작성 보존), 이미지는 항상 지정한다.
const MATERIAL_CONTENT: Record<string, { title: string; img: string; desc: string }> = {
  metalSteel: { title: "금속·철강", img: "mat-metal", desc: [
    "철강·스테인리스 등 금속은 레이저 가공의 대표 소재입니다. 레이저로 절단·용접·마킹·표면경화·클리닝·클래딩 등 거의 모든 가공이 가능합니다.",
    "", "[레이저 가공 특징]",
    "- 비접촉·저변형으로 정밀 가공, 자동화 용이",
    "- 고출력/적정 파장으로 고반사·고열전도 금속도 안정적으로 가공",
    "", "[주요 적용 기술] 절단 · 용접 · 마킹 · 열처리(표면경화) · 클리닝 · 클래딩",
    "[적용 분야] 자동차 · 기계 · 조선 · 철강 · 금형",
  ].join("\n") },
  copperAluminum: { title: "동·알루미늄", img: "mat-nonferrous", desc: [
    "동·알루미늄은 전기·열전도가 우수하지만 빛 반사가 높아 가공이 까다로운 소재입니다. 적정 파장(그린·블루)과 빔 제어(워블링)로 안정적인 용접·절단이 가능합니다.",
    "", "[레이저 가공 특징]",
    "- 고반사 금속 대응(그린·블루 레이저, 빔 워블링)",
    "- 배터리·전장의 핵심 소재, 이종금속 접합 대응",
    "", "[주요 적용 기술] 용접(탭·버스바) · 절단 · 마킹 · 클리닝",
    "[적용 분야] 배터리(2차전지) · 전기·전자 · 자동차 전장",
  ].join("\n") },
  plastic: { title: "플라스틱", img: "mat-plastic", desc: [
    "플라스틱은 레이저 용접·절단·마킹에 널리 쓰이는 소재입니다. 투과/흡수 특성을 이용한 레이저 플라스틱 용접은 ㈜이브이레이저의 핵심 기술입니다.",
    "", "[레이저 가공 특징]",
    "- 비접촉·무버(Burr)·고기밀 용접",
    "- 깨끗한 절단면과 내구성 높은 마킹",
    "", "[주요 적용 기술] 플라스틱 용접 · 절단 · 마킹",
    "[적용 분야] 자동차 부품(센서·램프·전장) · 의료기기 · 전자",
  ].join("\n") },
  glass: { title: "유리", img: "mat-glass", desc: [
    "유리는 초단펄스 레이저로 절단·용접·마킹·에칭이 가능한 소재입니다. 미세 균열 없이 정밀하게 가공할 수 있습니다.",
    "", "[레이저 가공 특징]",
    "- 초단펄스로 저손상·저균열 정밀 가공",
    "- 접착제 없는 투명 접합(유리 용접)",
    "", "[주요 적용 기술] 유리 용접 · 절단 · 마킹 · 에칭",
    "[적용 분야] 디스플레이 · 광학 · 의료·바이오",
  ].join("\n") },
  ceramic: { title: "세라믹", img: "mat-ceramic", desc: [
    "세라믹은 경도가 높아 기계가공이 어렵지만, 레이저로 절단·드릴링·마킹·미세가공이 가능합니다.",
    "", "[레이저 가공 특징]",
    "- 비접촉으로 취성(깨지기 쉬운) 재료 손상 최소",
    "- 미세·고정밀 가공",
    "", "[주요 적용 기술] 절단 · 드릴링 · 마킹 · 정밀가공",
    "[적용 분야] 반도체 · 전자부품 · 의료",
  ].join("\n") },
  pcb: { title: "PCB", img: "mat-pcb", desc: [
    "PCB(인쇄회로기판)는 레이저 드릴링(비아홀)·마킹·절단·솔더링에 쓰입니다.",
    "", "[레이저 가공 특징]",
    "- 미세 비아홀·고밀도 가공",
    "- 비접촉 정밀 가공으로 열영향 최소",
    "", "[주요 적용 기술] 드릴링 · 마킹 · 절단 · 솔더링",
    "[적용 분야] 전자·반도체 · 자동차 전장",
  ].join("\n") },
  preciousMetal: { title: "귀금속", img: "mat-precious", desc: [
    "금·은 등 귀금속은 레이저로 정밀 마킹·에칭·미세가공·용접이 가능합니다.",
    "", "[레이저 가공 특징]",
    "- 미세·고정밀 가공, 소재 손실 최소",
    "- 반영구적인 마킹·각인",
    "", "[주요 적용 기술] 마킹 · 에칭 · 정밀가공 · 용접",
    "[적용 분야] 주얼리 · 전자 · 의료",
  ].join("\n") },
  wood: { title: "나무(목재)", img: "mat-generic", desc: [
    "목재는 CO₂ 레이저로 절단·조각·마킹이 가능합니다.",
    "", "[주요 적용 기술] 절단 · 마킹(조각)",
    "[적용 분야] 공예 · 인테리어 · 간판",
  ].join("\n") },
  paper: { title: "종이", img: "mat-generic", desc: [
    "종이·필름은 CO₂ 레이저로 정밀 절단·마킹이 가능합니다.",
    "", "[주요 적용 기술] 절단 · 마킹",
    "[적용 분야] 포장 · 라벨 · 인쇄",
  ].join("\n") },
  fabric: { title: "천(옷감)", img: "mat-generic", desc: [
    "직물·섬유는 레이저로 깨끗한 절단과 가장자리 융착이 가능합니다.",
    "", "[주요 적용 기술] 절단 · 마킹",
    "[적용 분야] 의류 · 산업용 섬유",
  ].join("\n") },
  leather: { title: "가죽", img: "mat-generic", desc: [
    "가죽은 레이저로 정밀 절단·조각·마킹이 가능합니다.",
    "", "[주요 적용 기술] 절단 · 마킹(조각)",
    "[적용 분야] 패션 · 자동차 내장",
  ].join("\n") },
  rubber: { title: "고무", img: "mat-generic", desc: [
    "고무는 레이저로 절단·마킹·스탬프(인장) 제작이 가능합니다.",
    "", "[주요 적용 기술] 절단 · 마킹",
    "[적용 분야] 산업용 부품 · 인장(스탬프)",
  ].join("\n") },
  other: { title: "기타", img: "mat-generic", desc: [
    "그 외 다양한 소재도 레이저 가공이 가능합니다. 소재 특성과 요구사항에 맞춰 최적의 레이저 공법을 제안해 드립니다.",
    "", "자세한 사항은 문의해 주세요.",
  ].join("\n") },
};
async function ensureMaterialContentV1(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'material_content_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();
  const base = "/images/materials/";
  for (const [key, c] of Object.entries(MATERIAL_CONTENT)) {
    const img = `${base}${c.img}.webp`;
    await sql`
      INSERT INTO content_pages (group_key, item_key, title, description, image_url, updated_at)
      VALUES ('material', ${key}, ${c.title}, ${c.desc}, ${img}, ${now})
      ON CONFLICT (group_key, item_key) DO UPDATE SET
        description = CASE WHEN content_pages.description IS NULL OR content_pages.description = '' THEN EXCLUDED.description ELSE content_pages.description END,
        image_url = EXCLUDED.image_url,
        updated_at = EXCLUDED.updated_at
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('material_content_v1', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// 테스트로 등록된 설비 항목(Djdjd, New 등) 제거 — 항목·페이지·연결·적용사례 이미지 정리.
async function ensureRemoveTestLineupV1(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'remove_test_lineup_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const rows = (await sql`SELECT item_key FROM content_items WHERE group_key='lineup' AND name IN ('Djdjd','New','new','djdjd')`) as { item_key: string }[];
  for (const r of rows) {
    const k = r.item_key;
    await sql`DELETE FROM content_item_links WHERE (from_group='lineup' AND from_key=${k}) OR (to_group='lineup' AND to_key=${k})`;
    await sql`DELETE FROM content_images WHERE group_key='lineup' AND item_key=${k}`;
    await sql`DELETE FROM content_videos WHERE group_key='lineup' AND item_key=${k}`;
    await sql`DELETE FROM content_pages WHERE group_key='lineup' AND item_key=${k}`;
    await sql`DELETE FROM content_items WHERE group_key='lineup' AND item_key=${k}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('remove_test_lineup_v1', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// ── 콘텐츠 마무리: ① 설명 미비 기술 보강 ② 설비 2개 미만 기술에 설비 템플릿 top-up ──
// 설비 템플릿은 표준 사양서(spec_table) + 대분류 가공장면 이미지 + 적용사례1·2·3(로고
// placeholder) + 기술/재료/산업 매핑을 포함한다. 값은 참고용 템플릿이며 관리자가 교정한다.
const TECH_SCENE: Record<string, string> = {
  plasticWelding: "welding", metalWelding: "welding", glassWelding: "welding", soldering: "welding",
  cutting: "cutting", drilling: "cutting", marking: "marking", etching: "marking",
  cleaning: "surface", heatTreatment: "surface", cladding: "surface",
  precisionMachining: "precision", print3d: "precision",
};
// 설명이 비어 있는 기술 보강(관리자가 작성한 내용은 보존 — 빈 경우만 채움)
const TECH_DESC_FILL: Record<string, string> = {
  metalWelding: [
    "레이저 금속·알루미늄·동 용접 (Metal Welding)",
    "",
    "고출력 레이저 빔으로 금속·알루미늄·동 모재를 국부적으로 녹여 접합하는 정밀 용접 기술입니다. 열영향부가 작아 변형이 적고, 깊고 좁은 용입을 얻을 수 있어 정밀 부품과 이종금속 접합에 적합합니다.",
    "",
    "[기술 특징]",
    "- 비접촉·고속·저변형, 깊은 용입과 좁은 비드",
    "- 동·알루미늄 등 이종·고반사 금속 접합 대응(빔 워블링 등)",
    "- 자동화·실시간 품질 모니터링 용이",
    "",
    "[적용 분야]",
    "- 자동차·배터리: 셀/팩 탭·버스바 접합",
    "- 전장·전자 부품, 정밀 금속 부품",
    "",
    "[주요 공정 변수]",
    "레이저 출력, 용접 속도, 초점 위치, 보호가스, 빔 스캐닝(워블링)",
  ].join("\n"),
  glassWelding: [
    "레이저 유리 용접 (Glass Welding)",
    "",
    "초단펄스(피코·펨토초) 레이저로 유리와 유리(또는 유리-금속)를 접착제 없이 직접 접합하는 기술입니다. 접합부가 투명하고 기밀성이 우수합니다.",
    "",
    "[기술 특징]",
    "- 무접착·고기밀 접합, 투명한 접합부",
    "- 국부 가열로 균열·열변형 최소",
    "- 미세·정밀 접합 대응",
    "",
    "[적용 분야]",
    "- 디스플레이·광학부품, 센서 패키징",
    "- 의료·바이오 디바이스",
    "",
    "[주요 공정 변수]",
    "펄스 에너지·반복률, 초점 심도, 접촉 정밀도, 스캔 속도",
  ].join("\n"),
  drilling: [
    "레이저 드릴링 (Laser Drilling)",
    "",
    "레이저로 미세한 구멍을 비접촉·고속으로 가공하는 기술입니다. 공구 마모가 없고, 미세하고 종횡비가 높은 홀을 정밀하게 가공할 수 있습니다.",
    "",
    "[기술 특징]",
    "- 비접촉·무공구마모, 미세·고정밀 홀",
    "- 고속 가공, 다양한 재료 대응",
    "- 타격(Percussion)·트레판(Trepanning) 등 방식 선택",
    "",
    "[적용 분야]",
    "- PCB 비아홀, 반도체",
    "- 연료분사 노즐, 필터·메시, 미세 유로",
    "",
    "[주요 공정 변수]",
    "펄스 에너지, 반복률, 초점 위치, 가공 방식, 어시스트 가스",
  ].join("\n"),
  precisionMachining: [
    "레이저 정밀·미세가공 (Precision / Micro Machining)",
    "",
    "초단펄스 레이저로 열영향을 최소화하며 미세 패턴·형상을 정밀하게 가공하는 기술입니다. 재료 손상 없이 마이크로·나노 수준의 가공이 가능합니다.",
    "",
    "[기술 특징]",
    "- 저열영향(냉간가공)으로 버·열손상 최소",
    "- 마이크로·나노 수준의 정밀도",
    "- 금속·세라믹·유리 등 다양한 소재",
    "",
    "[적용 분야]",
    "- 반도체·디스플레이 공정",
    "- 의료기기, 정밀 전자부품",
    "",
    "[주요 공정 변수]",
    "펄스폭(ps/fs), 펄스 에너지, 스캔 속도, 초점 제어, 반복률",
  ].join("\n"),
  print3d: [
    "레이저 3D 프린팅·적층제조 (Additive Manufacturing)",
    "",
    "레이저로 금속 분말을 선택적으로 용융·적층하여 3차원 부품을 제조하는 적층제조(AM) 기술입니다. 절삭 없이 복잡 형상과 경량 구조를 제작합니다.",
    "",
    "[기술 특징]",
    "- 복잡 형상·경량화(내부 냉각수로 등) 구현",
    "- 소량·맞춤형 생산에 유리",
    "- 재료 활용 효율이 높음",
    "",
    "[적용 분야]",
    "- 항공우주, 의료(임플란트)",
    "- 금형(냉각수로), 고성능 기계부품",
    "",
    "[주요 공정 변수]",
    "레이저 출력, 적층 두께, 스캔 전략, 분말 특성, 예열 온도",
  ].join("\n"),
};
// 설비 템플릿 구성(기술별). names: 설비명 후보, mats/inds: 매핑 키, matText: 사양 표기,
// laser/power/wave/beam/cool: 사양 값, extra: 기술별 추가 사양 행.
type TplCfg = { names: string[]; intro: string; feats: string[]; mats: string[]; matText: string; inds: string[]; laser: string; power: string; wave: string; beam: string; cool: string; extra: [string, string][] };
const TECH_TPL: Record<string, TplCfg> = {
  metalWelding: { names: ["금속 레이저 용접 시스템", "로봇 연동 금속 용접 셀"], intro: "고출력 레이저로 금속·알루미늄·동 모재를 정밀 접합하는 용접 설비입니다.", feats: ["비접촉·고속·저변형 용접", "빔 워블링으로 이종·고반사 금속 대응", "실시간 용접 품질 모니터링"], mats: ["metalSteel", "copperAluminum"], matText: "금속·철강, 동·알루미늄", inds: ["automotive", "battery", "electronics3c", "machinery"], laser: "파이버 레이저 (Fiber)", power: "500 ~ 6,000 W (사양 선택)", wave: "약 1,064 nm", beam: "스캐너 / 가공 헤드(워블링)", cool: "수냉식 (Water Cooling)", extra: [["보호가스(Shielding gas)", "Ar / N₂ (옵션)"]] },
  glassWelding: { names: ["유리 레이저 접합 시스템", "초단펄스 유리 용접 시스템"], intro: "초단펄스 레이저로 유리-유리/유리-금속을 접착제 없이 직접 접합하는 설비입니다.", feats: ["무접착·고기밀 접합", "투명 접합부·저열변형", "미세 정밀 접합"], mats: ["glass", "metalSteel"], matText: "유리, 금속(이종 접합)", inds: ["electronics3c", "display", "bioHealth"], laser: "초단펄스 레이저 (ps/fs)", power: "사양 선택", wave: "약 1,030 / 515 nm", beam: "집광 광학계 / 스캐너", cool: "수냉식 (Water Cooling)", extra: [["펄스폭(Pulse width)", "피코초/펨토초"]] },
  soldering: { names: ["레이저 솔더링 시스템", "인라인 레이저 솔더링 시스템"], intro: "레이저 국부 가열로 전자부품·기판을 비접촉 납땜하는 설비입니다.", feats: ["비접촉·국부 가열(인접부 열영향 최소)", "실시간 온도 피드백", "미세피치·열민감 부품 대응"], mats: ["pcb", "metalSteel"], matText: "PCB, 금속 리드", inds: ["electronics3c", "automotive", "semiconductor"], laser: "다이오드 / 파이버 레이저", power: "사양 선택", wave: "약 915 ~ 1,080 nm", beam: "집광 광학계(온도센서 연동)", cool: "공냉 / 수냉", extra: [["온도 제어(Temp. control)", "실시간 폐루프"]] },
  cutting: { names: ["레이저 정밀 절단 시스템", "고속 레이저 커팅 시스템"], intro: "레이저 빔으로 금속·비금속을 정밀·고속으로 절단하는 설비입니다.", feats: ["비접촉·고속 절단, 좁은 절단폭", "복잡 형상·정밀 가공", "다양한 재료 대응"], mats: ["metalSteel", "copperAluminum", "plastic"], matText: "금속·철강, 동·알루미늄, 플라스틱", inds: ["automotive", "electronics3c", "display"], laser: "파이버 / CO₂ 레이저", power: "사양 선택", wave: "약 1,064 / 10,600 nm", beam: "커팅 헤드 / 갈바노 스캐너", cool: "수냉식 (Water Cooling)", extra: [["어시스트 가스(Assist gas)", "O₂ / N₂ / Air (옵션)"]] },
  drilling: { names: ["레이저 미세 드릴링 시스템", "고속 레이저 천공 시스템"], intro: "레이저로 미세·고종횡비 홀을 비접촉·고속으로 가공하는 설비입니다.", feats: ["비접촉·무공구마모", "미세·고정밀 홀", "타격/트레판 방식 선택"], mats: ["metalSteel", "ceramic", "pcb"], matText: "금속, 세라믹, PCB", inds: ["semiconductor", "electronics3c", "automotive"], laser: "펄스 파이버 / UV 레이저", power: "사양 선택", wave: "약 1,064 / 355 nm", beam: "갈바노 스캐너 / 집광 광학계", cool: "수냉식 (Water Cooling)", extra: [["가공 방식(Method)", "Percussion / Trepanning"]] },
  marking: { names: ["파이버 레이저 마킹 시스템", "3D 레이저 마킹 시스템"], intro: "레이저로 로고·일련번호·바코드 등을 반영구적으로 각인하는 설비입니다.", feats: ["고정밀·반영구 마킹", "잉크·소모품 불필요(친환경)", "금속·플라스틱 등 다양한 소재"], mats: ["metalSteel", "plastic", "preciousMetal"], matText: "금속, 플라스틱, 귀금속", inds: ["automotive", "electronics3c", "bioHealth"], laser: "파이버 / UV / CO₂ 레이저", power: "사양 선택", wave: "약 1,064 / 355 / 10,600 nm", beam: "갈바노 스캐너 (2D/3D)", cool: "공냉식 (Air Cooling)", extra: [["마킹 영역(Field)", "110×110 ~ 300×300 mm (옵션)"]] },
  etching: { names: ["레이저 에칭(어블레이션) 시스템", "정밀 레이저 에칭 시스템"], intro: "레이저로 표면층을 제거해 미세 패턴·질감을 형성하는 에칭(어블레이션) 설비입니다.", feats: ["정밀 패턴·표면 가공", "비접촉·비마모", "금속·유리·세라믹 등 대응"], mats: ["metalSteel", "glass", "ceramic"], matText: "금속, 유리, 세라믹", inds: ["semiconductor", "electronics3c", "display"], laser: "파이버 / UV 레이저", power: "사양 선택", wave: "약 1,064 / 355 nm", beam: "갈바노 스캐너", cool: "공냉 / 수냉", extra: [["해상도(Resolution)", "고해상 패턴 대응"]] },
  cleaning: { names: ["레이저 클리닝 시스템", "휴대형 레이저 세정 시스템"], intro: "레이저로 녹·산화물·도막·오염물을 비접촉·친환경적으로 제거하는 세정 설비입니다.", feats: ["비접촉·비마모, 기판 손상 최소", "약품·폐기물 없는 친환경 공정", "선택적 오염물 제거"], mats: ["metalSteel", "copperAluminum"], matText: "금속·철강, 동·알루미늄", inds: ["automotive", "aerospace", "machinery"], laser: "펄스 파이버 레이저", power: "100 ~ 2,000 W (사양 선택)", wave: "약 1,064 nm", beam: "갈바노 스캐너 / 핸드헬드", cool: "공냉 / 수냉", extra: [["세정 방식(Type)", "고정형 / 휴대형"]] },
  cladding: { names: ["레이저 클래딩(코팅) 시스템", "로봇 연동 레이저 클래딩 셀"], intro: "레이저로 금속 분말·와이어를 모재 표면에 용융·적층해 코팅하는 설비입니다.", feats: ["내마모·내식·내열 코팅", "낮은 희석율·높은 접착력", "부품 보수·수명 연장"], mats: ["metalSteel"], matText: "금속·철강(분말/와이어)", inds: ["automotive", "machinery", "aerospace", "steel"], laser: "고출력 다이오드 / 파이버 레이저", power: "1,000 ~ 6,000 W (사양 선택)", wave: "약 900 ~ 1,080 nm", beam: "클래딩 헤드(분말 공급)", cool: "수냉식 (Water Cooling)", extra: [["분말 공급(Powder feed)", "동축 노즐"]] },
  precisionMachining: { names: ["초단펄스 정밀가공 시스템", "레이저 미세가공 시스템"], intro: "초단펄스 레이저로 열영향을 최소화하며 미세 패턴·형상을 정밀 가공하는 설비입니다.", feats: ["저열영향(냉간가공)", "마이크로·나노 정밀", "다양한 소재 대응"], mats: ["metalSteel", "ceramic", "glass"], matText: "금속, 세라믹, 유리", inds: ["semiconductor", "electronics3c", "bioHealth"], laser: "초단펄스 레이저 (ps/fs)", power: "사양 선택", wave: "약 1,030 / 515 / 343 nm", beam: "고정밀 갈바노 스캐너", cool: "수냉식 (Water Cooling)", extra: [["펄스폭(Pulse width)", "피코초/펨토초"]] },
  print3d: { names: ["금속 3D 프린팅 시스템(LPBF)", "레이저 적층제조 시스템"], intro: "레이저로 금속 분말을 선택적으로 용융·적층해 3차원 부품을 제조하는 적층제조 설비입니다.", feats: ["복잡 형상·경량화 구현", "소량·맞춤 생산", "항공·의료용 고부가 부품"], mats: ["metalSteel", "copperAluminum"], matText: "금속 분말(철강·Ti·Al 등)", inds: ["aerospace", "machinery", "bioHealth"], laser: "파이버 레이저 (단일/다중)", power: "200 ~ 1,000 W (사양 선택)", wave: "약 1,064 nm", beam: "갈바노 스캐너", cool: "수냉식 (Water Cooling)", extra: [["적층 두께(Layer)", "20 ~ 100 ㎛"]] },
};
function buildTplSpec(c: TplCfg): string {
  const rows: [string, string][] = [
    ["레이저 종류(Laser type)", c.laser],
    ["출력(Laser power)", c.power],
    ["파장(Wavelength)", c.wave],
    ["빔전송장치(Beam delivery)", c.beam],
    ["가공 재료(Processable materials)", c.matText],
    ...c.extra,
    ["제어 방식(Control system)", "PLC / PC Control"],
    ["냉각 방식(Cooling)", c.cool],
    ["레이저안전(Laser Safety)", "Class 1 Enclosure (국제표준 준수)"],
    ["전원 사양(Power supply)", "3Φ 380V 50/60Hz (사양 선택)"],
  ];
  return rows.map(([k, v]) => `${k} | ${v}`).join("\n");
}
async function ensureTechContentV4(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'tech_content_v4'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();
  const sceneBase = "/images/tech/scenes/scene-";
  const placeholder = "/images/news/logo-thumb.webp";

  // ① 설명 미비 기술 보강(빈 경우만)
  for (const [key, desc] of Object.entries(TECH_DESC_FILL)) {
    await sql`UPDATE content_pages SET description = ${desc}, updated_at = ${now} WHERE group_key = 'tech' AND item_key = ${key} AND (description IS NULL OR description = '')`;
  }

  // ② 설비 2개 미만 기술에 설비 템플릿 top-up
  const procKeys = Object.keys(TECH_SCENE);
  for (const tech of procKeys) {
    const cfg = TECH_TPL[tech];
    if (!cfg) continue;
    const cntRows = (await sql`SELECT COUNT(*)::int AS c FROM content_item_links WHERE to_group='tech' AND to_key=${tech} AND from_group='lineup'`) as { c: number }[];
    const have = cntRows[0]?.c ?? 0;
    const need = Math.max(0, 2 - have);
    const img = `${sceneBase}${TECH_SCENE[tech]}.webp`;
    let order = 120;
    for (let n = 0; n < need; n++) {
      const key = `tpl_${tech}_${n + 1}`;
      const name = cfg.names[n] ?? cfg.names[0];
      const exists = (await sql`SELECT 1 FROM content_items WHERE group_key='lineup' AND item_key=${key}`) as unknown[];
      if (exists.length > 0) continue;
      const desc = [name, "", cfg.intro, "", "[주요 특징]", ...cfg.feats.map((f) => `- ${f}`), "", "※ 본 페이지의 사양은 참고용 예시 템플릿입니다. 실제 사양·설비 사진은 담당자 확인 후 등록됩니다."].join("\n");
      const spec = buildTplSpec(cfg);
      await sql`INSERT INTO content_items (id, group_key, item_key, name, icon, sort_order, created_at) VALUES (${newId()}, 'lineup', ${key}, ${name}, 'machine', ${order + n}, ${now}) ON CONFLICT (group_key, item_key) DO NOTHING`;
      await sql`
        INSERT INTO content_pages (group_key, item_key, title, description, spec_table, image_url, updated_at)
        VALUES ('lineup', ${key}, ${name}, ${desc}, ${spec}, ${img}, ${now})
        ON CONFLICT (group_key, item_key) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, spec_table=EXCLUDED.spec_table, image_url=EXCLUDED.image_url, updated_at=EXCLUDED.updated_at
      `;
      const links: [string, string][] = [["tech", tech], ...cfg.mats.map((m): [string, string] => ["material", m]), ...cfg.inds.map((i): [string, string] => ["industry", i])];
      for (const [tg, tk] of links) {
        await sql`INSERT INTO content_item_links (from_group, from_key, to_group, to_key) VALUES ('lineup', ${key}, ${tg}, ${tk}) ON CONFLICT DO NOTHING`;
      }
      for (let i = 1; i <= 3; i++) {
        await sql`INSERT INTO content_images (id, group_key, item_key, url, caption, sort_order, created_at) VALUES (${newId()}, 'lineup', ${key}, ${placeholder}, ${`적용사례${i}`}, ${i - 1}, ${now})`;
      }
    }
  }
  await sql`INSERT INTO settings (key, value) VALUES ('tech_content_v4', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// 새로 만든 설비 템플릿(적용사례 이미지가 없던 것)에만 EV Laser 로고를 적용사례
// 1·2·3 placeholder로 넣는다. 기존에 이미지가 등록된 설비는 건드리지 않는다.
// (관리자가 추후 실제 적용사례 사진으로 교체)
const TEMPLATE_EQUIP_KEYS = ["htLineBeam", "htRobotCell"];
async function ensureTemplateCaseImagesV1(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'template_case_images_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();
  const placeholder = "/images/news/logo-thumb.webp";
  for (const key of TEMPLATE_EQUIP_KEYS) {
    const cnt = (await sql`SELECT COUNT(*)::int AS c FROM content_images WHERE group_key='lineup' AND item_key=${key}`) as { c: number }[];
    if ((cnt[0]?.c ?? 0) > 0) continue; // 이미지가 이미 있으면 건너뜀
    for (let i = 1; i <= 3; i++) {
      await sql`
        INSERT INTO content_images (id, group_key, item_key, url, caption, sort_order, created_at)
        VALUES (${newId()}, 'lineup', ${key}, ${placeholder}, ${`적용사례${i}`}, ${i - 1}, ${now})
      `;
    }
  }
  await sql`INSERT INTO settings (key, value) VALUES ('template_case_images_v1', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// 기술 카테고리별 "가공 장면" 대표이미지(자작·라이선스 자유) 적용. 특정 설비가
// 아닌 일반 장면이며, 실제 설비사진은 관리자가 설비별로 업로드해 대체한다.
async function ensureTechSceneImagesV1(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'tech_scene_images_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();
  const base = "/images/tech/scenes/";
  const sceneByKey: Record<string, string> = {
    plasticWelding: "welding", metalWelding: "welding", glassWelding: "welding", soldering: "welding",
    cutting: "cutting", drilling: "cutting",
    marking: "marking", etching: "marking",
    cleaning: "surface", heatTreatment: "surface", cladding: "surface",
    precisionMachining: "precision", print3d: "precision",
  };
  for (const [key, scene] of Object.entries(sceneByKey)) {
    const img = `${base}scene-${scene}.webp`;
    await sql`
      INSERT INTO content_pages (group_key, item_key, image_url, updated_at)
      VALUES ('tech', ${key}, ${img}, ${now})
      ON CONFLICT (group_key, item_key) DO UPDATE SET image_url = EXCLUDED.image_url, updated_at = EXCLUDED.updated_at
    `;
  }
  // 레이저 열처리 설비 템플릿 2종에도 표면처리 장면을 기본 이미지로(관리자 실사진 업로드 전까지).
  for (const k of ["htLineBeam", "htRobotCell"]) {
    await sql`UPDATE content_pages SET image_url = ${base + "scene-surface.webp"}, updated_at = ${now} WHERE group_key = 'lineup' AND item_key = ${k} AND (image_url IS NULL OR image_url = '')`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('tech_scene_images_v1', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// 보정: ① 개념도 이미지 제거(작업 범위에서 제외) ② 설비 사양서를 관리자모드 표준
// 형식(표준 사양서 항목)으로 재작성. 대표 설비사진은 관리자가 직접 업로드한다.
const HT_EQUIP_V2: { key: string; desc: string; spec: string }[] = [
  {
    key: "htLineBeam",
    desc: [
      "레이저 라인빔 표면경화 시스템",
      "",
      "넓은 폭의 라인빔으로 금형 성형면·대면적 부품을 한 번에 균일하게 표면경화하는 시스템입니다.",
      "",
      "[주요 특징]",
      "- 라인빔 방식으로 넓은 폭을 한 번에 균일 경화 → 높은 생산성",
      "- 실시간 온도 피드백(폐루프) 제어로 재현성 높은 경화층 형성",
      "- 비접촉·자기냉각 방식으로 변형 최소, 담금질 매체 불필요",
      "- 다축 스테이지 연동으로 복잡 형상 대응",
      "",
      "※ 본 페이지의 사양은 참고용 예시 템플릿입니다. 실제 사양·설비 사진은 담당자 확인 후 등록됩니다.",
    ].join("\n"),
    spec: [
      "레이저 종류(Laser type) | 고출력 다이오드 레이저 (Diode Laser)",
      "출력(Laser power) | 1,000 ~ 6,000 W (사양 선택)",
      "파장(Wavelength) | 900 ~ 1,080 nm",
      "발진 모드(Oscillation mode) | 연속파(CW)",
      "빔전송장치(Beam delivery) | 라인빔 광학계",
      "최소 선폭·빔사이즈(Min. line width / Spot size) | 라인빔 폭 5 ~ 50 mm (가변)",
      "경화 깊이(Hardening depth) | 0.1 ~ 1.5 mm",
      "가공 재료(Processable materials) | 탄소강·합금강·금형강 등 철강계",
      "제어 방식(Control system) | PLC / PC Control (실시간 온도 폐루프)",
      "냉각 방식(Cooling) | 수냉식 (Water Cooling)",
      "레이저안전(Laser Safety) | Class 1 Enclosure (국제표준 준수)",
      "전원 사양(Power supply) | 3Φ 380V 50/60Hz (사양 선택)",
    ].join("\n"),
  },
  {
    key: "htRobotCell",
    desc: [
      "로봇 연동 레이저 표면경화 셀",
      "",
      "산업용 로봇에 레이저 헤드를 장착해 3차원 곡면·복잡 형상 부품의 부위 선택적 표면경화를 수행하는 셀형 시스템입니다.",
      "",
      "[주요 특징]",
      "- 6축 산업용 로봇 연동으로 3D 곡면·난형상 부품의 국부 경화",
      "- 부위 선택적 경화로 필요한 곳만 정밀 처리",
      "- 비접촉·자기냉각으로 변형 최소",
      "- 자동 로딩/언로딩 연계 및 MES 연동 가능",
      "",
      "※ 본 페이지의 사양은 참고용 예시 템플릿입니다. 실제 사양·설비 사진은 담당자 확인 후 등록됩니다.",
    ].join("\n"),
    spec: [
      "레이저 종류(Laser type) | 고출력 다이오드 레이저 (Diode Laser)",
      "출력(Laser power) | 1,000 ~ 4,000 W (사양 선택)",
      "파장(Wavelength) | 900 ~ 1,080 nm",
      "발진 모드(Oscillation mode) | 연속파(CW)",
      "빔전송장치(Beam delivery) | 광섬유 + 로봇 장착 가공 헤드",
      "가공 영역(Working area) | 6축 로봇 작업 반경 내 (부품 규격에 따름)",
      "경화 깊이(Hardening depth) | 0.1 ~ 1.2 mm",
      "가공 재료(Processable materials) | 탄소강·합금강·주철·금형강 등",
      "제어 방식(Control system) | PLC / PC Control (실시간 온도 폐루프)",
      "냉각 방식(Cooling) | 수냉식 (Water Cooling)",
      "레이저안전(Laser Safety) | Class 1 Enclosure (국제표준 준수)",
      "전원 사양(Power supply) | 3Φ 380V 50/60Hz (사양 선택)",
    ].join("\n"),
  },
];

async function ensureTechContentV2(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'tech_content_v2'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();

  // ① 개념도 이미지 제거 (작업 범위에서 제외)
  await sql`UPDATE content_pages SET image_url = NULL, updated_at = ${now} WHERE group_key = 'tech' AND item_key = 'heatTreatment'`;

  // ② 설비 사양서를 표준 형식(spec_table)으로, 설명에서 [사양] 표 제거
  for (const e of HT_EQUIP_V2) {
    await sql`
      INSERT INTO content_pages (group_key, item_key, title, description, spec_table, updated_at)
      VALUES ('lineup', ${e.key}, '', ${e.desc}, ${e.spec}, ${now})
      ON CONFLICT (group_key, item_key) DO UPDATE SET description = EXCLUDED.description, spec_table = EXCLUDED.spec_table, updated_at = EXCLUDED.updated_at
    `;
  }

  await sql`INSERT INTO settings (key, value) VALUES ('tech_content_v2', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// ── 기술종류 간소화(A안) + 레이저 열처리 콘텐츠·설비 템플릿 등록 ──────────────
// - 의료기기(medical) 기술 항목 제거(산업분야와 중복)
// - 레이저 열처리 설명/개념도 보강
// - 레이저 열처리 교집합에 설비 템플릿 2종 등록(사양서 포함, 추후 관리자 교정)
const HEAT_TREATMENT_DESC = [
  "레이저 열처리 (Laser Heat Treatment · 표면경화)",
  "",
  "쉽게 말해, 금속 표면만 레이저로 순간적으로 달궜다가 스스로 식히며 단단하게 만드는 기술입니다. 기름에 담그는 기존 열처리와 달리 필요한 부위만 비접촉으로 경화해 변형이 거의 없습니다.",
  "",
  "[한눈에 보는 원리]",
  "- 급속 가열 : 라인빔이 표면을 오스테나이트화 온도(Ac₃ 이상)까지 수 밀리초 만에 가열(녹이지 않음)",
  "- 자기냉각(Self-quenching) : 레이저가 지나가면 표면 열이 차가운 내부 금속으로 빠르게 빠져나가며 저절로 급랭",
  "- 경화 : 급랭으로 '마르텐사이트' 조직이 형성되어 표면 경도·내마모성이 크게 향상(경화 깊이 0.1~1.5mm)",
  "",
  "[핵심 장점]",
  "- 비접촉·국부 가열로 열영향부가 작고 변형이 적음",
  "- 별도의 담금질(냉각매체)이 필요 없는 자기냉각 방식 → 공정 간단·친환경",
  "- 라인빔 적용 시 넓은 면을 한 번에 균일 경화 → 생산성 향상",
  "- 부위 선택적 경화·복잡 형상 대응, 자동화 및 정밀 제어 용이, 후가공 최소화",
  "",
  "[적용 분야]",
  "- 자동차 : 캠샤프트·밸브시트·기어·샤프트 등 마찰·구동 부품",
  "- 금형 : 프레스 금형 성형면, 에지·코너 등 마모 취약부 국부 경화로 수명 연장",
  "- 기계·공구 : 가이드레일, 베어링 면, 절삭공구 날부",
  "",
  "[주요 공정 변수]",
  "레이저 출력, 빔 크기·형상(라인빔 폭), 이송(주사) 속도, 표면 흡수율(흑화 처리), 트랙 중첩률, 실시간 온도 피드백",
].join("\n");

// 레이저 열처리 설비 템플릿 2종 (사양서 포함). 값은 참고용 예시이며 관리자가 교정한다.
const HT_EQUIP: { key: string; name: string; desc: string }[] = [
  {
    key: "htLineBeam",
    name: "레이저 라인빔 표면경화 시스템",
    desc: [
      "레이저 라인빔 표면경화 시스템",
      "",
      "넓은 폭의 라인빔으로 금형 성형면·대면적 부품을 한 번에 균일하게 표면경화하는 시스템입니다.",
      "",
      "[주요 특징]",
      "- 라인빔 방식으로 넓은 폭을 한 번에 균일 경화 → 높은 생산성",
      "- 실시간 온도 피드백(폐루프) 제어로 재현성 높은 경화층 형성",
      "- 비접촉·자기냉각 방식으로 변형 최소, 담금질 매체 불필요",
      "- 다축 스테이지 연동으로 복잡 형상 대응",
      "",
      "[사양 (Data Sheet)]",
      "| 항목 | 내용 |",
      "|---|---|",
      "| Laser Type | 고출력 다이오드 레이저 (Diode Laser) |",
      "| Laser Power | 1,000 ~ 6,000 W (사양 선택) |",
      "| Beam Type | 라인빔 / 가변 스폿 |",
      "| Hardening Width | 라인빔 폭 가변 (예: 5 ~ 50 mm) |",
      "| Hardening Depth | 0.1 ~ 1.5 mm |",
      "| Temperature Control | 실시간 온도 피드백 (Closed-loop) |",
      "| Motion | 다축 스테이지 |",
      "| Cooling Type | 수냉식 (Water Cooling) |",
      "| System Control | PLC / PC Control |",
      "| Laser Safety | Class 1 Enclosure (국제표준 준수) |",
      "",
      "※ 본 사양은 참고용 예시 템플릿입니다. 실제 사양은 담당자에게 문의해 주세요.",
    ].join("\n"),
  },
  {
    key: "htRobotCell",
    name: "로봇 연동 레이저 표면경화 셀",
    desc: [
      "로봇 연동 레이저 표면경화 셀",
      "",
      "산업용 로봇에 레이저 헤드를 장착해 3차원 곡면·복잡 형상 부품의 부위 선택적 표면경화를 수행하는 셀형 시스템입니다.",
      "",
      "[주요 특징]",
      "- 6축 로봇 연동으로 3D 곡면·난형상 부품의 국부 경화",
      "- 부위 선택적 경화로 필요한 곳만 정밀 처리",
      "- 비접촉·자기냉각으로 변형 최소",
      "- 자동 로딩/언로딩 연계 및 MES 연동 가능",
      "",
      "[사양 (Data Sheet)]",
      "| 항목 | 내용 |",
      "|---|---|",
      "| Laser Type | 고출력 다이오드 레이저 (Diode Laser) |",
      "| Laser Power | 1,000 ~ 4,000 W (사양 선택) |",
      "| Motion | 6축 산업용 로봇 |",
      "| Beam Type | 가변 스폿 / 라인빔 |",
      "| Hardening Depth | 0.1 ~ 1.2 mm |",
      "| Temperature Control | 실시간 온도 피드백 (Closed-loop) |",
      "| Cooling Type | 수냉식 (Water Cooling) |",
      "| System Control | PLC / PC Control |",
      "| Laser Safety | Class 1 Enclosure (국제표준 준수) |",
      "",
      "※ 본 사양은 참고용 예시 템플릿입니다. 실제 사양은 담당자에게 문의해 주세요.",
    ].join("\n"),
  },
];

async function ensureTechTaxonomyV1(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'tech_taxonomy_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const now = new Date().toISOString();

  // 1) 의료기기(medical) 기술 항목 제거(항목·페이지·연결)
  await sql`DELETE FROM content_item_links WHERE (from_group='tech' AND from_key='medical') OR (to_group='tech' AND to_key='medical')`;
  await sql`DELETE FROM content_pages WHERE group_key='tech' AND item_key='medical'`;
  await sql`DELETE FROM content_items WHERE group_key='tech' AND item_key='medical'`;

  // 2) 레이저 열처리 설명/개념도 보강
  await sql`
    INSERT INTO content_pages (group_key, item_key, title, description, image_url, updated_at)
    VALUES ('tech','heatTreatment','레이저 열처리 (Laser Heat Treatment · 표면경화)', ${HEAT_TREATMENT_DESC}, '/images/tech/laser-heat-treatment.webp', ${now})
    ON CONFLICT (group_key, item_key) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, image_url = EXCLUDED.image_url, updated_at = EXCLUDED.updated_at
  `;

  // 3) 레이저 열처리 교집합 설비 템플릿 2종 등록 + 매핑
  const matKeys = ["metalSteel", "copperAluminum"];
  const indKeys = ["automotive", "machinery", "steel", "precisionMachining"];
  let order = 90;
  for (const e of HT_EQUIP) {
    await sql`
      INSERT INTO content_items (id, group_key, item_key, name, icon, sort_order, created_at)
      VALUES (${newId()}, 'lineup', ${e.key}, ${e.name}, 'heat', ${order}, ${now})
      ON CONFLICT (group_key, item_key) DO NOTHING
    `;
    await sql`
      INSERT INTO content_pages (group_key, item_key, title, description, updated_at)
      VALUES ('lineup', ${e.key}, ${e.name}, ${e.desc}, ${now})
      ON CONFLICT (group_key, item_key) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, updated_at = EXCLUDED.updated_at
    `;
    const links: [string, string][] = [["tech", "heatTreatment"], ...matKeys.map((m): [string, string] => ["material", m]), ...indKeys.map((i): [string, string] => ["industry", i])];
    for (const [toGroup, toKey] of links) {
      await sql`INSERT INTO content_item_links (from_group, from_key, to_group, to_key) VALUES ('lineup', ${e.key}, ${toGroup}, ${toKey}) ON CONFLICT DO NOTHING`;
    }
    order++;
  }

  await sql`INSERT INTO settings (key, value) VALUES ('tech_taxonomy_v1', ${now}) ON CONFLICT (key) DO NOTHING`;
}

// YTN <최강기업> 출연(2025.05.12)을 언론·방송(press)에 한 번만 등록한다.
async function ensureYtnChoikangPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'ytn_choikang_2025_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const link = "https://www.youtube.com/watch?v=lPpvC1Wl5yE&t=6s";
  const thumb = "https://img.youtube.com/vi/lPpvC1Wl5yE/hqdefault.jpg";
  const body = [
    "㈜이브이레이저가 YTN <최강기업>에 방송되었습니다.",
    "\"대한민국 산업계를 이끄는 최강기업들의 생생한 현장 소식을 발빠르게 전하는 YTN <최강기업>\"을 통해, 24년간 이어온 연구와 개발로 완성된 당사의 레이저 응용기술과 품질관리 체계가 소개되었습니다.",
    "이번 방송에서는 자동차 부품의 플라스틱 접합에 적용되는 당사의 레이저 플라스틱 용접 기술과, 고출력 레이저·2D 스캐너·광섬유를 결합한 독자 기술 SSW(Super Scan Welding)의 경쟁력이 조명되었습니다.",
    "아래 링크에서 방송 영상을 시청하실 수 있습니다.",
  ].join("\n\n");
  await sql`
    INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
    VALUES (${newId()}, 'media', 'YTN <최강기업> 출연 — ㈜이브이레이저', 'YTN <최강기업>', '2025.05.12', ${body},
      ${link}, ${null}, ${null}, ${thumb}, true, 0, ${new Date().toISOString()})
  `;
  await sql`INSERT INTO settings (key, value) VALUES ('ytn_choikang_2025_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 기존 동영상자료실에 등록돼 있던 YTN 관련 항목을 언론·방송으로 이관(자료실에서 제거).
async function ensureMoveYtnResourceToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'ytn_resource_moved'`) as { value: string }[];
  if (flag.length > 0) return;
  await sql`DELETE FROM resources WHERE category = 'video' AND (title ILIKE '%YTN%' OR title ILIKE '%최강기업%')`;
  await sql`INSERT INTO settings (key, value) VALUES ('ytn_resource_moved', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 2025.04.15 유튜브 소개 영상을 동영상자료실(resources)에 한 번만 등록한다.
// 구 홈페이지 고객지원>자료실 동영상을 동영상자료실(resources·video)로 한 번만 이관한다.
// 이미 등록된 유튜브(홍보·플라스틱용접)는 제외, 신규 영상만 추가. 설명은 편집 작성.
// 유튜브는 자동 썸네일, 업로드 mp4는 원본 URL로 연결(썸네일은 재생 버튼 placeholder).
async function ensureResourceVideosImport(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'resource_videos_imported_2025'`) as { value: string }[];
  if (flag.length > 0) return;
  const vids: { title: string; desc: string; url: string; date: string; thumbnailUrl?: string }[] = [
    {
      title: "레이저 플라스틱 커팅 (Laser Plastic Cutting) 영상",
      desc: "플라스틱 소재를 레이저로 정밀 절단하는 공정 영상입니다. 버(burr) 없는 깔끔한 절단면과 복잡한 형상 가공을 비접촉 방식으로 구현합니다.",
      url: "https://youtu.be/6O7svx7m--U",
      date: "2025-03-28T00:00:00.000Z",
    },
    {
      title: "레이저 클래딩 (Laser Cladding) 영상",
      desc: "금속 표면에 다른 금속을 레이저로 용융·적층해 내마모성·내식성을 높이는 레이저 클래딩(코팅) 공정 영상입니다.",
      url: "https://youtu.be/vU3OCgT3XJg",
      date: "2025-02-17T00:00:00.000Z",
    },
    {
      title: "알루미늄 다이캐스팅제품 게이트의 레이저절단",
      desc: "알루미늄 다이캐스팅 부품의 게이트(주조 주입구)를 레이저로 정밀 절단하는 공정 영상입니다. 비접촉 가공으로 공구 마모 없이 깔끔한 절단면을 얻으며, 복잡한 형상의 게이트도 고속으로 제거합니다.",
      url: "https://youtu.be/8mH-yVyhBME",
      thumbnailUrl: "/images/resources/video/aluminum-diecasting-gate-laser-cut.webp",
      date: "2025-02-14T00:00:00.000Z",
    },
  ];
  for (const v of vids) {
    const exists = await sql`SELECT 1 FROM resources WHERE url = ${v.url} LIMIT 1`;
    if (exists.length === 0) {
      await sql`
        INSERT INTO resources (id, category, title, description, url, thumbnail_url, created_at)
        VALUES (${newId()}, 'video', ${v.title}, ${v.desc}, ${v.url}, ${v.thumbnailUrl ?? null}, ${v.date})
      `;
    }
  }
  await sql`INSERT INTO settings (key, value) VALUES ('resource_videos_imported_2025', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// "레이저 금속 커팅" 영상을 실제 콘텐츠(알루미늄 다이캐스팅 게이트 레이저절단)로 교체.
// 제목·유튜브 링크·미리보기 이미지를 갱신한다. 기존 mp4 URL 또는 새 유튜브 URL로 매칭.
async function ensureMetalCutVideoUpdate(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'metal_cut_video_updated_2025'`) as { value: string }[];
  if (flag.length > 0) return;
  const oldUrl = "https://evlaser.co.kr/uploaded/board/data/19f0781144ae17a4d1e3c483f016bd550.mp4";
  const newUrl = "https://youtu.be/8mH-yVyhBME";
  const title = "알루미늄 다이캐스팅제품 게이트의 레이저절단";
  const desc =
    "알루미늄 다이캐스팅 부품의 게이트(주조 주입구)를 레이저로 정밀 절단하는 공정 영상입니다. 비접촉 가공으로 공구 마모 없이 깔끔한 절단면을 얻으며, 복잡한 형상의 게이트도 고속으로 제거합니다.";
  const thumb = "/images/resources/video/aluminum-diecasting-gate-laser-cut.webp";
  await sql`
    UPDATE resources
    SET title = ${title}, description = ${desc}, url = ${newUrl}, thumbnail_url = ${thumb}
    WHERE category = 'video' AND url IN (${oldUrl}, ${newUrl})
  `;
  await sql`INSERT INTO settings (key, value) VALUES ('metal_cut_video_updated_2025', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 제46회 용사(Thermal Spray) 기술 워크샵 본문 — 일정표 포함(당사 발표 하이라이트).
// 시드와 운영 DB 갱신 마이그레이션이 동일 내용을 쓰도록 공용 상수로 둔다.
const WS46_BODY = [
  "[행사 개요]",
  "㈜이브이레이저 한상배 대표가 한국용사기술협회(KTSA, Korea Thermal Spray Association)가 주최한 ‘제46회 용사(Thermal Spray) 기술 워크샵’에 발표자로 참가했습니다.",
  "· 행사명 : 제46회 용사(Thermal Spray) 기술 워크샵\n· 일정 : 2022년 6월 9일(목) ~ 6월 10일(금)\n· 장소 : 홍천 소노벨 비발디파크 (강원도 홍천군 서면 한치골길 264)\n· 주최 : 한국용사기술협회(KTSA)",
  "코로나19 방역지침 완화로 사회적 거리두기가 해제되면서 약 2년 만에 정상적으로 개최된 이번 워크샵에는 용사·표면처리 분야 산·학·연 관계자들이 대거 참석해 성황을 이뤘습니다.",
  "[발표 내용 — ㈜이브이레이저 한상배 대표]",
  "㈜이브이레이저 한상배 대표는 ‘고출력 Fiber Laser를 이용한 레이저클래딩 복합 시스템의 개발 및 응용(Multi-purpose Fiber Laser Cladding System and its Application)’을 주제로 발표했습니다.",
  "발표에서는 고출력 파이버 레이저를 기반으로 한 레이저 클래딩 복합 시스템의 구성과 개발 사례, 그리고 다양한 적용 분야를 소개했습니다. 하나의 시스템으로 여러 목적(Multi-purpose)의 클래딩·표면처리를 구현할 수 있는 복합 시스템의 장점과, 마모·부식 방지 및 부품 보수 등 산업 현장에서의 활용 가능성이 공유되어 참석 회원들의 큰 관심을 받았습니다.",
  "㈜이브이레이저는 ‘더 좋은 레이저기술로 더 좋은 세상을 만듭니다(Better Laser Technology makes Better World)’라는 슬로건 아래, 레이저 기반 정밀 가공·표면처리 기술의 경쟁력과 확산 가능성을 강조했습니다.",
  "[워크샵 일정]",
  [
    "■ 2022년 6월 9일(목)",
    "12:30~13:30  참가자 등록",
    "13:20~13:30  환영사 및 한국용사기술협회 총회 보고",
    "〈Session 1〉 좌장 변응선",
    "13:30~13:55  Cold spray 및 Powder bed fusion 공정을 이용한 CoCrFeMnNi 고엔트로피 합금 소재의 제조 및 그 미세조직과 물성 — 이기안 외 / 인하대학교·KIMS",
    "13:55~14:20  고내마모/내부식 application용 철계 비정질 용사코팅 소재의 미세조직 연계 해석을 통한 용사코팅공정 최적화 연구 방향 — 함기수 외 / 코오롱미래기술원·아토메탈테크코리아",
    "14:20~14:45  Synthesis of Spherical Metallic and Ceramic Powders and Their Applications — 백경호 외 / 충남대학교·㈜동양엠더블유",
    "14:45~15:00  coffee break",
    "〈Session 2〉 좌장 양병일",
    "15:00~15:25  Thermal spray for Antimicrobial — 이지운 외 / 아토메탈테크코리아·코오롱미래기술원",
    "15:25~15:50  열가소성 및 열경화성 복합소재 플라스틱의 표면 보호를 위한 대기 플라즈마 코팅 공정을 통한 금속 및 세라믹 적층 — 권한솔 / 한국재료연구원",
    "[[15:50~16:15  고출력 Fiber Laser를 이용한 레이저클래딩 복합 시스템의 개발 및 응용 (Multi-purpose Fiber Laser Cladding System and its Application) — 한상배, 고주섭, 김현준 / ㈜이브이레이저]]",
    "16:15~16:30  coffee break",
    "〈Session 3〉 좌장 윤상훈",
    "16:30~16:55  SPS법을 이용한 yttrium silicates EBC 코팅의 제조 및 특성분석 — 오윤석, 박수민 / 한국세라믹기술원",
    "16:55~17:20  항공발전용 가스터빈 SiC복합체 내환경 코팅 기술 — 문흥수 외 / ㈜세원하드페이싱·한국세라믹기술원·국민대학교",
    "17:20~  기념사진 촬영 및 간친회",
    "■ 2022년 6월 10일(금)",
    "〈Session 4〉 좌장 오윤석",
    "09:00~09:20  Atmospheric plasma spray 공정을 이용한 반도체 공정 장비용 Y2O3, YOF 코팅층의 제조 및 그 미세조직과 화학적 안정성 — 황유진 외 / 인하대·EST",
    "09:20~09:40  Direct energy deposition 적층 제조 공정을 이용한 고탄소 고크롬 공구강의 제조 및 후열처리에 따른 내마모 및 충격 특성 — 박정현 외 / 인하대학교·ADD·맥스로텍·㈜창성",
    "09:40~10:00  스텔라이트계 코팅의 퓨징처리에 따른 미세조직 및 기계적 특성 변화 — 김종섭 외 / 창원대",
    "10:00~10:20  Bond coat 형성 공정에 따른 산화 전후의 코팅층 기계적 특성 평가 — 김준성 외 / 창원대학교",
    "10:20~10:35  coffee break",
    "10:35~10:55  MoSi2-Gd2Zr2O7 열차폐 코팅의 고온 산화거동 및 단열특성 — 강상운, 백경호 / 충남대학교",
    "10:55~11:15  수증기 분위기 하 열처리에 따른 열차폐 코팅의 물성 변화 — 편장혁 외 / 창원대학교",
    "11:15~11:35  플라즈마 용사 몰리브데늄 코팅 반응용기의 고온 용융염 침식 특성 — 김범재 외 / 충남대학교",
    "11:35~  NiCoCrAlY 본드코팅의 첨가원소가 고온 산화 및 기판-모재 상호확산에 미치는 영향 — 김동원 외 / 한국재료연구원·한국공학대학교",
  ].join("\n"),
].join("\n\n");

const WS46_PHOTO3_CAPTION = "제46회 용사기술 워크샵 발표 세션";

// 제46회 용사(Thermal Spray) 기술 워크샵(2022.06.09~10) 발표 소식을
// 논문·학술소식(paper)에 한 번만 등록한다. 행사사진 5장 포함.
async function ensureThermalSprayWs46(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'thermal_spray_ws46_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const title = "제46회 용사(Thermal Spray) 기술 워크샵 발표 — ㈜이브이레이저 한상배 대표";
  const pressId = newId();
  await sql`
    INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
    VALUES (${pressId}, 'paper', ${title}, '한국용사기술협회(KTSA)', '2022.06.09', ${WS46_BODY},
      ${null}, ${null}, ${null}, ${null}, true, 0, ${"2022-06-09T00:00:00.000Z"})
  `;
  const imgs: { url: string; caption: string }[] = [
    { url: "/images/press/ws46/01.webp", caption: "㈜이브이레이저 한상배 대표 발표 현장" },
    { url: "/images/press/ws46/02.webp", caption: "㈜이브이레이저 발표 — ‘더 좋은 레이저기술로 더 좋은 세상을’" },
    { url: "/images/press/ws46/03.webp", caption: WS46_PHOTO3_CAPTION },
    { url: "/images/press/ws46/04.webp", caption: "워크샵 전경" },
    { url: "/images/press/ws46/05.webp", caption: "한국용사기술협회 이사진 확대 개편 안내" },
  ];
  for (let i = 0; i < imgs.length; i++) {
    await sql`
      INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
      VALUES (${newId()}, ${pressId}, ${imgs[i].url}, ${imgs[i].caption}, ${null}, ${i}, ${new Date().toISOString()})
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('thermal_spray_ws46_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 제46회 본문을 실제 일정표 기반으로 다시 작성(당사 발표 하이라이트) → 운영 DB 갱신.
async function ensureWs46Rewrite(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'ws46_body_rewritten_2022'`) as { value: string }[];
  if (flag.length > 0) return;
  await sql`UPDATE press_items SET body = ${WS46_BODY} WHERE category = 'paper' AND date = '2022.06.09'`;
  await sql`UPDATE press_images SET caption = ${WS46_PHOTO3_CAPTION} WHERE url = '/images/press/ws46/03.webp'`;
  await sql`UPDATE press_images SET caption = '㈜이브이레이저 한상배 대표 발표 현장' WHERE url = '/images/press/ws46/01.webp'`;
  await sql`INSERT INTO settings (key, value) VALUES ('ws46_body_rewritten_2022', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 제53회 한국용사기술협회 워크샵(2026.06.17~18, 천안 소노벨) 발표 소식을
// 논문·학술소식(paper)에 한 번만 등록한다. 일정표 포함(당사 발표는 하이라이트), 사진 5장.
async function ensureThermalSprayWs53(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'thermal_spray_ws53_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const title = "제53회 용사(Thermal Spray) 기술 워크샵 발표 — ㈜이브이레이저 한상배 대표 (Laser Cladding)";
  const body = [
    "[행사 개요]",
    "㈜이브이레이저 한상배 대표가 한국용사기술협회(KTSA)가 주최한 ‘제53회 용사(Thermal Spray) 기술 워크샵’에서 레이저 클래딩(Laser Cladding) 기술을 주제로 발표했습니다.",
    "· 행사명 : 제53회 용사(Thermal Spray) 기술 워크샵\n· 일정 : 2026년 6월 17일(수) ~ 6월 18일(목)\n· 장소 : 천안 소노벨\n· 주최 : 한국용사기술협회(KTSA, Korea Thermal Spray Association)",
    "[발표 내용 — ㈜이브이레이저 한상배 대표]",
    "㈜이브이레이저 한상배 대표는 ‘금속와이어를 이용한 레이저클래딩 기술 동향 및 적용사례’를 주제로, 분말공급방식(Powder Cladding)과 와이어공급방식(Wire Cladding)의 원리·특성을 비교하고 각 방식의 최적 적용 분야를 심도 있게 소개했습니다.",
    "발표에서는 Powder Cladding과 Wire Cladding의 원소재 형태, 재료 이용률, 기술적 특징, 장단점, 적용 분야를 항목별로 비교했습니다. 특히 레이저 빔 사이즈 제어를 통한 정밀 적층과 치수 정밀도, 후가공 최소화, 특수합금층 형성 등 레이저 클래딩만의 강점과, 두 공급방식의 실제 공정 시연 영상을 함께 제시해 참석 회원들의 큰 관심을 받았습니다.",
    "㈜이브이레이저는 ‘더 좋은 레이저기술로 더 좋은 세상을 만듭니다(Better Laser Technology makes Better World)’라는 슬로건 아래, 레이저 클래딩 기술이 마모·부식 방지, 금형·부품 보수, 특수 기능성 코팅 등 다양한 산업 분야로 확산될 수 있음을 강조했습니다.",
    "[워크샵 일정]",
    [
      "■ 2026년 6월 17일(수)",
      "13:00~14:00  참가자 등록",
      "14:00~14:20  환영사 및 한국용사기술협회 총회 보고",
      "〈Session 1〉 좌장 오윤석",
      "14:20~14:35  레이저 클래딩 공정 변수가 금속 및 WC계 코팅층의 미세조직 및 기계적 특성에 미치는 영향 분석 — 조재억 / 포항공과대학교",
      "14:35~14:50  다양한 용사코팅 공정을 통해 적층된 FeCrAlY 코팅의 기계적 특성 평가 및 800℃ 산화 거동 분석 — 권한솔 외 / 한국재료연구원",
      "14:50~15:05  Direct Energy Deposition으로 제조된 Fe–Si–Mn–Cr–W 중탄소 공구강에서 분말 산소 함량과 미세조직–기계적 특성 간 상관관계 연구 — 전민수 외 / 인하대학교",
      "15:05~15:20  Heterocoagulation 기법을 통한 YSZ-LZO 복합 분말의 합성 및 특성 평가 — 편장혁 외 / 창원대학교",
      "15:20~15:35  LLM을 활용한 Thermal Spray 연구 동향 분석 — 박훈관 / 한국재료연구원",
      "15:35~16:00  coffee break",
      "〈Session 2〉 좌장 이성훈",
      "16:00~16:15  세원하드페이싱 회사소개 및 개발현황 — 문흥수, 김지유 / 세원하드페이싱",
      "16:15~16:30  기능성 분말을 이용한 건식 디지털 프린팅 기술 개발 — 박순홍 / 옴니코트",
      "[[16:30~16:45  금속와이어를 이용한 레이저클래딩 기술 동향 및 적용사례 — 한상배 / ㈜이브이레이저]]",
      "16:45~17:00  분말을 이용한 레이저클래딩 기술 — Huirui",
      "17:00~17:15  분말공급장치 소개 — JEOL",
      "17:15~  기념사진 촬영, 숙소 체크인 후 간친회",
      "",
      "■ 2026년 6월 18일(목)",
      "〈Session 3〉 좌장 문흥수",
      "09:30~09:45  단일 이미지 기반 용사 코팅층 및 기공 자동 분석 — 전병륜 외 / 한국재료연구원",
      "09:45~10:00  EURO 7 규제 대응 자동차 브레이크용 Fe-Cr 복합 코팅의 딥러닝 기반 마모 패턴 분석 — 박태준 외 / 한국세라믹기술원·고려대학교",
      "10:00~10:15  암모니아 분위기에서 TBC Bond Coat의 질화 거동과 Pre-oxidation 효과 — 백소희 외 / 창원대학교",
      "10:15~10:30  표면 개질을 통한 Y2O3 세라믹의 pre-seasoning 구현 및 특성 평가 — 장해성 외 / 고려대학교·한국세라믹기술원",
      "10:30~10:50  coffee break",
      "〈Session 4〉 좌장 권한솔",
      "10:50~11:05  HVOF 공정으로 제조된 Fe계 metamorphic alloys의 고온 내마모특성 — 원경운 외 / 인하대학교·코오롱인더스트리",
      "11:05~11:20  Failure Behavior and Interfacial Stability of Thermal Barrier Coatings with an Intermediate Layer — 청홍빈 외 / 창원대학교",
      "11:20~11:35  대기 플라즈마 용사 공정에서 플라즈마 제트와 상호작용하는 비행 입자 거동의 수치 및 실험적 연구 — 민병일 외 / 한국재료연구원",
      "11:35~  종합토론 및 폐회",
    ].join("\n"),
  ].join("\n\n");
  const pressId = newId();
  await sql`
    INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
    VALUES (${pressId}, 'paper', ${title}, '한국용사기술협회(KTSA)', '2026.06.17', ${body},
      ${"https://youtu.be/HDma8qDDxek"}, ${null}, ${null}, ${null}, true, 0, ${"2026-06-17T00:00:00.000Z"})
  `;
  const imgs: { url: string; caption: string }[] = [
    { url: "/images/press/ws53/01.webp", caption: "㈜이브이레이저 한상배 대표 발표 — Powder/Wire Cladding 기술 비교" },
    { url: "/images/press/ws53/02.webp", caption: "㈜이브이레이저 한상배 대표 발표 현장" },
    { url: "/images/press/ws53/03.webp", caption: "제53회 용사기술 워크샵 간친회" },
    { url: "/images/press/ws53/04.webp", caption: "제53회 용사기술 워크샵 전경" },
    { url: "/images/press/ws53/05.webp", caption: "Powder Cladding·Wire Cladding 공정 시연 영상 발표" },
  ];
  for (let i = 0; i < imgs.length; i++) {
    await sql`
      INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
      VALUES (${newId()}, ${pressId}, ${imgs[i].url}, ${imgs[i].caption}, ${null}, ${i}, ${new Date().toISOString()})
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('thermal_spray_ws53_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 제28회 고에너지 연구위원회(HiDEC) 연구발표회(2024.07.18~19, 제주 라마다 플라자)
// 발표 소식을 논문·학술소식(paper)에 한 번만 등록한다. 일정표 포함(당사 발표 하이라이트), 사진 5장.
async function ensureHidec28(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'hidec28_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const title = "제28회 고에너지 연구위원회(HiDEC) 연구발표회 발표 — ㈜이브이레이저 한상배 대표 (레이저 펀칭)";
  const body = [
    "[행사 개요]",
    "㈜이브이레이저 한상배 대표가 대한용접접합학회 고에너지연구위원회가 주최한 ‘제28회 고에너지 연구위원회(HiDEC) 연구발표회’에서 발표자로 참가했습니다.",
    "· 행사명 : 제28회 고에너지 연구위원회(HiDEC) 연구발표회\n· 주제 : 미래 산업기술 선도를 위한 고에너지 적용기술\n· 일정 : 2024년 7월 18일(목) ~ 7월 19일(금)\n· 장소 : 제주 라마다 플라자 호텔\n· 주최 : 대한용접접합학회 고에너지연구위원회 (위원장 최해운 교수)",
    "㈜이브이레이저는 이번 행사에 후원사 겸 발표사로 참가했습니다.",
    "[발표 내용 — ㈜이브이레이저 한상배 대표]",
    "㈜이브이레이저 한상배 대표는 ‘3D스캐너와 CO₂레이저를 이용한 차량조명용 반사필름의 레이저펀칭기술 개발사례 연구(A Case Study on the Development of Laser Punching for Vehicle Lighting Using 3D Scanner)’를 주제로 발표했습니다.",
    "이번 발표에서는 차량 조명용 반사필름을 바닥에 고정하지 않고 공중(air)에서 레이저로 펀칭(드릴링·천공)하는 기술 개발 사례가 소개되었습니다. 얇은 필름을 공중 상태에서 가공하는 이 방식은 국내는 물론 전 세계적으로도 시도된 바 없는 매우 높은 난이도의 독자 기술로, 3D 스캐너로 필름의 형상을 실시간 인식하고 CO₂ 레이저로 정밀 펀칭함으로써 열 변형과 접촉 손상을 최소화하는 것이 핵심입니다.",
    "㈜이브이레이저는 ‘더 좋은 레이저기술로 더 좋은 세상을 만듭니다(Better Laser Technology makes Better World)’라는 슬로건 아래, 이번 발표를 통해 레이저 정밀 가공 기술의 새로운 가능성과 차량 조명·전장 부품 분야로의 응용 확산을 제시했습니다.",
    "[연구발표회 일정]",
    [
      "■ 2024년 7월 17일(수)",
      "15:00~17:00  고에너지 산학협력협의회 — 라마다프라자 1층",
      "■ 2024년 7월 18일(목)",
      "12:30~13:10  등록 (아라홀, 8F)",
      "13:10~13:20  인사말씀 — 최해운 교수/위원장",
      "〈Session I〉 좌장 감동혁 박사(생기원)",
      "13:20~13:40  원전 해체시 방사성 오염 물질 제거를 위한 레이저 제염 공정기술 및 전문인력양성 프로그램 안내 — 김종도 교수(한국해양대학교)",
      "13:40~14:00  인텔리전트 센서 - 이모빌리티를 위한 해법 — Jens Reiser(프레씨텍)",
      "14:00~14:20  광학 및 음향 신호 기반의 레이저 용접 특성 분석 및 실시간 품질 검사의 유효성 고찰 — 조용준 박사(모니텍)",
      "14:20~14:40  Coffee break",
      "〈Session II〉 좌장 김용 박사(고기원)",
      "14:40~15:00  초고강도강과 알루미늄합금의 Laser assisted SPR 접합기술 — 이목영 박사(포스코)",
      "[[15:00~15:20  3D스캐너와 CO₂레이저를 이용한 차량조명용 반사필름의 레이저펀칭기술 개발사례 연구 — 한상배 대표 / ㈜이브이레이저]]",
      "15:20~15:40  고망간강 레이저 및 레이저-아크 하이브리드 용접부의 망간 기화 및 인장특성 거동 — 강남현 교수(부산대학교)",
      "15:40~16:00  Coffee break",
      "〈Session III〉 좌장 박창규 교수(서울과기대)",
      "16:00~16:20  E-모빌리티 레이저 기술활용 제조장비 기반 고도화 — 서정 박사(한국기계연구원)",
      "16:20~16:40  파이버 레이저를 이용한 구리용접의 스패터 프리 솔루션 — 오상진 이사(IPG)",
      "16:40~17:00  실시간 용입 깊이 측정을 위한 트럼프 OCT 체크 — 정현섭 팀장(한국트럼프)",
      "17:30~  Reception (제주 앞바다 횟집)",
      "■ 2024년 7월 19일(금)",
      "09:20~10:00  협력위원회 개최 및 기술교류회",
      "10:00~11:00  프로그램 운영위원회",
      "11:10  폐회",
    ].join("\n"),
  ].join("\n\n");
  const pressId = newId();
  await sql`
    INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
    VALUES (${pressId}, 'paper', ${title}, '대한용접접합학회 고에너지연구위원회', '2024.07.18', ${body},
      ${null}, ${null}, ${null}, ${null}, true, 0, ${"2024-07-18T00:00:00.000Z"})
  `;
  const imgs: { url: string; caption: string }[] = [
    { url: "/images/press/hidec28/01.webp", caption: "㈜이브이레이저 한상배 대표 발표 — 반사필름 레이저펀칭 기술" },
    { url: "/images/press/hidec28/02.webp", caption: "㈜이브이레이저 한상배 대표 발표 자료 — 반사필름 레이저펀칭 기술(Abstract)" },
    { url: "/images/press/hidec28/03.webp", caption: "제28회 고에너지 연구위원회(HiDEC) 연구발표회 참석자 단체사진" },
    { url: "/images/press/hidec28/04.webp", caption: "연구발표회 전경" },
    { url: "/images/press/hidec28/05.webp", caption: "제28회 고에너지 연구위원회(HiDEC) 연구발표회 안내 포스터" },
  ];
  for (let i = 0; i < imgs.length; i++) {
    await sql`
      INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
      VALUES (${newId()}, ${pressId}, ${imgs[i].url}, ${imgs[i].caption}, ${null}, ${i}, ${new Date().toISOString()})
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('hidec28_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// HiDEC 제28회 두 번째 사진을 발표 자료(슬라이드)로 교체 → 캡션도 맞게 수정(운영 DB용).
async function ensureHidec28Photo2Caption(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'hidec28_photo2_caption_fixed'`) as { value: string }[];
  if (flag.length > 0) return;
  await sql`
    UPDATE press_images SET caption = '㈜이브이레이저 한상배 대표 발표 자료 — 반사필름 레이저펀칭 기술(Abstract)'
    WHERE url = '/images/press/hidec28/02.webp'
  `;
  await sql`INSERT INTO settings (key, value) VALUES ('hidec28_photo2_caption_fixed', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 인베스트뉴스 인터뷰(#118)를 사내소식 → 언론·방송소식으로 이관한다.
// 인터뷰 사진 2장(191_1·191_2)만 사용, 기사 PDF 첨부(방문객 열람용), 원문 링크 연결.
async function ensureInvestnewsToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'investnews_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const title = "[인터뷰] 레이저 기술로 국내를 넘어 해외로 — ㈜이브이레이저 한상배 대표";
  const body = [
    "㈜이브이레이저 한상배 대표의 인터뷰가 언론에 보도되었습니다.",
    "이번 인터뷰에서는 레이저를 이용한 플라스틱 용접의 원리와 다양한 산업용 레이저 응용 기술이 소개되었으며, 24년간의 연구개발로 신뢰를 쌓아온 ㈜이브이레이저와 이 분야 최고의 베테랑인 한상배 대표가 집중 조명되었습니다.",
    "기사에서는 레이저 기술로 국내 시장을 넘어 해외로 도약하려는 ㈜이브이레이저의 비전과 성장 전략, 준비 중인 신제품 및 향후 계획, 그리고 앞으로의 방향성이 상세히 다뤄졌습니다.",
    "자세한 내용은 아래 ‘원문 보기’ 또는 첨부된 PDF에서 확인하실 수 있습니다.",
  ].join("\n\n");

  // 기존 사내소식(news_items) #118 및 사진 삭제
  const olds = (await sql`SELECT id FROM news_items WHERE title = '인베스트뉴스 대표님 인터뷰 진행'`) as { id: string }[];
  for (const o of olds) {
    await sql`DELETE FROM news_images WHERE news_id = ${o.id}`;
  }
  await sql`DELETE FROM news_items WHERE title = '인베스트뉴스 대표님 인터뷰 진행'`;

  // 언론·방송소식(press) 등록 (중복 방지)
  const exists = (await sql`SELECT id FROM press_items WHERE title = ${title} LIMIT 1`) as { id: string }[];
  if (exists.length === 0) {
    const pressId = newId();
    await sql`
      INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
      VALUES (${pressId}, 'media', ${title}, '핸드메이커', '2025.07.11', ${body},
        ${"https://www.handmk.com/news/articleView.html?idxno=31114"},
        ${"/press/handmk-investnews-2025.pdf"}, ${"핸드메이커_이브이레이저_인터뷰.pdf"}, ${null}, true, 0, ${"2025-07-11T00:00:00.000Z"})
    `;
    const imgs: { url: string; caption: string }[] = [
      { url: "/images/news/tidings/191_1.webp", caption: "㈜이브이레이저 한상배 대표 인터뷰" },
      { url: "/images/news/tidings/191_2.webp", caption: "인터뷰 현장" },
    ];
    for (let i = 0; i < imgs.length; i++) {
      await sql`
        INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
        VALUES (${newId()}, ${pressId}, ${imgs[i].url}, ${imgs[i].caption}, ${null}, ${i}, ${new Date().toISOString()})
      `;
    }
  }
  await sql`INSERT INTO settings (key, value) VALUES ('investnews_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 2025 한국레이저가공학회 춘계학술대회 참가(#116)를 사내소식 → 논문·학술소식으로 이관한다.
// 본문·사진을 그대로 옮기도록 기존 news 레코드를 복사한 뒤 사내소식에서 제거한다.
async function ensureKslp2025ToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'kslp2025_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "2025 한국레이저가공학회 춘계학술대회 참가";
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2025.05.21";
    const body = (n.body as string) || "";
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${srcTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'paper', ${srcTitle}, '한국레이저가공학회', ${date}, ${body},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('kslp2025_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// (주)이브이레이저 x YTN 최강기업 촬영(#115)을 사내소식 → 언론·방송소식으로 이관한다.
// 본문·사진 그대로 복사 후 사내소식에서 제거. (기존 'YTN 출연'(영상) 글과는 별개 항목)
async function ensureYtnFilmingToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'ytn_filming_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "(주) 이브이레이저 x YTN 최강기업 촬영";
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2025.05.15";
    const body = (n.body as string) || "";
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${srcTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'media', ${srcTitle}, 'YTN <최강기업>', ${date}, ${body},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('ytn_filming_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 대한기계학회 기계저널 CEO 인터뷰(#113)를 사내소식 → 언론·방송소식으로 이관한다.
// 본문·사진 그대로 복사 후 사내소식에서 제거.
async function ensureKsmeJournalToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'ksme_journal_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "대한기계학회 기계저널 CEO 인터뷰 진행";
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2025.05.14";
    const body = (n.body as string) || "";
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${srcTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'media', ${srcTitle}, '대한기계학회 기계저널', ${date}, ${body},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('ksme_journal_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 경제인뉴스 CEO 인터뷰(#111)를 사내소식 → 언론·방송소식으로 이관한다.
// 본문·사진 그대로 복사 후 사내소식에서 제거.
async function ensureEconomyNewsToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'economynews_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "경제인뉴스 CEO 인터뷰 진행";
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2024.11.25";
    const body = (n.body as string) || "";
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${srcTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'media', ${srcTitle}, '경제인뉴스', ${date}, ${body},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('economynews_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// KOPLAS 2023 보도자료(#101)를 사내소식 → 언론·방송소식으로 이관한다.
// 본문의 "강병길 팀장/강 팀장"은 "(이브이레이저의) 한상배 대표"로 치환한다.
function replaceKangWithHan(body: string): string {
  return body
    .replaceAll("(주)이브이레이저 강병길 팀장", "이브이레이저의 한상배 대표")
    .replaceAll("이브이레이저 강 팀장", "이브이레이저의 한상배 대표")
    .replaceAll("강병길 팀장", "한상배 대표")
    .replaceAll("강 팀장", "한상배 대표")
    .replaceAll("강팀장", "한상배 대표")
    .replaceAll("강병길", "한상배 대표");
}

async function ensureKoplas2023ToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'koplas2023_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "[보도자료] EVLASER, KOPLAS 2023서 다양한 레이저 응용 기술들 전시";
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2023.03.20";
    const body = replaceKangWithHan((n.body as string) || "");
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${srcTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'media', ${srcTitle}, '산업일보', ${date}, ${body},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    } else {
      // 이미 이관된 경우 본문만 정정(치환 반영)
      await sql`UPDATE press_items SET body = ${body} WHERE id = ${exists[0].id}`;
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('koplas2023_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 레이저 설비 마케팅 담당 채용공고(#99)는 채용(careers) 섹션에 등록되었으므로
// 사내소식(news)에서는 제거한다.
async function ensureMarketingJobRemoveFromNews(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'marketing_job_removed_from_news'`) as { value: string }[];
  if (flag.length > 0) return;
  const olds = (await sql`SELECT id FROM news_items WHERE title LIKE '%레이저 설비 마케팅 담당%'`) as { id: string }[];
  for (const o of olds) {
    await sql`DELETE FROM news_images WHERE news_id = ${o.id}`;
  }
  await sql`DELETE FROM news_items WHERE title LIKE '%레이저 설비 마케팅 담당%'`;
  await sql`INSERT INTO settings (key, value) VALUES ('marketing_job_removed_from_news', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 사내소식에서 이관된 기사 본문(붙어 있던 텍스트)을 가독성 있게(띄어쓰기·문단) 재작성한다.
async function ensurePressBodiesReformat(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'press_bodies_reformatted_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const updates: { title: string; body: string }[] = [
    {
      title: "대한기계학회 기계저널 CEO 인터뷰 진행",
      body: [
        "대한기계학회에서 발행하는 기계저널 5월호에 한상배 대표님의 인터뷰가 소개되었습니다.",
        "대한기계학회는 우리나라 최초로 설립된, 국내에서 가장 큰 학회이며, 회원 수 3만 명이 넘는 기계 분야의 리더 역할을 하고 있습니다. 추계대회 시에는 등록자만 3천 명이 넘으며, 많은 기업들이 부스를 통해 홍보에 참여하고 있습니다.",
        "이러한 대한기계학회에서 발행하는 기계저널은 전국 5,500여 개 회원사에 배포되고 있는 영향력 있는 채널입니다.",
        "대표님의 인터뷰를 통해 24년의 연구와 개발로 완성한 이브이레이저의 기술력과 믿을 수 있는 품질의 설비들이 많은 분들께 소개될 수 있는 계기가 될 것입니다.",
        "앞으로도 ㈜이브이레이저는 “더 좋은 레이저 기술로 더 좋은 세상을 만들기 위하여” 노력하겠습니다. 감사합니다.",
      ].join("\n\n"),
    },
    {
      title: "경제인뉴스 CEO 인터뷰 진행",
      body: [
        "경제인뉴스를 통한 대표님 인터뷰 진행 건이 기사화되었습니다.",
        "여러 산업 분야에 폭넓고 다양하게 활용되고 있는 레이저 산업에서의 당사의 포지션과 주력 사업, 그리고 앞으로의 목표와 방향성에 대해 소개한 내용으로, 이브이레이저를 이해하시는 데 도움이 될 기사가 소개되었습니다.",
        "앞으로도 ㈜이브이레이저의 행보에 많은 관심과 애정 부탁드립니다. 감사합니다.",
      ].join("\n\n"),
    },
    {
      title: "(주) 이브이레이저 x YTN 최강기업 촬영",
      body: [
        "안녕하세요, 이브이레이저입니다. 오늘은 YTN <최강기업> 방송 출연 소식을 가지고 왔습니다.",
        "“대한민국 산업계를 이끄는 최강기업들의 생생한 현장 소식을 발빠르게 전하는 YTN <최강기업>”의 방송 출연 제안을 받은 후, 4월에 촬영을 진행했습니다.",
        "사전 준비된 구성안을 리뷰하고, 현장 동선에 맞춰 조정하며 커뮤니케이션을 충분히 하니 촬영이 순조롭게 진행되었습니다.",
        "24년 연구와 개발로 완성된 기술력과 믿을 수 있는 품질의 제품·샘플들을 몇 분짜리 영상에 담기란 참 어려운 일입니다만, 하나라도 더 멋진 영상과 좋은 정보를 담기 위한 촬영팀의 열정과 에너지에 박수를 보냈습니다.",
        "본방송은 지난 5월 10일과 11일 두 차례 송출되었습니다. 미리보기로 주요 장면을 소개해 드리며, 풀 영상은 자료실과 유튜브 채널에서 확인하실 수 있습니다.",
        "㈜이브이레이저의 앞으로의 행보에 많은 관심 부탁드립니다. 감사합니다.",
      ].join("\n\n"),
    },
    {
      title: "2025 한국레이저가공학회 춘계학술대회 참가",
      body: [
        "산업용 레이저 응용기술 전문기업 ㈜이브이레이저는 2025 한국레이저가공학회 춘계학술대회에 참가하였습니다.",
        "3일간 진행된 춘계학술대회는 다양한 산업에 걸친 최신 레이저 기술의 학술 교류와 기술 발전을 도모하는 자리입니다. 매년 정기 학술대회와 심포지엄을 개최하여 연구자, 엔지니어, 산업계 전문가들이 협력할 수 있는 장을 마련하고, 국내외 연구 네트워크 확대에도 기여하고 있습니다.",
        "㈜이브이레이저는 발표자로도 참석하여, 20일 오전 “플라스틱 소재의 정밀 용접을 위한 레이저 시스템 개발 연구”를 주제로 기술연구소 소장님이 발표를 진행했습니다. 컨퍼런스에 참여한 관계자분들이 당사의 발표 자료를 촬영하며 많은 관심을 표했습니다.",
        "㈜이브이레이저는 앞으로도 활발한 컨퍼런스 활동을 통해 23년의 연구와 개발로 완성된 기술력과 전문성을 알리고, 최신 기술 및 시장 동향을 빠르게 파악해 나가겠습니다. 많은 관심과 애정 부탁드립니다. 감사합니다.",
      ].join("\n\n"),
    },
    {
      title: "[보도자료] EVLASER, KOPLAS 2023서 다양한 레이저 응용 기술들 전시",
      body: [
        "[산업일보] 기존 내연기관을 탈피한 친환경차 모델이 연이어 출시되고 있다. 관련 산업 시장도 빠르게 재편되고 있다. 특히 기존 내연기관 자동차의 부품 중 하나인 전면부 그릴은 과거처럼 수요가 많지 않다.",
        "고양시 일산 킨텍스에서 개최된 ‘제26회 국제금형 및 관련기기전(INTERMOLD KOREA 2023)’에 참가한 이브이레이저의 한상배 대표는 “내연기관의 그릴이 없어져 그 자리를 대체하기 위한 익스테리어 시장이 클 것”이라 전망했다.",
        "자동차·전자·반도체·철강·기계·항공·의료 등 다양한 산업 분야에서 필요한 레이저 응용 기술을 개발하는 ㈜이브이레이저는 전기차 부품 개발에 대한 검토 및 테스트도 진행 중에 있다고 한상배 대표는 밝혔다.",
        "부품 업체를 주 고객사로 두고 있는 이브이레이저의 한상배 대표는 “자동차 업계는 기본적으로 대량생산을 하지만 사출의 결과물이 늘 일정한 것은 아니다”라며 레이저 플라스틱 투과율 측정 장비를 소개했다.",
        "이어 “제조공정에서도 데이터 매니지먼트는 필수 요소다. ETM-31 모델은 플라스틱 투과 소재의 사출 품질 기준을 마련해 주고, 데이터 관리를 위한 Data-Log 기능도 포함하고 있다. 양산 전 품질 확인 및 관리에도 필수적인 장비”라고 설명했다.",
        "전시 현장에는 다양한 플라스틱 용접 샘플들과 R&D 실험용, 다품종 소량 생산용 레이저 플라스틱 용접기 등이 전시됐다.",
        "22개국 384개 기업이 참가한 ‘제27회 국제 플라스틱·고무산업 전시회(KOPLAS 2023)’는 14일 개막, 18일 폐막했다.",
      ].join("\n\n"),
    },
  ];
  for (const u of updates) {
    await sql`UPDATE press_items SET body = ${u.body} WHERE title = ${u.title}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('press_bodies_reformatted_v1', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 제46회 용사기술 Workshop 참가 후기(#98)를 사내소식 → 논문·학술소식으로 이관한다.
// 본문은 가독성 있게 재편집, 사진 6장은 그대로 복사.
async function ensureWs46ReviewToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'ws46_review_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "(주)이브이레이저 제 46회 용사기술 Workshop 참가 후기";
  const newBody = [
    "안녕하세요 여러분! ㈜이브이레이저입니다.",
    "저희는 지난 6월 9~10일, 한국용사기술협회에서 개최한 제46회 용사기술 Workshop에 참가했습니다.",
    "용사기술은 1910년대, 스위스의 M. U. Schoop가 별개의 연소 열원으로 가열된 압축공기의 제트 내에 용융된 납을 공급한 용탕식 용사법을 시작으로, 화염을 이용한 가스식 용사와 아크 열원을 이용한 전기식 용사가 실용화되며 발전해 왔습니다.",
    "가장 최초의 용사법을 다룬 특허는 1882년 독일에서 등록된 German Patent No. 2446이며, 1902년 8월 12일 등록된 Thurston의 “a method for carrying out the process of coating one metal with another”와 M. U. Schoop의 1915년 3월 30일 등록 특허 등에서 현재의 용사기술과 매우 유사한 내용을 확인할 수 있습니다.",
    "이번 워크샵은 이러한 기술에 대해 서로 교류함으로써, 국제 협력을 통한 국내 용사기술 활성화와 아시아·국제 용사기술 컨퍼런스 참가 및 국내 유치를 통한 국제교류의 장을 확대하는 기회가 되었습니다.",
    "등록을 마치면 이름표를 받고 행사장에 입장할 수 있어, 저희는 일찍 도착해 등록을 먼저 진행했습니다. 발표 전 잠시 휴식을 가진 뒤, 레이저 클래딩 적용 샘플과 용사 불량 사례 등을 발표했습니다. 참석자 모두가 집중해 들어주신 덕분에 발표를 잘 마무리할 수 있었습니다.",
    "㈜이브이레이저는 이러한 기술 워크샵에 항상 참석하여 다양한 용사기술 정보를 공유하고 산업 동향을 빠르게 파악하고 있습니다. 이번 워크샵 역시 참 유익하고 의미 있는 시간이었습니다.",
    "레이저 설비 및 기술에 관해 궁금하신 점이 있으시면 편하게 문의해 주세요. 감사합니다.",
  ].join("\n\n");
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2022.08.23";
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${srcTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'paper', ${srcTitle}, '한국용사기술협회(KTSA)', ${date}, ${newBody},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    } else {
      await sql`UPDATE press_items SET body = ${newBody} WHERE id = ${exists[0].id}`;
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('ws46_review_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// RAYLASE사 제품 교육(#63): 의미 없는 첨부 placeholder 이미지(88_1~88_4) 삭제 +
// 본문 가독성 재편집. (사내소식 유지, 첫 실제 사진이 썸네일이 됨)
async function ensureRaylaseTrainingFix(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'raylase_training_fixed'`) as { value: string }[];
  if (flag.length > 0) return;
  const title = "151026_해외 파트너 RAYLASE사의 제품 교육";
  const newBody = [
    "안녕하세요. ㈜유로비젼레이저입니다.",
    "2015년 10월 26일, 해외 파트너사인 RAYLASE사의 트레이닝이 진행되었습니다. RAYLASE사가 한국을 직접 방문하여 자사 제품에 대한 교육을 진행해 주셨습니다.",
    "저희는 이러한 교육을 꾸준히 이어감으로써, 고객 여러분께 항상 독창적인 아이디어와 전문 지식을 선보이겠습니다.",
    "교육에 함께해 주신 유로비젼레이저 직원 여러분과 RAYLASE사의 Mr. Wolfgang 모두 수고 많으셨습니다. 항상 많은 관심 주셔서 감사합니다.",
    "㈜유로비젼레이저 임직원 일동",
  ].join("\n\n");
  const drop = [
    "/images/news/tidings/88_1.webp",
    "/images/news/tidings/88_2.webp",
    "/images/news/tidings/88_3.webp",
    "/images/news/tidings/88_4.webp",
  ];
  await sql`DELETE FROM news_images WHERE url = ANY(${drop}::text[])`;
  await sql`UPDATE news_items SET body = ${newBody} WHERE title = ${title}`;
  await sql`INSERT INTO settings (key, value) VALUES ('raylase_training_fixed', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 사내소식 본문을 가독성 있게 정리한다.
// - 상단의 "첨부파일(N)" + 파일명(용량) 줄 제거
// - 게시판 네비게이션(목록/다음글/이전글) 꼬리 제거
// - 문장부호(.!?) 뒤·쉼표 뒤에 한글이 바로 붙은 경우 공백 추가(날짜·소수점은 보호)
function cleanNewsBody(raw: string): string {
  let s = (raw || "").replace(/\r/g, "");
  const lines = s.split("\n").filter((l) => {
    const t = l.trim();
    if (/^첨부파일\(\d+\)$/.test(t)) return false;
    if (/^.+\.(jpg|jpeg|png|gif|bmp|pdf|zip|hwp|docx?|xlsx?|pptx?)\s*\(\s*[\d.,]+\s*[KMG]?B\s*\)$/i.test(t)) return false;
    return true;
  });
  s = lines.join("\n");
  // 게시판 하단 네비게이션 제거 (목록 + 다음글/이전글 블록이 있을 때만)
  s = s.replace(/\n\s*목록\s*\n[\s\S]*$/u, (m) => (/다음글|이전글/.test(m) ? "" : m));
  // 관리자 이동/안내 꼬리말 제거 (예: "[이 게시물은 최고관리자님에 의해 ... 이동 됨]")
  s = s.replace(/\[[^\]]*이 게시물은[^\]]*\]/g, "");
  // 문장부호 뒤 공백(뒤 글자가 한글/여는따옴표/여는괄호/대문자일 때만 — 날짜·소수점 보호)
  s = s.replace(/([.!?])([가-힣“”"'(A-Z])/g, "$1 $2");
  // 쉼표 뒤 한글 공백
  s = s.replace(/([,])([가-힣])/g, "$1 $2");
  // 한글 뒤에 영문 약어(대문자 2자 이상)가 바로 붙은 경우 공백 추가 (조사 보호를 위해 영문→한글은 제외)
  s = s.replace(/([가-힣])([A-Z]{2,})/g, "$1 $2");
  // 공백·빈줄 정리
  s = s.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

// 사내소식 전체 정리: 반복되는 placeholder 아이콘 이미지 삭제 + 본문 가독성 정리.
async function ensureNewsCleanup(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'news_cleanup_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  // 1) 의미 없는 placeholder 이미지(극소 아이콘) 일괄 삭제
  const ph = newsPlaceholderImages as string[];
  if (ph.length > 0) {
    await sql`DELETE FROM news_images WHERE url = ANY(${ph}::text[])`;
  }
  // 2) 본문 가독성 정리
  const rows = (await sql`SELECT id, body FROM news_items`) as { id: string; body: string }[];
  for (const r of rows) {
    const cleaned = cleanNewsBody(r.body);
    if (cleaned !== (r.body ?? "")) {
      await sql`UPDATE news_items SET body = ${cleaned} WHERE id = ${r.id}`;
    }
  }
  await sql`INSERT INTO settings (key, value) VALUES ('news_cleanup_v1', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 사내소식·전시회소식(news) + 논문·학술·언론·방송(press) 전체 본문 가독성 정리(v2).
// 관리자 이동 꼬리말 제거·문장부호 공백·한글↔약어 공백 등 강화 규칙을 일괄 재적용한다.
async function ensureAllTextCleanupV2(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'all_text_cleanup_v2'`) as { value: string }[];
  if (flag.length > 0) return;
  const news = (await sql`SELECT id, body FROM news_items`) as { id: string; body: string }[];
  for (const r of news) {
    const cleaned = cleanNewsBody(r.body);
    if (cleaned !== (r.body ?? "")) await sql`UPDATE news_items SET body = ${cleaned} WHERE id = ${r.id}`;
  }
  const press = (await sql`SELECT id, body FROM press_items`) as { id: string; body: string }[];
  for (const r of press) {
    const cleaned = cleanNewsBody(r.body);
    if (cleaned !== (r.body ?? "")) await sql`UPDATE press_items SET body = ${cleaned} WHERE id = ${r.id}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('all_text_cleanup_v2', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 제28회 HiDEC 연구발표회 참가 후기(#105)를 사내소식 → 논문·학술소식으로 이관한다.
// 본문은 가독성 있게 재편집, 사진 5장 복사.
async function ensureHidec28ReviewToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'hidec28_review_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "제 28회 고에너지 연구위원회(HiDEC) 연구발표회에 다녀왔습니다.";
  const newBody = [
    "안녕하세요, 이브이레이저입니다.",
    "오늘은 제28회 고에너지 연구위원회(HiDEC) 연구발표회에 다녀온 소식입니다. 올해는 “미래 산업 기술 선도를 위한 고에너지 적용 기술”이라는 주제로 열렸으며, 대한용접접합학회 고에너지연구위원회는 고에너지 연구 분야의 정보 공유와 네트워크 활성화를 위해 매년 이러한 정기 학술 발표회를 진행하고 있습니다.",
    "회원분들과 후원기업, 그리고 다수의 관계자분들의 관심과 열기로 현장 분위기가 뜨거웠습니다. 이번 발표회에는 이브이레이저 한상배 대표님도 발표자로 참석하시어 “3D 스캐너와 CO₂ 레이저를 이용한 차량 조명용 반사필름의 레이저 펀칭 기술 개발 사례”를 직접 소개했습니다. 많은 학회 관계자분들이 집중해 들어주시고 관심을 표해주신 덕분에 발표를 잘 마무리했습니다.",
    "저희 이브이레이저는 이러한 기술 관련 학회와 워크숍, 전시회 등을 통해 정보를 공유하고 산업 동향을 빠르게 파악하기 위한 행보를 계속 이어가고 있습니다.",
    "기업부설연구소의 연구개발 및 양산기술 적용 과정에서 습득한 레이저 응용 기술의 성과물은, 관련 학회 활동과 연구 논문 발표를 통해 대학교·연구소 및 관련 업체의 전문가·사용자와 함께 공유하고 있습니다. 또한 레이저 산업 관련 인프라를 확대하고 전문가들과의 정보·신기술 교류를 위해 학회 활동에도 활발히 참여하고 있습니다.",
    "레이저 설비 및 기술에 관한 모든 문의는 이브이레이저로 부탁드립니다. 감사합니다.",
  ].join("\n\n");
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2024.07.24";
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${srcTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'paper', ${srcTitle}, '대한용접접합학회 고에너지연구위원회', ${date}, ${newBody},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    } else {
      await sql`UPDATE press_items SET body = ${newBody} WHERE id = ${exists[0].id}`;
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('hidec28_review_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 대전 한국-독일 Ultra Short Pulse Laser 워크샵(#60)을 사내소식 → 논문·학술소식으로 이관.
// 본문 가독성 재편집, 남은 실제 사진 복사.
async function ensureDaejeonUspToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'daejeon_usp_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "대전기계연구원 한국-독일 Ultra Short Pulse Laser 워크샵";
  const newBody = [
    "안녕하세요, 유로비젼레이저입니다.",
    "9월 16일 대전 기계연구원에서 개최된 ‘한국-독일 레이저 생산제조 국제기술교류회’에 독일의 파트너사인 AMPHOS사와 유로비젼레이저가 함께 참가하여 기술교류의 시간을 가졌습니다.",
    "이번 교류회에서는 초단펄스(Ultra Short Pulse) 레이저를 비롯한 최신 레이저 생산제조 기술에 대한 정보를 공유하며, 한국과 독일 양국의 전문가들이 협력 방안을 논의했습니다.",
  ].join("\n\n");
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2021.06.18";
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${srcTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'paper', ${srcTitle}, '한국기계연구원(대전) · 한-독 국제기술교류회', ${date}, ${newBody},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    } else {
      await sql`UPDATE press_items SET body = ${newBody} WHERE id = ${exists[0].id}`;
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('daejeon_usp_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 2015.10.22~23 용사학회 워크샵(#62)을 사내소식 → 논문·학술소식으로 이관.
async function ensureYongsa2015ToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'yongsa2015_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "2015.10.22~23 용사학회 워크샵";
  const newBody = [
    "안녕하세요, 유로비젼레이저입니다.",
    "10월 23일 용사학회 워크샵에서 유로비젼레이저 한상배 대표님의 클래딩(Cladding) 세미나가 진행되었습니다.",
    "유로비젼레이저도 용사학회 워크샵에 참가하여 레이저 클래딩 기술을 소개하고 기술교류의 시간을 가졌습니다.",
  ].join("\n\n");
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2021.06.18";
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${srcTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'paper', ${srcTitle}, '한국용사기술협회', ${date}, ${newBody},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    } else {
      await sql`UPDATE press_items SET body = ${newBody} WHERE id = ${exists[0].id}`;
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('yongsa2015_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// KOMAF 2015 기사(#67)를 사내소식 → 전시회소식(뉴스 내 카테고리)으로 이동 + 본문 재편집.
async function ensureKomaf2015ToExhibition(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'komaf2015_to_exhibition'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "[KOMAF 2015] (주)유로비젼레이저, ‘행복한 기업, 최고의 기술’";
  const newBody = [
    "[산업일보] 원자재 상승 및 친환경 차량 개발로 자동차 업계에서는 플라스틱 소재의 중요성이 점점 커지고 있다. 여기에 레이저 플라스틱 융착 기술로 국내 자동차 산업 발전에 큰 역할을 하는 회사가 있다.",
    "㈜유로비젼레이저(이하 유로비젼)가 지난 10월 28일~31일 개최된 ‘2015 한국기계전(Korea Machinery Fair 2015)’에서 플라스틱 작업을 선도할 제품을 선보였다.",
    "유로비젼의 Laser Plastic Welding System ELW-200 모델은 Rotary Table 또는 고정형 Jig가 장착된 단독형 시스템으로, 클램프 가압력 측정 장치 및 파워 측정 장치가 탑재돼 있다. 직교좌표로봇을 이용해 레이저 빔을 이동시킬 수 있고, 일체화된 제어 프로그램으로 편리한 작업이 가능하다.",
    "유로비젼은 매해 매출액의 20%를 신기술에 투자한다. 임직원 모두가 가족처럼 지내는 기업 문화를 자랑하는 유로비젼은 매월 회의를 통해 회사의 재무 상황을 직원들과 공유하며, 한마음으로 회사의 비전을 추구한다.",
    "이 회사 관계자는 “구글보다 더 구글 같은 꿈의 직장이 됐으면 한다”라며 “행복한 기업 문화를 통해 세계 최고의 레이저 응용기술을 보유한 회사가 되도록 노력하겠다”라고 포부를 밝혔다.",
    "박혜선 기자 (산업일보)",
  ].join("\n\n");
  await sql`UPDATE news_items SET tag = '전시회소식', body = ${newBody} WHERE title = ${srcTitle}`;
  await sql`INSERT INTO settings (key, value) VALUES ('komaf2015_to_exhibition', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 2013년 용사협회 추계학술발표대회 단체사진(#30)을 사내소식 → 논문·학술소식으로 이관.
// 제목 오타(용사헙회→용사협회) 교정, 본문 정리.
async function ensureYongsa2013ToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'yongsa2013_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "2013년 12월 용사헙회 추계학술발표대회 단체사진";
  const newTitle = "2013년 12월 용사협회 추계학술발표대회 단체사진";
  const newBody = [
    "2013년 12월 열린 용사협회(한국용사기술협회) 추계학술발표대회 단체사진입니다.",
    "둘째 줄 가운데에 저희 회사 사원과 대표님이 함께하고 있습니다.",
  ].join("\n\n");
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2021.06.17";
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${newTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'paper', ${newTitle}, '한국용사기술협회', ${date}, ${newBody},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('yongsa2013_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 2014 광주 산업용 레이저 전문가 세미나(#33)를 사내소식 → 논문·학술소식으로 이관.
async function ensureGwangjuSeminarToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'gwangju_seminar_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "전라도 광주_2014 산업용 레이저 고도화를 위한 전문가 세미나";
  const newBody = [
    "2014년 광주에서 열린 ‘산업용 레이저 고도화를 위한 전문가 세미나’에 참가했습니다.",
    "산업용 레이저 분야의 전문가들이 모여 기술 고도화 방안과 최신 동향을 공유하는 자리였습니다.",
  ].join("\n\n");
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2021.06.17";
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${srcTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'paper', ${srcTitle}, '산업용 레이저 전문가 세미나(광주)', ${date}, ${newBody},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('gwangju_seminar_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 경인일보 기사(#25)를 사내소식 → 언론·방송소식으로 이관 + 본문 재편집.
async function ensureKyeongin2013ToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'kyeongin2013_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "경인일보에 소개된 구글보다 더 구글같은 기업을 꿈꾸는 유로비젼(주)";
  const newBody = [
    "2013년 3월 경인일보에 소개된 당사에 관한 기사입니다.",
    "“구글(Google)은 물론이고 국내 중견기업이나 대기업의 복지·급여·근무환경을 따라가려면 아직 많이 부족합니다. 그렇지만 ‘구글보다 더 구글 같은 회사’, ‘대기업보다 더 대기업 같은 중소기업’을 만드는 것이 가능하리라는 꿈을 꾸면서, 우리 회사의 모든 임직원은 오늘도 열심히 달립니다. 모두가 행복해질 수 있는 그날까지 말입니다.”",
    "열심히 일한 만큼 좋은 성과를 내고, 그 성과를 모든 임직원이 함께 공유하며, 이를 통해 임직원과 그 가족 모두가 행복할 수 있는 좋은 회사가 되도록 노력하겠습니다.",
    "유로비젼(주)",
  ].join("\n\n");
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2021.06.16";
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${srcTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'media', ${srcTitle}, '경인일보', ${date}, ${newBody},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('kyeongin2013_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 2013 해외 협력업체 기술교류 세미나(#15)를 사내소식 → 논문·학술소식으로 이관.
async function ensureChinaSeminar2013ToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'china_seminar2013_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "2013년 3월 18일 해외 협력업체와 기술교류 세미나";
  const newBody = [
    "2013년 3월 18일, 중국 출장 중 해외 협력업체와 기술교류 세미나를 가졌습니다.",
    "레이저 관련 내용을 비롯한 다양한 기술 정보를 함께 공유하면서, 레이저 분야에 대한 시야를 한층 넓힐 수 있었던 뜻깊은 자리였습니다.",
  ].join("\n\n");
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2021.06.16";
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${srcTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'paper', ${srcTitle}, '해외 협력업체 기술교류 세미나', ${date}, ${newBody},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('china_seminar2013_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 열처리공학회 기술논문발표(신소재경제신문 2012.10)(#)을 사내소식 → 논문·학술소식으로 이관.
async function ensureHeatTreat2012ToPress(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'heattreat2012_moved_to_press'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "신문_열처리공학회 기술논문발표(신소재경제신문2012년10월)";
  const newBody = [
    "사단법인 한국열처리공학회가 주최한 2012년 추계 열처리공학회에서 유로비젼(주)의 양승철 차장이 “레이저를 이용한 열처리”를 주제로 업체 사례를 발표했습니다.",
    "발표 내용에 관해 궁금하신 사항은 당사로 문의해 주시기 바랍니다.",
  ].join("\n\n");
  const rows = (await sql`SELECT * FROM news_items WHERE title = ${srcTitle}`) as Record<string, unknown>[];
  if (rows.length > 0) {
    const n = rows[0];
    const newsId = n.id as string;
    const date = (n.date as string) || "2021.06.18";
    const imgRows = (await sql`SELECT * FROM news_images WHERE news_id = ${newsId} ORDER BY sort_order ASC, created_at ASC`) as Record<string, unknown>[];
    const exists = (await sql`SELECT id FROM press_items WHERE title = ${srcTitle} LIMIT 1`) as { id: string }[];
    if (exists.length === 0) {
      const createdAt = new Date(date.replace(/\./g, "-") + "T00:00:00.000Z").toISOString();
      const pressId = newId();
      await sql`
        INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
        VALUES (${pressId}, 'paper', ${srcTitle}, '한국열처리공학회 · 신소재경제신문', ${date}, ${newBody},
          ${null}, ${null}, ${null}, ${null}, true, 0, ${createdAt})
      `;
      for (let i = 0; i < imgRows.length; i++) {
        const img = imgRows[i];
        await sql`
          INSERT INTO press_images (id, press_id, url, caption, content, sort_order, created_at)
          VALUES (${newId()}, ${pressId}, ${img.url as string}, ${(img.caption as string) ?? null}, ${(img.content as string) ?? null}, ${i}, ${new Date().toISOString()})
        `;
      }
    }
    await sql`DELETE FROM news_images WHERE news_id = ${newsId}`;
    await sql`DELETE FROM news_items WHERE id = ${newsId}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('heattreat2012_moved_to_press', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 부산국제용접전 및 KOAAshow 2008(#)을 사내소식 → 전시회소식(뉴스 내 카테고리)으로 이동 + 본문 재편집.
async function ensureBusanKoaashow2008ToExhibition(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'busan_koaashow2008_to_exhibition'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "부산국제용접전 및 일산 KOAAshow 2008";
  const newBody = [
    "㈜유로비젼레이저는 제2회 부산국제 용접·절단·레이저설비산업전과 KOAAshow 2008에 참가했습니다.",
    "· 부산국제 용접·절단·레이저설비산업전(Welding Busan Korea 2008): 2008년 11월 12일(수)~15일(토), 부산 BEXCO\n· KOAAshow 2008: 2008년 11월 20일(목)~23일(일), 4일간",
    "두 전시회 모두 성황리에 마쳤습니다. 부스를 방문해 주신 모든 분들께 다시 한번 감사의 인사를 드립니다.",
    "유로비젼 직원 일동",
  ].join("\n\n");
  await sql`UPDATE news_items SET tag = '전시회소식', body = ${newBody} WHERE title = ${srcTitle}`;
  await sql`INSERT INTO settings (key, value) VALUES ('busan_koaashow2008_to_exhibition', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 사명 변경 안내(#): 실제 변경일(2018.08.28)로 등록일 교정 + 본문 가독성 재편집.
async function ensureRenameNoticeFix(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'rename_notice_fixed'`) as { value: string }[];
  if (flag.length > 0) return;
  const newBody = [
    "안녕하십니까, ㈜이브이레이저입니다.",
    "2018년 8월 28일부로 기존 “유로비젼레이저”에서 새로운 사명 “이브이레이저”로 상호를 변경하였습니다.",
    "단순 상호 변경으로, 기존 조직 구성과 연락 채널은 모두 동일하게 유지되오니 참고 부탁드립니다.",
    "감사합니다.",
  ].join("\n\n");
  await sql`UPDATE news_items SET date = '2018.08.28', body = ${newBody} WHERE title LIKE '%사명 변경 안내%'`;
  await sql`INSERT INTO settings (key, value) VALUES ('rename_notice_fixed', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// KOPLAS 2008 참가(#)를 사내소식 → 전시회소식(뉴스 내 카테고리)으로 이동 + 본문 재편집.
async function ensureKoplas2008ToExhibition(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'koplas2008_to_exhibition'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "KOPLAS 2008 참가";
  const newBody = [
    "제19회 플라스틱&고무 전시회 ‘KOPLAS 2008’이 2008년 3월 26일부터 30일까지 5일간 개최됩니다.",
    "당사는 KOPLAS 2008(부스번호 217)에 출품할 예정이오니, 관심 있는 관련 업체 여러분의 많은 참관 바랍니다.",
    "전시회 상세 자료는 www.koplas.com 을 참조해 주시기 바랍니다. 감사합니다.",
  ].join("\n\n");
  await sql`UPDATE news_items SET tag = '전시회소식', body = ${newBody} WHERE title = ${srcTitle}`;
  await sql`INSERT INTO settings (key, value) VALUES ('koplas2008_to_exhibition', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 상호명 변경 공지(#): 본문 오류 수정 — (주)유로비젼 → (주)유로비젼레이저 (2014.10.01).
async function ensureTradenameNoticeFix(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'tradename_notice_fixed'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "※공지 상호명 변경 사항";
  const newBody = [
    "[공지사항] 상호명 변경 안내입니다.",
    "· 변경일: 2014년 10월 1일\n· 변경 내용: (주)유로비젼 → (주)유로비젼레이저",
    "단순 상호 변경으로 기존 조직 구성과 연락 채널은 동일하게 유지됩니다. 앞으로도 많은 관심 부탁드립니다.",
    "유로비젼레이저(주) 임직원 일동",
  ].join("\n\n");
  await sql`UPDATE news_items SET body = ${newBody} WHERE title = ${srcTitle}`;
  await sql`INSERT INTO settings (key, value) VALUES ('tradename_notice_fixed', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 2014 KIMES 전시회 참가(#)를 사내소식 → 전시회소식(뉴스 내 카테고리)으로 이동 + 본문 재편집.
async function ensureKimes2014ToExhibition(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'kimes2014_to_exhibition'`) as { value: string }[];
  if (flag.length > 0) return;
  const srcTitle = "2014년 kIMES_국제의료기기 & 병원 설비 전시회";
  const newBody = [
    "㈜유로비젼은 올해도 KIMES 전시회에 참가하게 되었습니다. 많은 관심 부탁드립니다.",
    "· 전시회: KIMES 2014 (국제의료기기 & 병원설비 전시회)\n· 기간: 2014년 3월 13일(목)~16일(일), 4일간\n· 개장시간: 오전 10시~오후 6시\n· 장소: 코엑스(COEX) 전시장 1·3층 전관 (서울시 강남구 삼성동 159)\n· 참조: http://www.kimes.kr/kr/",
  ].join("\n\n");
  await sql`UPDATE news_items SET tag = '전시회소식', body = ${newBody} WHERE title = ${srcTitle}`;
  await sql`INSERT INTO settings (key, value) VALUES ('kimes2014_to_exhibition', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// KOMAF 2015 기사(#67) 등록일을 실제 개최 시기(2015.10.28)로 교정 → 날짜순 재배치.
async function ensureKomaf2015Date(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'komaf2015_date_fixed'`) as { value: string }[];
  if (flag.length > 0) return;
  await sql`UPDATE news_items SET date = '2015.10.28' WHERE title = '[KOMAF 2015] (주)유로비젼레이저, ‘행복한 기업, 최고의 기술’'`;
  await sql`INSERT INTO settings (key, value) VALUES ('komaf2015_date_fixed', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 명백한 오탈자 + (주) 앞 공백만 안전하게 일괄 교정(news + press). (띄어쓰기 자동화는 오류 위험이 커 제외)
function safeTypoFix(raw: string): string {
  let s = raw || "";
  const typos: [string, string][] = [
    ["읍니다", "습니다"], ["괸심", "관심"], ["젼화", "전화"], ["춤품", "출품"], ["이였", "이었"],
  ];
  for (const [a, b] of typos) s = s.split(a).join(b);
  s = s.replace(/([가-힣])(\(주\)|㈜)/g, "$1 $2");
  return s;
}
async function ensureSafeTyposV3(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'safe_typos_v3'`) as { value: string }[];
  if (flag.length > 0) return;
  const news = (await sql`SELECT id, body FROM news_items`) as { id: string; body: string }[];
  for (const r of news) {
    const c = safeTypoFix(r.body);
    if (c !== (r.body ?? "")) await sql`UPDATE news_items SET body = ${c} WHERE id = ${r.id}`;
  }
  const press = (await sql`SELECT id, body FROM press_items`) as { id: string; body: string }[];
  for (const r of press) {
    const c = safeTypoFix(r.body);
    if (c !== (r.body ?? "")) await sql`UPDATE press_items SET body = ${c} WHERE id = ${r.id}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('safe_typos_v3', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 행사날짜가 명확한 전시회·학술 게시글의 등록일을 "행사 시작일 + 7일"로 설정한다.
// (개최 전인 KOREA METAL WEEK 2026은 예외로 2026.09.10 지정) 목록은 등록일 최신순 정렬.
async function ensureEventDatesPlus7(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'event_dates_plus7_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const map = eventDates as Record<string, string>;
  for (const [title, date] of Object.entries(map)) {
    await sql`UPDATE news_items SET date = ${date} WHERE title = ${title}`;
    await sql`UPDATE press_items SET date = ${date} WHERE title = ${title}`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('event_dates_plus7_v1', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 실제 홈페이지(evlaser.co.kr) 파트너사 로고를 주요고객사(client_logos)에 반영한다.
// - 플레이스홀더(data: URI)만 교체, 이미 실제 로고가 등록된 항목은 그대로 유지.
// - 수집된 파트너 목록을 로고와 함께 등록(이름 정규화로 기존 실제 로고와 중복 방지).
async function ensurePartnerLogosImport(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'partner_logos_imported_v1'`) as { value: string }[];
  if (flag.length > 0) return;
  const partners = partnerLogos as { name: string; file: string }[];
  if (!partners.length) return;
  const norm = (s: string) => (s || "").replace(/[^0-9a-z가-힣]/gi, "").toLowerCase();

  // 플레이스홀더(data:) 로고 삭제 — 실제 로고가 있는 항목은 보존
  await sql`DELETE FROM client_logos WHERE logo_url LIKE 'data:%'`;

  // 보존된(실제 로고) 항목의 이름 집합
  const kept = (await sql`SELECT name FROM client_logos`) as { name: string }[];
  const keptNames = new Set(kept.map((r) => norm(r.name)));

  let order = 0;
  for (const p of partners) {
    const key = norm(p.name);
    if (key && keptNames.has(key)) continue; // 이미 실제 로고가 있으면 건너뜀
    await sql`
      INSERT INTO client_logos (id, name, logo_url, sort_order, created_at)
      VALUES (${newId()}, ${p.name}, ${p.file}, ${order}, ${new Date().toISOString()})
    `;
    order++;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('partner_logos_imported_v1', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 레이저 솔더링 영상은 보안상의 이유로 동영상자료실에서 삭제한다.
async function ensureRemoveSolderingVideo(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'soldering_video_removed_2025'`) as { value: string }[];
  if (flag.length > 0) return;
  const url = "https://evlaser.co.kr/uploaded/board/data/8fa9d4b8d2075b6656e97e0e878142d20.mp4";
  await sql`DELETE FROM resources WHERE category = 'video' AND (url = ${url} OR title ILIKE '%솔더링%')`;
  await sql`INSERT INTO settings (key, value) VALUES ('soldering_video_removed_2025', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

async function ensureIntroVideo2025(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'intro_video_2025_04_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const url = "https://youtu.be/lvGJxkRgaUk";
  const exists = await sql`SELECT 1 FROM resources WHERE url LIKE '%lvGJxkRgaUk%' LIMIT 1`;
  if (exists.length === 0) {
    await sql`
      INSERT INTO resources (id, category, title, description, url, created_at)
      VALUES (${newId()}, 'video', '더 좋은 레이저 기술로 더 좋은 세상을 — ㈜이브이레이저 기업·기술 소개', '㈜이브이레이저의 레이저 솔루션과 기술력을 담은 소개 영상입니다.', ${url}, '2025-04-15T00:00:00.000Z')
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('intro_video_2025_04_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 2021.08.10 유튜브 영상을 동영상자료실(resources)에 한 번만 등록한다.
async function ensureIntroVideo2021(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'intro_video_2021_08_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const url = "https://youtu.be/wKqutFyBBmE";
  const exists = await sql`SELECT 1 FROM resources WHERE url LIKE '%wKqutFyBBmE%' LIMIT 1`;
  if (exists.length === 0) {
    await sql`
      INSERT INTO resources (id, category, title, description, url, created_at)
      VALUES (${newId()}, 'video', '레이저 플라스틱 용접 기술 — ㈜이브이레이저', '㈜이브이레이저의 레이저 플라스틱 용접 공법과 응용 기술을 소개하는 영상입니다.', ${url}, '2021-08-10T00:00:00.000Z')
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('intro_video_2021_08_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 2021.02.23 유튜브 영상을 동영상자료실(resources)에 한 번만 등록한다.
async function ensureIntroVideo2021Feb(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'intro_video_2021_02_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const url = "https://youtu.be/BxaBbRIY7Js";
  const exists = await sql`SELECT 1 FROM resources WHERE url LIKE '%BxaBbRIY7Js%' LIMIT 1`;
  if (exists.length === 0) {
    await sql`
      INSERT INTO resources (id, category, title, description, url, created_at)
      VALUES (${newId()}, 'video', '레이저 가공 솔루션 — ㈜이브이레이저', '㈜이브이레이저의 레이저 가공 기술과 응용 분야를 소개하는 영상입니다.', ${url}, '2021-02-23T00:00:00.000Z')
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('intro_video_2021_02_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// SBS Biz <오굿데이 — 세상의 모든 정보> 출연(2026.07.19)을 언론·방송(press)에 한 번만 등록한다.
async function ensureSbsBizBroadcast2026(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'sbsbiz_ohgoodday_2026_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const link = "https://programs.sbs.co.kr/sbsbiz/ohgoodday/clip/89058/22000633202";
  const body = [
    "㈜이브이레이저가 SBS Biz <오굿데이 — 세상의 모든 정보>(진행 오정연 아나운서)에 소개되었습니다.",
    "자동차 부품을 비롯한 다양한 산업에서 전통적인 초음파 융착·접착제 방식을 대체하고 있는 당사의 레이저 플라스틱 용접 기술이 방송을 통해 쉽고 생생하게 전해졌습니다.",
    "아래 링크에서 방송 영상을 시청하실 수 있습니다.",
  ].join("\n\n");
  const exists = await sql`SELECT 1 FROM press_items WHERE link_url = ${link} LIMIT 1`;
  if (exists.length === 0) {
    await sql`
      INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
      VALUES (${newId()}, 'media', 'SBS Biz <오굿데이> 출연 — 레이저 플라스틱 용접 기술', 'SBS Biz <오굿데이 — 세상의 모든 정보> · 오정연 아나운서', '2026.07.19', ${body},
        ${link}, ${null}, ${null}, ${"/press/sbsbiz-ohgoodday-2026.webp"}, true, 0, ${new Date().toISOString()})
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('sbsbiz_ohgoodday_2026_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 이미 등록된 강소기업뉴스 인터뷰 기사에 대표 인물사진 썸네일을 한 번만 지정한다.
async function ensurePressInterviewThumbnail(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'press_interview_thumb_set'`) as { value: string }[];
  if (flag.length > 0) return;
  await sql`
    UPDATE press_items SET thumbnail_url = '/press/kangso-interview-ceo.webp'
    WHERE pdf_url = '/press/evlaser-kangso-interview-2025.pdf' AND (thumbnail_url IS NULL OR thumbnail_url = '')
  `;
  await sql`INSERT INTO settings (key, value) VALUES ('press_interview_thumb_set', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 2021.01.21 유튜브 영상을 동영상자료실(resources)에 한 번만 등록한다.
async function ensureIntroVideo2021Jan(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'intro_video_2021_01_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const url = "https://youtu.be/ql7U8ZCazF4";
  const exists = await sql`SELECT 1 FROM resources WHERE url LIKE '%ql7U8ZCazF4%' LIMIT 1`;
  if (exists.length === 0) {
    await sql`
      INSERT INTO resources (id, category, title, description, url, created_at)
      VALUES (${newId()}, 'video', '레이저 플라스틱 용접 공정 — ㈜이브이레이저', '㈜이브이레이저의 레이저 플라스틱 용접 공정과 적용 사례를 소개하는 영상입니다.', ${url}, '2021-01-21T00:00:00.000Z')
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('intro_video_2021_01_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 2023.03.22 페이스북 영상(자동차 램프 레이저 용접)을 동영상자료실에 한 번만 등록한다.
async function ensureLampWeldingVideo2023(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'lamp_welding_video_2023_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const url = "https://www.facebook.com/share/v/1AeZiyuDfy/";
  const exists = await sql`SELECT 1 FROM resources WHERE url = ${url} LIMIT 1`;
  if (exists.length === 0) {
    await sql`
      INSERT INTO resources (id, category, title, description, url, thumbnail_url, created_at)
      VALUES (${newId()}, 'video', '자동차 램프 레이저 용접, 역시 ㈜이브이레이저', '플라스틱 용접 관련 특허 기술을 다량 보유하고, 레이저 용접 분야 최다 실적을 자랑하는 ㈜이브이레이저의 자동차 램프 레이저 용접 영상입니다.', ${url}, '/resources/lamp-welding.webp', '2023-03-22T00:00:00.000Z')
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('lamp_welding_video_2023_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 중복 등록된 CE 인증서(동일 문서)를 한 번만 정리한다.
// cert-05(= cert-03 중복), cert-10(= cert-04 중복)을 제거한다.
async function ensureDedupeCeCerts(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'ce_certs_deduped'`) as { value: string }[];
  if (flag.length > 0) return;
  await sql`DELETE FROM certifications WHERE image_url IN ('/images/certifications/cert-05.jpg', '/images/certifications/cert-10.jpg')`;
  await sql`
    INSERT INTO settings (key, value) VALUES ('ce_certs_deduped', ${new Date().toISOString()})
    ON CONFLICT (key) DO NOTHING
  `;
}

// 신규 열처리 특허증과 중복되는 기존 placeholder 항목(patent-12/15/18)을 한 번만 제거한다.
async function ensureDeleteDupHeatPatents(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'dup_heat_patents_deleted'`) as { value: string }[];
  if (flag.length > 0) return;
  await sql`DELETE FROM patents WHERE image_url IN ('/images/patents/patent-12.jpg', '/images/patents/patent-15.jpg', '/images/patents/patent-18.jpg')`;
  await sql`INSERT INTO settings (key, value) VALUES ('dup_heat_patents_deleted', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 등록일이 확실히 확인되는 특허 항목에 등록일을 지정해 등록일 최신순 정렬에 반영한다.
async function ensureKnownPatentDates(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'known_patent_dates_set'`) as { value: string }[];
  if (flag.length > 0) return;
  const map: { url: string; date: string }[] = [
    { url: "/images/patents/ssw-china-cert.webp", date: "2025-12-09" },
    { url: "/images/patents/ssw-china-cert-ko.webp", date: "2025-12-09" },
    { url: "/images/patents/kr-cladding-2018.jpg", date: "2018-12-18" },
  ];
  for (const m of map) {
    await sql`UPDATE patents SET registered_on = ${m.date} WHERE image_url = ${m.url} AND registered_on IS NULL`;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('known_patent_dates_set', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 국내 열처리 관련 특허증 3건을 등록일과 함께 한 번만 추가한다(등록일 최신순으로 상단 노출).
async function ensureHeatTreatmentPatents(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'heat_treatment_patents_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const cnt = (await sql`SELECT COUNT(*)::int AS c FROM patents`) as { c: number }[];
  if (cnt[0].c === 0) return;
  const entries = [
    { url: "/images/patents/kr-surface-heat-2016.jpg", title: "금속표면 경도측정장치를 채용한 레이저 금속 표면 열처리 시스템 (특허 제10-1652180호)", date: "2016-08-23" },
    { url: "/images/patents/kr-vacuum-heat-2015.jpg", title: "레이저를 이용한 진공챔버에서의 금속표면 열처리장치 (특허 제10-1551498호)", date: "2015-09-02" },
    { url: "/images/patents/kr-crankshaft-2012.jpg", title: "크랭크샤프트용 레이저 열처리장치 (특허 제10-1202117호)", date: "2012-11-09" },
  ];
  for (const e of entries) {
    const exists = await sql`SELECT 1 FROM patents WHERE image_url = ${e.url} LIMIT 1`;
    if (exists.length === 0) {
      await sql`
        INSERT INTO patents (id, image_url, title, registered_on, sort_order, created_at)
        VALUES (${newId()}, ${e.url}, ${e.title}, ${e.date}, 0, ${new Date().toISOString()})
      `;
    }
  }
  await sql`INSERT INTO settings (key, value) VALUES ('heat_treatment_patents_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 중복된 "클래딩" 특허 항목을 한 번만 정리한다.
// - 기존 "클래딩장치"(patent-07, 제호 없음)는 실제 특허증과 겹치므로 제거.
// - "클래딩 장치 (특허 제10-1932083호)"(kr-cladding-2018)는 1건만 남기고 중복 제거.
async function ensureDedupeCladdingPatents(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'cladding_patents_deduped' `) as { value: string }[];
  if (flag.length > 0) return;
  await sql`DELETE FROM patents WHERE image_url = '/images/patents/patent-07.jpg'`;
  await sql`DELETE FROM patents a USING patents b WHERE a.image_url = '/images/patents/kr-cladding-2018.jpg' AND b.image_url = '/images/patents/kr-cladding-2018.jpg' AND a.ctid > b.ctid`;
  await sql`INSERT INTO settings (key, value) VALUES ('cladding_patents_deduped', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 구 홈페이지(evlaser.co.kr) 사내소식 게시글 전체를 뉴스·소식 > 회사소식으로 한 번만 이관한다.
// 번호·작성자·조회수·등록일·본문·이미지를 그대로 보존. 성능을 위해 UNNEST 다중행 삽입 사용.
async function ensureTidingsImport(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'tidings_imported'`) as { value: string }[];
  if (flag.length > 0) return;

  type TPost = { postNo: string; title: string; date: string; author: string | null; views: number | null; body: string; images: string[] };
  const posts = tidingsPosts as TPost[];
  if (!posts.length) return;

  const ids: string[] = [], tags: string[] = [], titles: string[] = [], dates: string[] = [];
  const bodies: string[] = [], authors: (string | null)[] = [], views: (number | null)[] = [], postNos: (string | null)[] = [];
  const imgIds: string[] = [], imgNews: string[] = [], imgUrls: string[] = [], imgSort: number[] = [];

  for (const p of posts) {
    const id = newId();
    ids.push(id); tags.push("회사소식"); titles.push(p.title); dates.push(p.date);
    bodies.push(p.body ?? ""); authors.push(p.author ?? null); views.push(p.views ?? null); postNos.push(p.postNo || null);
    p.images.forEach((url, i) => { imgIds.push(newId()); imgNews.push(id); imgUrls.push(url); imgSort.push(i); });
  }

  await sql`
    INSERT INTO news_items (id, tag, title, date, body, author, views, post_no)
    SELECT * FROM UNNEST(
      ${ids}::text[], ${tags}::text[], ${titles}::text[], ${dates}::text[],
      ${bodies}::text[], ${authors}::text[], ${views}::int[], ${postNos}::text[]
    )
  `;
  if (imgIds.length) {
    await sql`
      INSERT INTO news_images (id, news_id, url, sort_order)
      SELECT * FROM UNNEST(${imgIds}::text[], ${imgNews}::text[], ${imgUrls}::text[], ${imgSort}::int[])
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('tidings_imported', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 구 홈페이지 문의접수 목록(크롤러로 수집·마스킹한 60건)을 고객지원 게시판(support_posts)에
// 한 번만 시드한다. 이후 관리자가 수정·삭제·순서변경하며, 신규 문의도 자동 누적된다.
async function ensureSupportPostsSeed(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'support_posts_seeded'`) as { value: string }[];
  if (flag.length > 0) return;

  type SPost = { no: string; title: string; author: string; date: string; status: string };
  const posts = supportInquirySeed as SPost[];
  if (posts.length) {
    const ids: string[] = [], postNos: (string | null)[] = [], titles: string[] = [];
    const authors: (string | null)[] = [], dates: (string | null)[] = [], statuses: string[] = [], sorts: number[] = [];
    posts.forEach((p, i) => {
      ids.push(newId()); postNos.push(p.no || null); titles.push(p.title);
      authors.push(p.author || null); dates.push(p.date || null);
      statuses.push(p.status === "received" ? "received" : "answered"); sorts.push(i);
    });
    await sql`
      INSERT INTO support_posts (id, post_no, title, author, posted_on, status, sort_order)
      SELECT * FROM UNNEST(
        ${ids}::text[], ${postNos}::text[], ${titles}::text[], ${authors}::text[],
        ${dates}::text[], ${statuses}::text[], ${sorts}::int[]
      )
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('support_posts_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 구 홈페이지 주요뉴스 게시판을 뉴스·소식 > 회사소식으로 한 번만 통합한다.
// 이미 회사소식에 있는 글(시드/사내소식)은 제목으로 매칭해 조회수(및 누락 이미지)만 채우고,
// 없는 글만 신규로 추가한다. → 중복 없이 조회수까지 보존.
async function ensureMainNewsIntegration(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'mainnews_integrated'`) as { value: string }[];
  if (flag.length > 0) return;

  type MPost = { postNo: string | null; title: string; date: string; author: string | null; views: number | null; body: string; images: string[] };
  const posts = mainnewsPosts as MPost[];
  if (!posts.length) return;

  const rows = (await sql`
    SELECT n.id, n.title, n.views,
           (SELECT COUNT(*)::int FROM news_images i WHERE i.news_id = n.id) AS imgcount
    FROM news_items n WHERE n.tag = '회사소식'
  `) as { id: string; title: string; views: number | null; imgcount: number }[];

  const norm = (s: string) => (s || "").replace(/[^0-9a-z가-힣]/gi, "").toLowerCase();
  const byNorm = new Map<string, { id: string; views: number | null; imgcount: number }>();
  for (const r of rows) { const k = norm(r.title); if (!byNorm.has(k)) byNorm.set(k, r); }

  const ids: string[] = [], tags: string[] = [], titles: string[] = [], dates: string[] = [];
  const bodies: string[] = [], authors: (string | null)[] = [], views: (number | null)[] = [], postNos: (string | null)[] = [];
  const imgIds: string[] = [], imgNews: string[] = [], imgUrls: string[] = [], imgSort: number[] = [];

  for (const p of posts) {
    const m = byNorm.get(norm(p.title));
    if (m) {
      // 기존 글: 조회수가 비어 있으면 채우고, 이미지가 없으면 추가
      if (m.views == null && p.views != null) await sql`UPDATE news_items SET views = ${p.views} WHERE id = ${m.id}`;
      if (m.imgcount === 0 && p.images.length) {
        p.images.forEach((url, i) => { imgIds.push(newId()); imgNews.push(m.id); imgUrls.push(url); imgSort.push(i); });
      }
    } else {
      // 신규 글
      const id = newId();
      ids.push(id); tags.push("회사소식"); titles.push(p.title); dates.push(p.date);
      bodies.push(p.body ?? ""); authors.push(p.author ?? null); views.push(p.views ?? null); postNos.push(p.postNo || null);
      p.images.forEach((url, i) => { imgIds.push(newId()); imgNews.push(id); imgUrls.push(url); imgSort.push(i); });
    }
  }

  if (ids.length) {
    await sql`
      INSERT INTO news_items (id, tag, title, date, body, author, views, post_no)
      SELECT * FROM UNNEST(
        ${ids}::text[], ${tags}::text[], ${titles}::text[], ${dates}::text[],
        ${bodies}::text[], ${authors}::text[], ${views}::int[], ${postNos}::text[]
      )
    `;
  }
  if (imgIds.length) {
    await sql`
      INSERT INTO news_images (id, news_id, url, sort_order)
      SELECT * FROM UNNEST(${imgIds}::text[], ${imgNews}::text[], ${imgUrls}::text[], ${imgSort}::int[])
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('mainnews_integrated', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// KOREA METAL WEEK 2026 안내글은 신규 등록글이라 조회수가 비어 목록에 표시되지 않는다.
// 다른 글과 동일하게 조회수가 보이도록 표시용 초기값을 한 번만 채운다(관리자에서 수정 가능).
async function ensureMetalWeek2026Views(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'metalweek2026_views_set'`) as { value: string }[];
  if (flag.length > 0) return;
  await sql`
    UPDATE news_items SET views = 128
    WHERE title = 'KOREA METAL WEEK 2026 (금속산업대전) 참가 안내' AND views IS NULL
  `;
  await sql`INSERT INTO settings (key, value) VALUES ('metalweek2026_views_set', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 조회수 없는 신규글의 초기 조회수 정책: "같은 게시판에서 가장 최근 등록글의 조회수 -20%".
// KOREA METAL WEEK 2026 = 전시회소식 최근 실제글(2025 CIOE, 639) × 0.8 ≈ 511 로 조정.
async function ensureMetalWeek2026ViewsAdjust(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'metalweek2026_views_v2'`) as { value: string }[];
  if (flag.length > 0) return;
  await sql`
    UPDATE news_items SET views = 511
    WHERE title = 'KOREA METAL WEEK 2026 (금속산업대전) 참가 안내'
  `;
  await sql`INSERT INTO settings (key, value) VALUES ('metalweek2026_views_v2', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 구 홈페이지 전시회 게시판 전체를 뉴스·소식 > 전시회소식으로 한 번만 이관한다.
// 제목·등록일·조회수·본문·이미지 보존(등록번호·작성자는 원본 목록에 없어 미사용).
async function ensureExhibitionImport(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'exhibition_imported'`) as { value: string }[];
  if (flag.length > 0) return;

  type EPost = { postNo: string | null; title: string; date: string; author: string | null; views: number | null; body: string; images: string[] };
  const posts = exhibitionPosts as EPost[];
  if (!posts.length) return;

  const ids: string[] = [], tags: string[] = [], titles: string[] = [], dates: string[] = [];
  const bodies: string[] = [], authors: (string | null)[] = [], views: (number | null)[] = [], postNos: (string | null)[] = [];
  const imgIds: string[] = [], imgNews: string[] = [], imgUrls: string[] = [], imgSort: number[] = [];

  for (const p of posts) {
    const id = newId();
    ids.push(id); tags.push("전시회소식"); titles.push(p.title); dates.push(p.date);
    bodies.push(p.body ?? ""); authors.push(p.author ?? null); views.push(p.views ?? null); postNos.push(p.postNo || null);
    p.images.forEach((url, i) => { imgIds.push(newId()); imgNews.push(id); imgUrls.push(url); imgSort.push(i); });
  }

  await sql`
    INSERT INTO news_items (id, tag, title, date, body, author, views, post_no)
    SELECT * FROM UNNEST(
      ${ids}::text[], ${tags}::text[], ${titles}::text[], ${dates}::text[],
      ${bodies}::text[], ${authors}::text[], ${views}::int[], ${postNos}::text[]
    )
  `;
  if (imgIds.length) {
    await sql`
      INSERT INTO news_images (id, news_id, url, sort_order)
      SELECT * FROM UNNEST(${imgIds}::text[], ${imgNews}::text[], ${imgUrls}::text[], ${imgSort}::int[])
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('exhibition_imported', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 이관한 사내소식 글 끝에 붙던 EV LASER 로고 이미지를 한 번만 제거한다.
// (게시글 본문과 무관한 서명용 로고라 목록/본문 사진에서 삭제)
async function ensureRemoveTidingsLogoImages(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'tidings_logo_images_removed'`) as { value: string }[];
  if (flag.length > 0) return;
  const urls = [
    "/images/news/tidings/185_18.webp",
    "/images/news/tidings/188_21.webp",
    "/images/news/tidings/189_12.webp",
    "/images/news/tidings/190_5.webp",
  ];
  await sql`DELETE FROM news_images WHERE url = ANY(${urls}::text[])`;
  await sql`INSERT INTO settings (key, value) VALUES ('tidings_logo_images_removed', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 공지 글('방문해 주셔서 감사합니다')에 회사 로고 썸네일을 한 번만 추가한다.
async function ensureNoticeLogoThumbnail(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'notice_logo_thumbnail_added'`) as { value: string }[];
  if (flag.length > 0) return;
  const url = "/images/news/tidings/notice_logo.webp";
  const rows = (await sql`SELECT id FROM news_items WHERE post_no = '공지' AND tag = '회사소식' LIMIT 1`) as { id: string }[];
  if (rows.length > 0) {
    const newsId = rows[0].id;
    const exists = await sql`SELECT 1 FROM news_images WHERE news_id = ${newsId} AND url = ${url} LIMIT 1`;
    if (exists.length === 0) {
      await sql`INSERT INTO news_images (id, news_id, url, sort_order) VALUES (${newId()}, ${newsId}, ${url}, 0)`;
    }
  }
  await sql`INSERT INTO settings (key, value) VALUES ('notice_logo_thumbnail_added', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// '경제인뉴스 CEO 인터뷰 진행'(#111, idx 182) 글 보정: 무관한 텍스트 배너(182_1) 삭제,
// 대표 사진(182_4)을 썸네일(맨 앞)로 지정. 한 번만 실행.
async function ensureFixPost111Images(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'post111_images_fixed'`) as { value: string }[];
  if (flag.length > 0) return;
  await sql`DELETE FROM news_images WHERE url = '/images/news/tidings/182_1.webp'`;
  await sql`UPDATE news_images SET sort_order = -1 WHERE url = '/images/news/tidings/182_4.webp'`;
  await sql`INSERT INTO settings (key, value) VALUES ('post111_images_fixed', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 뉴스·소식 전반(회사소식·전시회소식)에 섞여 있던 흰 배경 EV LASER 로고 이미지를
// 크기·색상 변형까지 모두 한 번에 제거한다(본문과 무관한 서명/장식용).
async function ensureRemoveNewsLogoImagesV2(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'news_logo_images_removed_v2'`) as { value: string }[];
  if (flag.length > 0) return;
  const urls = [
    // 회사소식(tidings)
    "/images/news/tidings/1_1.webp",
    "/images/news/tidings/171_1.webp",
    "/images/news/tidings/171_20.webp",
    "/images/news/tidings/173_7.webp",
    "/images/news/tidings/174_8.webp",
    "/images/news/tidings/176_6.webp",
    "/images/news/tidings/177_10.webp",
    "/images/news/tidings/178_13.webp",
    "/images/news/tidings/181_10.webp",
    "/images/news/tidings/182_7.webp",
    "/images/news/tidings/191_7.webp",
    "/images/news/tidings/192_5.webp",
    "/images/news/tidings/194_15.webp",
    // 전시회소식(exhibition)
    "/images/news/exhibition/105_16.webp",
    "/images/news/exhibition/106_10.webp",
    "/images/news/exhibition/107_7.webp",
  ];
  await sql`DELETE FROM news_images WHERE url = ANY(${urls}::text[])`;
  await sql`INSERT INTO settings (key, value) VALUES ('news_logo_images_removed_v2', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 한국무역협회(KITA) 회원증을 인증서 목록 맨 끝에 한 번만 추가한다.
async function ensureKitaMembershipCert(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'kita_membership_cert_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const cnt = (await sql`SELECT COUNT(*)::int AS c FROM certifications`) as { c: number }[];
  if (cnt[0].c === 0) return;
  const url = "/images/certifications/kita-membership.webp";
  const exists = await sql`SELECT 1 FROM certifications WHERE image_url = ${url} LIMIT 1`;
  if (exists.length === 0) {
    const maxRow = (await sql`SELECT COALESCE(MAX(sort_order), 0) AS m FROM certifications`) as { m: number }[];
    await sql`
      INSERT INTO certifications (id, image_url, title, subtitle, sort_order, created_at)
      VALUES (${newId()}, ${url}, '한국무역협회(KITA) 회원증', 'Certificate of Membership (KITA)', ${maxRow[0].m + 1}, ${new Date().toISOString()})
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('kita_membership_cert_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 국내 특허증 "클래딩 장치"(제10-1932083호, 출원 2016.08.11)를 한 번만 추가한다.
// 출원연도(2016)에 맞게 SSW(2023~) 그룹보다 앞, 기존 "클래딩장치" 항목 옆에 배치한다.
async function ensureCladdingCert2018(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'cladding_cert_2018_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const cnt = (await sql`SELECT COUNT(*)::int AS c FROM patents`) as { c: number }[];
  if (cnt[0].c === 0) return;
  const url = "/images/patents/kr-cladding-2018.jpg";
  const exists = await sql`SELECT 1 FROM patents WHERE image_url = ${url} LIMIT 1`;
  if (exists.length === 0) {
    // 기존 "클래딩장치"(patent-07.jpg) 바로 뒤에 오도록 동일 sort_order로 삽입(최신 created_at → 뒤에 정렬).
    const sib = (await sql`SELECT sort_order FROM patents WHERE image_url = '/images/patents/patent-07.jpg' LIMIT 1`) as { sort_order: number }[];
    const order = sib.length ? sib[0].sort_order : 6;
    await sql`
      INSERT INTO patents (id, image_url, title, registered_on, sort_order, created_at)
      VALUES (${newId()}, ${url}, '클래딩 장치 (특허 제10-1932083호)', ${null}, ${order}, ${new Date().toISOString()})
    `;
  }
  await sql`INSERT INTO settings (key, value) VALUES ('cladding_cert_2018_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 중국 특허증서의 한글 번역본(이미지 + 다운로드 PDF)을 중국어 원문 바로 옆에 한 번만 추가하고,
// SSW 특허 3건(중국 원문 → 한글본 → 미국)을 특허 목록 맨 끝에 이 순서로 정렬한다.
async function ensureSswChinaCertKo(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'ssw_china_cert_ko_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const cnt = (await sql`SELECT COUNT(*)::int AS c FROM patents`) as { c: number }[];
  if (cnt[0].c === 0) return;
  const koUrl = "/images/patents/ssw-china-cert-ko.webp";
  const pdf = "/patents/ssw-china-cert-ko.pdf";
  const exists = await sql`SELECT 1 FROM patents WHERE image_url = ${koUrl} LIMIT 1`;
  if (exists.length === 0) {
    await sql`
      INSERT INTO patents (id, image_url, title, registered_on, file_url, file_name, sort_order, created_at)
      VALUES (${newId()}, ${koUrl}, 'Super Scan Welding기술 중국특허등록 (한글 번역본)', ${null}, ${pdf}, 'SSW_중국특허증_한글번역본.pdf', 9002, ${new Date().toISOString()})
    `;
  } else {
    await sql`UPDATE patents SET file_url = ${pdf}, file_name = 'SSW_중국특허증_한글번역본.pdf' WHERE image_url = ${koUrl}`;
  }
  // 중국 원문 → 한글본 → 미국 순서로 맨 끝에 배치.
  await sql`UPDATE patents SET sort_order = 9001 WHERE image_url = '/images/patents/ssw-china-cert.webp'`;
  await sql`UPDATE patents SET sort_order = 9002 WHERE image_url = ${koUrl}`;
  await sql`UPDATE patents SET sort_order = 9003 WHERE image_url = '/images/patents/ssw-us-patent.webp'`;
  await sql`INSERT INTO settings (key, value) VALUES ('ssw_china_cert_ko_seeded', ${new Date().toISOString()}) ON CONFLICT (key) DO NOTHING`;
}

// 특허 목록 맨 뒤의 중국어 "통보서"(ssw-china-patent)를 제거하고, 그 자리에
// 실제 중국 특허증서 → 미국 특허 순으로 한 번만 추가한다.
async function ensureSswChinaUsPatents(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'ssw_china_us_patents_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const cnt = (await sql`SELECT COUNT(*)::int AS c FROM patents`) as { c: number }[];
  // 비어 있으면 seedPatentsIfEmpty가 data.ts(맨 끝)로 시딩하므로 건드리지 않는다.
  if (cnt[0].c === 0) return;
  // 이전에 등록된 통보서 항목 제거.
  await sql`DELETE FROM patents WHERE image_url = '/images/patents/ssw-china-patent.webp'`;
  const entries = [
    { url: "/images/patents/ssw-china-cert.webp", title: "Super Scan Welding기술 중국특허등록" },
    { url: "/images/patents/ssw-us-patent.webp", title: "Super Scan Welding기술 미국특허 출원" },
  ];
  for (const e of entries) {
    const exists = await sql`SELECT 1 FROM patents WHERE image_url = ${e.url} LIMIT 1`;
    if (exists.length === 0) {
      const maxRow = (await sql`SELECT COALESCE(MAX(sort_order), 0) AS m FROM patents`) as { m: number }[];
      await sql`
        INSERT INTO patents (id, image_url, title, registered_on, sort_order, created_at)
        VALUES (${newId()}, ${e.url}, ${e.title}, ${null}, ${maxRow[0].m + 1}, ${new Date().toISOString()})
      `;
    }
  }
  await sql`
    INSERT INTO settings (key, value) VALUES ('ssw_china_us_patents_seeded', ${new Date().toISOString()})
    ON CONFLICT (key) DO NOTHING
  `;
}

// 언론·연구활동 첫 게시물(강소기업뉴스 인터뷰, 2025.11.19)을 한 번만 등록한다.
async function ensurePressInterview2025(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'press_interview_2025_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const body = [
    "자동차의 카메라, 레이더, 센서, 구동장치, 필터, 램프, 전자제어장치, 배터리 등은 최첨단 기술이 접목된 자동차와 자율주행차량의 성능 및 안전과 직결되는 핵심 부품이다. 이브이레이저는 이런 자동차 부품의 플라스틱 접합 과정에서 전통적으로 적용되어 오는 초음파 융착이나 접착제를 이용한 방식을 '레이저 플라스틱 용접 공법'으로 대체함으로써 자동차부품의 신뢰성, 안정성, 내구성, 생산성 그리고 정밀도의 한계를 바꿔냈다. 이 공법을 통해 주요 고객사들은 생산 효율과 품질 신뢰성을 함께 높였다.",
    "엔지니어 출신인 한상배 대표는 기술을 실제 생산 효율로 연결하는 데 힘써왔다. 현재 이브이레이저는 국내 레이저 플라스틱 용접 분야를 이끌고 있다. 국내 완성차 기업의 후미등과 카메라·센서 모듈, 램프류 공정은 물론 해외 완성차의 카메라 하우징 공정에도 이브이레이저의 레이저 플라스틱 용접 기술이 적용되고 있다. 이러한 성과를 바탕으로 2022년 중국 쑤저우에 현지 법인과 공장을 설립하며 중국 시장에 진출함과 동시에 본격적인 글로벌 행보에 나섰다. 한상배 대표와 인터뷰를 나누었다.",
    "Q. 사업을 시작한 계기는 무엇인가.",
    "현대자동차 계열사인 자동차부품을 제조하는 대기업에서 엔지니어로 일하며 산업 현장에서 레이저 기술의 가능성을 직접 봤다. 이 기술이 제대로 활용되면 제조 품질과 효율이 크게 달라질 수 있겠다는 확신이 들었다. 그 생각으로 2002년, 서른을 갓 넘긴 나이에 이브이레이저를 설립했다. 그때만 해도 레이저와 레이저 용접 기술은 낯선 기술이었다. 고객사들도 새로운 공법을 쉽게 받아들이지 않았다. 그래도 개발을 이어가며 기술을 다듬었고, 하나씩 결과로 보여주기 시작했다. 지금은 자동차, 전자, 기계, 의료 등 여러 산업에서 고객 맞춤형 레이저솔루션을 제공하는 회사로 성장했다. 그중에서도 핵심은 '레이저 플라스틱 용접' 기술이다. 창업 초기부터 쌓아온 노하우와 끊임없는 기술개발의 노력 덕분에 국내 최고 수준의 기술력과 시장 점유율을 가지고 있는 것으로 평가받고 있다.",
    "Q. 현재 운영하는 비즈니스를 상세히 설명한다면.",
    "이브이레이저는 산업용 레이저 응용 기술을 전문으로 한다. 연구개발부터 설계, 생산, 품질관리, 영업, 마케팅, 그리고 A/S까지 모든 과정을 직접 진행한다. 외주에 의존하지 않고 전 과정을 스스로 통제할 수 있다는 점이 우리의 가장 큰 강점이다. 현재 반도체, 디스플레이, 이차전지, 자동차 부품, 의료기기 등 여러 산업에서 요구되는 맞춤형 레이저솔루션을 제공하고 있다. 최근에는 우리만의 독자 기술인 SSW(Super Scan Welding System)을 완성했다. 고출력 레이저와 2D 스캐너 그리고 광섬유를 활용하여 개발되었다. 27번째 국내 특허로 등록되었으며 중국과 미국, 유럽, 일본 등의 국가에도 국제특허가 등록된 기술로서, 빠른 용접 속도와 실시간 품질관리, 낮은 운전 비용, 높은 범용성, 우수한 확장성 그리고 사용자 편의성 등을 모두 갖췄다. 기존의 초음파 융착, 접착제 접합은 물론 일반적인 방식의 레이저 용접 기술이 사용되던 자동차 카메라, 센서, 레이더, 구동장치, 모터, 배터리, 필터, 램프 같은 제품들은 앞으로 이 SSW 공법으로 대체될 것이다.",
    "Q. 레이저 플라스틱 용접이 기존 공법에 비해 가진 장점은.",
    "기존 접착제 방식은 제조원가 상승과 함께 환경오염을 유발하고 유지보수의 어려움과 플라스틱 부품의 재활용에도 제약이 있었다. 초음파 용접은 접촉식 공법으로써 소음이 발생하고 접합강도나 외관 불량 그리고 누설 불량으로 인한 품질 문제가 꾸준히 제기되고 있다. 레이저 용접은 접착제를 쓰지 않아 친환경적이며, 비접촉식 공법이라 제품에 가해지는 충격과 소음이 없고, 우수한 접합강도와 완벽한 수밀 그리고 뛰어난 외관 품질 등 여러 가지 면에서 종래의 공법에 비하여 매우 우수한 기술적 특성을 가진다. 이런 특성 덕분에 자동차 산업에서는 점차 기존 공법을 대체하고 있다.",
    "Q. 독자적 레이저 플라스틱 용접 공법 'SSW'의 차별점은.",
    "국제 특허로 등록된 SSW 기술은 고출력 레이저와 2D 스캐너 그리고 광섬유를 결합한 최첨단의 레이저 용접 기술로서, 기존 레이저 용접 공정보다 생산 속도와 용접된 제품의 품질을 향상한 기술이다. 기존 레이저 용접은 레이저빔의 형상이나 레이저 출력 그리고 용접 시의 플라스틱 재료 온도를 사람의 눈으로 확인할 수 없었지만, SSW 기술은 실시간 레이저빔의 특성을 측정하는 기술과 함께 플라스틱 재료의 온도를 실시간으로 측정하고 관리함으로써 레이저를 이용한 플라스틱의 용접 공정에서 요구되는 핵심 주요 변수들을 관리하여 실시간으로 고객이 생산하고 있는 제품의 품질관리가 가능하게 했다. 한 대의 장비로 여러 제품을 동시 생산할 수 있어 생산성도 높다. 앞으로 자동차부품 산업은 물론 전자, 의료, 바이오, 생활용품, 화장품 용기 등 플라스틱 접합이 필요한 다양한 제품들에 이 기술이 적용될 것이다.",
    "Q. 실제 산업 현장에서 어떻게 사용되고 있나.",
    "이브이레이저의 기술은 국내 주요 완성차 기업의 후미등, 램프, 카메라, 센서 모듈, 제어장치, 브레이크장치, 필터 등 거의 모든 자동차부품의 제조 공정에 적용되고 있다. 해외 완성차 업체의 후방 카메라 및 측방 카메라 그리고 라이다와 센서 등의 전장부품에도 당사의 레이저 플라스틱 용접 기술이 사용되고 있으며, 최근 자율주행차 산업이 성장하면서 사이드·후방 카메라, 레이더, 레이더 보호 하우징 등 핵심 부품 공정에서 레이저 플라스틱 용접 기술의 활용이 빠르게 늘고 있다. 화장품 플라스틱 용기 제조 분야에서도 수요가 확대되고 있으며, 의료기기 분야는 향후 성장 가능성이 큰 시장으로 보고 진출을 준비 중이다. 이브이레이저는 레이저발진기와 투과율 측정장치, 전용 소프트웨어, 제어장치 등 핵심 장치들을 직접 개발하여 생산함으로써 국내는 물론 해외시장에서도 가격경쟁력과 기술경쟁력을 강화하였다.",
    "Q. 경영철학이 궁금하다.",
    "우리 회사는 '더 좋은 레이저 기술로 더 좋은 세상을 만든다'라는 생각을 가치로 두고 있다. 기술 혁신을 통해 사람의 삶 그리고 산업생태계 전체를 더 나은 방향으로 이끌자는 신념이 모든 경영 판단의 기준이 된다. 열린 소통과 창의적인 시도를 존중한다. 직원이 자유롭게 도전하고 성장할 수 있는 환경을 만드는 것이 곧 기술경쟁력이라고 믿는다. 기술은 결국 사람에게서 나오고, 함께 성장할 때 진짜 발전이 이뤄진다고 생각한다.",
    "Q. 사업을 하면서 기억에 남는 순간은 언제였나.",
    "2022년 중국 쑤저우에 현지 법인과 공장을 세웠을 때가 가장 기억에 남는다. 세계 최대의 자동차 제조 시장인 중국에서 우리의 레이저 플라스틱 용접 기술이 글로벌 경쟁사들과 어깨를 나란히 하고 이제 제대로 인정받을 수 있을 것이라는 사실이 무척 뜻깊었다. 최근에는 YTN 프로그램 '최강 기업'을 통해 우리 기술력과 품질관리 체계를 소개할 기회도 있었다. 국내 최고 수준의 레이저 기술을 대중에게 알릴 수 있었다는 점에서 큰 보람을 느꼈다.",
    "Q. 2022년 중국 쑤저우 현지 법인 및 공장 설립의 의미와 글로벌 로드맵은.",
    "주요 고객사는 중견·대기업급 자동차 부품사다. 국내 시장 점유율은 매우 높지만, 국내 시장의 규모가 비교적 크지 않다. 국내에서 개발된 기술을 세계로 더 많이 알리는 한편 이 기술에 반영된 기술경쟁력과 원가경쟁력을 바탕으로 해외시장의 문을 두드림으로써 시장의 한계를 극복하고자 하였다. 중국은 전 세계 자동차 생산의 약 30%가 집중된 시장으로, 우리의 주력 사업 분야인 레이저 용접 기술의 성장 가능성이 가장 높은 지역이다. 이런 판단에 따라 2022년 2월, 코로나가 한창 진행 중이던 시기임에도 불구하고 중국 쑤저우에 현지 법인과 공장을 설립하였다. 쑤저우 법인은 중국 내 생산 거점이자 영업, 홍보, 서비스, 기술개발의 거점으로서 중국 내 완성차 및 부품사와의 협력을 확대하는 역할을 하고 있다. 한국 본사는 미국, 유럽, 동남아 시장을 중심으로 전시회 참가와 마케팅 활동을 이어가고 있다. 앞으로 수출 비중을 50% 이상으로 높이고, 중국 시장 점유율 20% 이상을 달성하는 것이 중장기 목표다.",
    "Q. 향후 비전인 '세계가 인정하는 레이저 선도기업'이 되기 위한 전략이 있다면.",
    "수출 비중 50% 그리고 중국 시장 점유율 20% 이상을 달성하기 위하여, 글로벌 연구 협력을 통한 지속적인 신기술 개발과 함께 국내외 기업과 기관으로부터의 투자유치에도 적극적으로 나서고 있다. 자동차 부품, 이차전지, 반도체, 의료기기 등 다양한 산업에서 활용할 수 있는 친환경 레이저 가공 기술을 차례대로 선보일 계획이다. 이브이레이저는 레이저 플라스틱 용접 기술 분야에서 세계가 인정하는 기업으로 성장하고자 한다. 풍부한 경험을 바탕으로 한 지속적인 연구개발과 인재 채용 그리고 적극적인 투자유치 활동 등을 통하여 한국 본사와 중국 쑤저우 법인을 거점으로 미국과 유럽 시장에서도 브랜드 인지도와 시장 점유율을 높여갈 예정이다.",
    "※ 본 기사의 전문은 하단의 PDF 원문에서 확인하실 수 있습니다. (저작권자 ⓒ 강소기업뉴스 무단전재 및 재배포 금지)",
  ].join("\n\n");

  await sql`
    INSERT INTO press_items (id, category, title, source, date, body, link_url, pdf_url, pdf_name, thumbnail_url, published, sort_order, created_at)
    VALUES (
      ${newId()}, 'media',
      ${"[인터뷰] 정밀한 한 점의 레이저 빔, 자동차의 성능과 품질을 바꾸다 — 이브이레이저 한상배 대표"},
      ${"강소기업뉴스 · 양해원 객원기자"}, '2025.11.19', ${body},
      ${null}, ${"/press/evlaser-kangso-interview-2025.pdf"}, ${"이브이레이저_강소기업뉴스_인터뷰_2025-11-19.pdf"}, ${"/press/kangso-interview-ceo.webp"},
      true, 0, ${new Date().toISOString()}
    )
  `;
  await sql`
    INSERT INTO settings (key, value) VALUES ('press_interview_2025_seeded', ${new Date().toISOString()})
    ON CONFLICT (key) DO NOTHING
  `;
}

// 이미 시딩된 환경의 인증서 목록 맨 앞에 "사업자등록증"을 한 번만 추가한다.
// settings 플래그로 1회성 등록을 보장하므로 관리자가 삭제해도 다시 생기지 않는다.
async function ensureBusinessRegistrationCert(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'business_reg_cert_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const cnt = (await sql`SELECT COUNT(*)::int AS c FROM certifications`) as { c: number }[];
  // 비어 있으면 seedCertificationsIfEmpty가 data.ts(맨 앞 index 0)로 시딩하므로 건드리지 않는다.
  if (cnt[0].c === 0) return;
  const url = "/images/certifications/business-registration.webp";
  const exists = await sql`SELECT 1 FROM certifications WHERE image_url = ${url} LIMIT 1`;
  if (exists.length === 0) {
    const minRow = (await sql`SELECT COALESCE(MIN(sort_order), 0) AS m FROM certifications`) as { m: number }[];
    await sql`
      INSERT INTO certifications (id, image_url, title, subtitle, sort_order, created_at)
      VALUES (${newId()}, ${url}, '사업자등록증', 'Business Registration Certificate', ${minRow[0].m - 1}, ${new Date().toISOString()})
    `;
  }
  await sql`
    INSERT INTO settings (key, value) VALUES ('business_reg_cert_seeded', ${new Date().toISOString()})
    ON CONFLICT (key) DO NOTHING
  `;
}

// KOREA METAL WEEK 2026(금속산업대전) 전시회소식 게시글을 사진과 함께 한 번만 등록한다.
// settings 플래그로 1회성 등록을 보장하므로, 관리자가 이후 글을 삭제해도 다시 생기지 않는다.
async function ensureMetalWeek2026News(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'metalweek2026_news_seeded'`) as { value: string }[];
  if (flag.length > 0) return;

  const newsId = newId();
  const body = [
    "[행사 개요]",
    "전시회명 : KOREA METAL WEEK 2026 (금속산업대전)",
    "기간 : 2026년 10월 28일(수) ~ 30일(금)",
    "장소 : 일산 KINTEX 제1전시장 (1·3홀), 경기도 고양시",
    "전시분야 : 레이저·용접 설비, 파스너&와이어, 주조&다이캐스팅, 프레스&단조 등 금속산업 전 분야",
    "",
    "㈜이브이레이저가 국내 최대 금속산업 전문 전시회인 KOREA METAL WEEK(금속산업대전)에 참가합니다. 금속·플라스틱 정밀 가공을 위한 당사의 레이저 솔루션과 용접 소재를 현장에서 직접 만나보실 수 있습니다.",
    "",
    "[주요 전시 품목]",
    "· 레이저 가공 시스템 (Fiber & Diode, Up to 1200W / CNC & Handheld / 절단·용접·클리닝·마킹)",
    "· 용접 소재(Welding Wire) 라인업 — 서브머지드 아크(SAW) / TIG(GTAW) / 플럭스 코어드(FCW) / 알루미늄 / 동도금",
    "(아래 사진 참조)",
    "",
    "[방문 안내]",
    "부스에서는 당사 엔지니어가 설비 시연과 함께 기술·사양 상담을 진행합니다. 사전 상담 예약을 원하시면 아래 문의처로 연락 주시기 바랍니다.",
    "문의 : ㈜이브이레이저 · Tel 031-452-9860 · info@evlaser.co.kr",
    "공식 홈페이지 : korea-metal.com",
  ].join("\n");

  await sql`
    INSERT INTO news_items (id, tag, title, date, body, published, created_at)
    VALUES (${newsId}, '전시회소식', 'KOREA METAL WEEK 2026 (금속산업대전) 참가 안내', '2026.10.28', ${body}, true, ${new Date().toISOString()})
  `;

  const images: { url: string; caption: string; content: string }[] = [
    { url: "/images/news/metalweek2026/laser-system.jpg", caption: "레이저 가공 시스템 (Fiber & Diode)", content: "Up to 1200W · CNC & Handheld · 절단/용접/클리닝/마킹 · ±0.01mm" },
    { url: "/images/news/metalweek2026/wire-saw.jpg", caption: "서브머지드 아크 용접 와이어 (SAW)", content: "Submerged Arc Welding Wire" },
    { url: "/images/news/metalweek2026/wire-gtaw.jpg", caption: "TIG 용접봉 (GTAW)", content: "Gas Tungsten Arc Welding Wire" },
    { url: "/images/news/metalweek2026/wire-fcw.jpg", caption: "플럭스 코어드 와이어 (FCW)", content: "Flux Cored Welding Wire" },
    { url: "/images/news/metalweek2026/wire-aluminum.jpg", caption: "알루미늄 용접 와이어", content: "Aluminum Welding Wire" },
    { url: "/images/news/metalweek2026/wire-copper.jpg", caption: "동(銅)도금 용접 와이어", content: "Copper Plated Welding Wire" },
  ];
  for (let i = 0; i < images.length; i++) {
    await sql`
      INSERT INTO news_images (id, news_id, url, caption, content, sort_order, created_at)
      VALUES (${newId()}, ${newsId}, ${images[i].url}, ${images[i].caption}, ${images[i].content}, ${i}, ${new Date().toISOString()})
    `;
  }

  await sql`
    INSERT INTO settings (key, value) VALUES ('metalweek2026_news_seeded', ${new Date().toISOString()})
    ON CONFLICT (key) DO NOTHING
  `;
}

// spec_options가 비어 있으면 정식 옵션 목록을 시딩하고, 이전 배포의 예시 목록으로만
// 채워져 있으면(관리자가 아직 편집하지 않은 상태) 정식 목록으로 한 번 교체한다.
// 관리자가 이미 손댄 경우(예시값 외 항목이 하나라도 있으면)에는 건드리지 않는다.
async function ensureSpecOptionsDefault(): Promise<void> {
  const rows = (await sql`SELECT label FROM spec_options`) as { label: string }[];
  const labels = rows.map((r) => r.label);
  const untouched = labels.length === 0 || labels.every((l) => specOptionLegacyDefaults.includes(l));
  if (!untouched) return;
  await sql`DELETE FROM spec_options`;
  for (let i = 0; i < specOptionDefaults.length; i++) {
    await sql`
      INSERT INTO spec_options (id, label, sort_order, created_at)
      VALUES (${newId()}, ${specOptionDefaults[i]}, ${i}, ${new Date().toISOString()})
    `;
  }
}

// 이미 시딩된 환경의 산업분야별 목록에 "전자·3C" 항목을 한 번만 추가한다
// (FPC/PCB 등 3C 전자 산업 분류용). 이미 있으면 아무 것도 하지 않는다.
async function ensureElectronics3cIndustry(): Promise<void> {
  const already = await sql`SELECT 1 FROM content_items WHERE group_key = 'industry' AND item_key = 'electronics3c' LIMIT 1`;
  if (already.length > 0) return;
  const rows = (await sql`SELECT COUNT(*)::int AS c FROM content_items WHERE group_key = 'industry'`) as { c: number }[];
  // 그룹이 비어 있으면 seedContentItemsIfEmpty(industries)가 전체를 시딩하므로 건드리지 않는다.
  if (rows[0].c === 0) return;
  await sql`
    INSERT INTO content_items (id, group_key, item_key, name, icon, sort_order, created_at)
    VALUES (${newId()}, 'industry', 'electronics3c', '전자·3C', 'pcb', ${rows[0].c}, ${new Date().toISOString()})
    ON CONFLICT (group_key, item_key) DO NOTHING
  `;
}

// 기술종류별 항목이 이미 시딩된 환경(빈 그룹에만 적용되는 seedContentItemsIfEmpty
// 로는 반영되지 않음)에도 "레이저마킹"과 "레이저에칭" 사이에 "레이저솔더링(납땜)"
// 항목과 그 소개 내용을 한 번만 끼워 넣기 위한 보정. 이미 있으면 아무 것도 하지 않는다.
async function ensureLaserSolderingTechItem(): Promise<void> {
  const already = await sql`SELECT 1 FROM content_items WHERE group_key = 'tech' AND item_key = 'soldering' LIMIT 1`;
  if (already.length > 0) return;

  const rows = (await sql`
    SELECT id, item_key, sort_order FROM content_items WHERE group_key = 'tech' ORDER BY sort_order ASC, created_at ASC
  `) as { id: string; item_key: string; sort_order: number }[];
  // 그룹이 아직 비어 있으면 seedContentItemsIfEmpty(techItems)가 알아서
  // (이미 올바른 순서로 재배치된) 전체 목록을 시딩하므로 여기서는 건드리지 않는다.
  if (rows.length === 0) return;

  const etchingIdx = rows.findIndex((r) => r.item_key === "etching");
  const insertIndex = etchingIdx === -1 ? rows.length : etchingIdx;

  await sql`UPDATE content_items SET sort_order = sort_order + 1 WHERE group_key = 'tech' AND sort_order >= ${insertIndex}`;
  await sql`
    INSERT INTO content_items (id, group_key, item_key, name, icon, sort_order, created_at)
    VALUES (${newId()}, 'tech', 'soldering', '레이저솔더링(납땜)', 'weld', ${insertIndex}, ${new Date().toISOString()})
    ON CONFLICT (group_key, item_key) DO NOTHING
  `;

  const solderingSeed = techPageSeeds.find((s) => s.key === "soldering");
  if (solderingSeed) {
    await sql`
      INSERT INTO content_pages (group_key, item_key, title, description, updated_at)
      VALUES ('tech', 'soldering', ${solderingSeed.title}, ${solderingSeed.description}, ${new Date().toISOString()})
      ON CONFLICT (group_key, item_key) DO NOTHING
    `;
  }
}

export function ensureSchema(): Promise<void> {
  if (!global.__evlaserSchemaReady) {
    global.__evlaserSchemaReady = createSchema();
  }
  return global.__evlaserSchemaReady;
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

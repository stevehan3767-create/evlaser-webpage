import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { techPageSeeds, specOptionDefaults, specOptionLegacyDefaults } from "./data";

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
    await ensureSswChinaPatent();
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
  })();
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

// 이미 시딩된 환경의 특허 목록 맨 뒤에 "Super Scan Welding기술 중국특허등록"을 한 번만 추가한다.
async function ensureSswChinaPatent(): Promise<void> {
  const flag = (await sql`SELECT value FROM settings WHERE key = 'ssw_china_patent_seeded'`) as { value: string }[];
  if (flag.length > 0) return;
  const cnt = (await sql`SELECT COUNT(*)::int AS c FROM patents`) as { c: number }[];
  // 비어 있으면 seedPatentsIfEmpty가 data.ts(맨 끝)로 시딩하므로 건드리지 않는다.
  if (cnt[0].c === 0) return;
  const url = "/images/patents/ssw-china-patent.webp";
  const exists = await sql`SELECT 1 FROM patents WHERE image_url = ${url} LIMIT 1`;
  if (exists.length === 0) {
    const maxRow = (await sql`SELECT COALESCE(MAX(sort_order), 0) AS m FROM patents`) as { m: number }[];
    await sql`
      INSERT INTO patents (id, image_url, title, registered_on, sort_order, created_at)
      VALUES (${newId()}, ${url}, 'Super Scan Welding기술 중국특허등록', ${null}, ${maxRow[0].m + 1}, ${new Date().toISOString()})
    `;
  }
  await sql`
    INSERT INTO settings (key, value) VALUES ('ssw_china_patent_seeded', ${new Date().toISOString()})
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

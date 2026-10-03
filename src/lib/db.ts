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

    await ensureLaserSolderingTechItem();
    await ensureElectronics3cIndustry();
    await ensureSpecOptionsDefault();
    await ensureMetalWeek2026News();
  })();
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

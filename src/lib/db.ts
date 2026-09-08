import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

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
  })();
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

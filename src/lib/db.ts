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
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

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
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

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
    // (lineup/tech/industry/material): title + long-form description, plus
    // application-case cards (product name / equipment image / video / product image).
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
    // content_pages existed before image_url was added; make sure older
    // deployments pick it up too.
    await sql`ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS image_url TEXT`;

    await sql`
      CREATE TABLE IF NOT EXISTS content_cases (
        id TEXT PRIMARY KEY,
        group_key TEXT NOT NULL,
        item_key TEXT NOT NULL,
        product_name TEXT NOT NULL,
        equipment_image_url TEXT,
        video_url TEXT,
        product_image_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    // General-purpose photo gallery per content page (e.g. 설비 사진/샘플
    // 사진), separate from the "적용사례" cases above.
    await sql`
      CREATE TABLE IF NOT EXISTS content_images (
        id TEXT PRIMARY KEY,
        group_key TEXT NOT NULL,
        item_key TEXT NOT NULL,
        url TEXT NOT NULL,
        caption TEXT,
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

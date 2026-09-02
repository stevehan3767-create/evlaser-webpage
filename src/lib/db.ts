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

    // Generic article storage shared by every /products/[group]/[key] section
    // (lineup/tech/industry/material): title + long-form description, plus
    // application-case cards (product name / equipment image / video / product image).
    await sql`
      CREATE TABLE IF NOT EXISTS content_pages (
        group_key TEXT NOT NULL,
        item_key TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (group_key, item_key)
      )
    `;

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

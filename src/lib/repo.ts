import { sql, ensureSchema, newId } from "./db";

export interface Inquiry {
  id: string;
  channel: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  industry: string | null;
  message: string;
  emailSent: boolean;
  createdAt: string;
}

export interface ResourceRow {
  id: string;
  category: string;
  title: string;
  description: string;
  url: string | null;
  createdAt: string;
}

export interface NewsRow {
  id: string;
  tag: string;
  title: string;
  date: string;
  body: string;
  published: boolean;
  createdAt: string;
}

function rowToInquiry(r: Record<string, unknown>): Inquiry {
  return {
    id: r.id as string,
    channel: r.channel as string,
    name: r.name as string,
    company: (r.company as string) ?? null,
    email: r.email as string,
    phone: (r.phone as string) ?? null,
    industry: (r.industry as string) ?? null,
    message: r.message as string,
    emailSent: Boolean(r.email_sent),
    createdAt: r.created_at as string,
  };
}

function rowToResource(r: Record<string, unknown>): ResourceRow {
  return {
    id: r.id as string,
    category: r.category as string,
    title: r.title as string,
    description: r.description as string,
    url: (r.url as string) ?? null,
    createdAt: r.created_at as string,
  };
}

function rowToNews(r: Record<string, unknown>): NewsRow {
  return {
    id: r.id as string,
    tag: r.tag as string,
    title: r.title as string,
    date: r.date as string,
    body: (r.body as string) ?? "",
    published: Boolean(r.published),
    createdAt: r.created_at as string,
  };
}

export interface TechPageRow {
  key: string;
  title: string;
  description: string;
  updatedAt: string;
}

export interface TechCaseRow {
  id: string;
  techKey: string;
  productName: string;
  equipmentImageUrl: string | null;
  videoUrl: string | null;
  productImageUrl: string | null;
  createdAt: string;
}

function rowToTechPage(r: Record<string, unknown>): TechPageRow {
  return {
    key: r.key as string,
    title: (r.title as string) ?? "",
    description: (r.description as string) ?? "",
    updatedAt: r.updated_at as string,
  };
}

function rowToTechCase(r: Record<string, unknown>): TechCaseRow {
  return {
    id: r.id as string,
    techKey: r.tech_key as string,
    productName: r.product_name as string,
    equipmentImageUrl: (r.equipment_image_url as string) ?? null,
    videoUrl: (r.video_url as string) ?? null,
    productImageUrl: (r.product_image_url as string) ?? null,
    createdAt: r.created_at as string,
  };
}

export const inquiryRepo = {
  async create(input: {
    channel: string;
    name: string;
    company?: string;
    email: string;
    phone?: string;
    industry?: string;
    message: string;
    emailSent: boolean;
  }): Promise<Inquiry> {
    await ensureSchema();
    const id = newId();
    const createdAt = new Date().toISOString();
    await sql`
      INSERT INTO inquiries (id, channel, name, company, email, phone, industry, message, email_sent, created_at)
      VALUES (${id}, ${input.channel}, ${input.name}, ${input.company ?? null}, ${input.email}, ${input.phone ?? null}, ${input.industry ?? null}, ${input.message}, ${input.emailSent}, ${createdAt})
    `;
    return {
      id,
      createdAt,
      channel: input.channel,
      name: input.name,
      company: input.company ?? null,
      email: input.email,
      phone: input.phone ?? null,
      industry: input.industry ?? null,
      message: input.message,
      emailSent: input.emailSent,
    };
  },
  async list(): Promise<Inquiry[]> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM inquiries ORDER BY created_at DESC`;
    return (rows as Record<string, unknown>[]).map(rowToInquiry);
  },
};

export const resourceRepo = {
  async list(): Promise<ResourceRow[]> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM resources ORDER BY created_at DESC`;
    return (rows as Record<string, unknown>[]).map(rowToResource);
  },
  async create(input: { category: string; title: string; description: string; url?: string }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO resources (id, category, title, description, url, created_at)
      VALUES (${newId()}, ${input.category}, ${input.title}, ${input.description}, ${input.url ?? null}, ${new Date().toISOString()})
    `;
  },
  async remove(id: string): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM resources WHERE id = ${id}`;
  },
  async count(): Promise<number> {
    await ensureSchema();
    const rows = await sql`SELECT COUNT(*)::int AS c FROM resources`;
    return (rows[0] as { c: number }).c;
  },
};

export const newsRepo = {
  async list(onlyPublished = false): Promise<NewsRow[]> {
    await ensureSchema();
    const rows = onlyPublished
      ? await sql`SELECT * FROM news_items WHERE published = true ORDER BY date DESC`
      : await sql`SELECT * FROM news_items ORDER BY date DESC`;
    return (rows as Record<string, unknown>[]).map(rowToNews);
  },
  async create(input: { tag: string; title: string; date: string; body?: string; published: boolean }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO news_items (id, tag, title, date, body, published, created_at)
      VALUES (${newId()}, ${input.tag}, ${input.title}, ${input.date}, ${input.body ?? ""}, ${input.published}, ${new Date().toISOString()})
    `;
  },
  async remove(id: string): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM news_items WHERE id = ${id}`;
  },
  async count(): Promise<number> {
    await ensureSchema();
    const rows = await sql`SELECT COUNT(*)::int AS c FROM news_items`;
    return (rows[0] as { c: number }).c;
  },
};

export async function seedIfEmpty(seedNews: { tag: string; title: string; date: string; body?: string }[]) {
  if ((await newsRepo.count()) === 0) {
    for (const n of seedNews) {
      await newsRepo.create({ ...n, published: true });
    }
  }
}

export const techPageRepo = {
  async get(key: string): Promise<TechPageRow | null> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM tech_pages WHERE key = ${key}`;
    return rows.length ? rowToTechPage(rows[0] as Record<string, unknown>) : null;
  },
  async upsert(key: string, input: { title: string; description: string }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO tech_pages (key, title, description, updated_at)
      VALUES (${key}, ${input.title}, ${input.description}, ${new Date().toISOString()})
      ON CONFLICT (key) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, updated_at = EXCLUDED.updated_at
    `;
  },
  async count(): Promise<number> {
    await ensureSchema();
    const rows = await sql`SELECT COUNT(*)::int AS c FROM tech_pages WHERE description <> ''`;
    return (rows[0] as { c: number }).c;
  },
};

export const techCaseRepo = {
  async listByKey(techKey: string): Promise<TechCaseRow[]> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM tech_cases WHERE tech_key = ${techKey} ORDER BY created_at DESC`;
    return (rows as Record<string, unknown>[]).map(rowToTechCase);
  },
  async create(input: {
    techKey: string;
    productName: string;
    equipmentImageUrl?: string;
    videoUrl?: string;
    productImageUrl?: string;
  }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO tech_cases (id, tech_key, product_name, equipment_image_url, video_url, product_image_url, created_at)
      VALUES (${newId()}, ${input.techKey}, ${input.productName}, ${input.equipmentImageUrl ?? null}, ${input.videoUrl ?? null}, ${input.productImageUrl ?? null}, ${new Date().toISOString()})
    `;
  },
  async remove(id: string): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM tech_cases WHERE id = ${id}`;
  },
  async count(): Promise<number> {
    await ensureSchema();
    const rows = await sql`SELECT COUNT(*)::int AS c FROM tech_cases`;
    return (rows[0] as { c: number }).c;
  },
};

export async function seedTechPagesIfEmpty(seeds: { key: string; title: string; description: string }[]) {
  if ((await techPageRepo.count()) === 0) {
    for (const s of seeds) {
      await techPageRepo.upsert(s.key, { title: s.title, description: s.description });
    }
  }
}

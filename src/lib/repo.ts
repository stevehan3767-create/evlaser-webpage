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

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

function rowToFaq(r: Record<string, unknown>): FaqRow {
  return {
    id: r.id as string,
    question: r.question as string,
    answer: r.answer as string,
    createdAt: r.created_at as string,
  };
}

export interface OfficeRow {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
}

function rowToOffice(r: Record<string, unknown>): OfficeRow {
  return {
    id: r.id as string,
    name: r.name as string,
    address: r.address as string,
    phone: (r.phone as string) ?? null,
    email: (r.email as string) ?? null,
    createdAt: r.created_at as string,
  };
}

export interface DistributorRow {
  id: string;
  country: string;
  partner: string;
  contact: string | null;
  phone: string | null;
  createdAt: string;
}

function rowToDistributor(r: Record<string, unknown>): DistributorRow {
  return {
    id: r.id as string,
    country: r.country as string,
    partner: r.partner as string,
    contact: (r.contact as string) ?? null,
    phone: (r.phone as string) ?? null,
    createdAt: r.created_at as string,
  };
}

export interface ContentPageRow {
  groupKey: string;
  itemKey: string;
  title: string;
  description: string;
  updatedAt: string;
}

export interface ContentCaseRow {
  id: string;
  groupKey: string;
  itemKey: string;
  productName: string;
  equipmentImageUrl: string | null;
  videoUrl: string | null;
  productImageUrl: string | null;
  createdAt: string;
}

function rowToContentPage(r: Record<string, unknown>): ContentPageRow {
  return {
    groupKey: r.group_key as string,
    itemKey: r.item_key as string,
    title: (r.title as string) ?? "",
    description: (r.description as string) ?? "",
    updatedAt: r.updated_at as string,
  };
}

function rowToContentCase(r: Record<string, unknown>): ContentCaseRow {
  return {
    id: r.id as string,
    groupKey: r.group_key as string,
    itemKey: r.item_key as string,
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
  async update(id: string, input: { category: string; title: string; description: string; url?: string }): Promise<void> {
    await ensureSchema();
    await sql`
      UPDATE resources SET category = ${input.category}, title = ${input.title}, description = ${input.description}, url = ${input.url ?? null}
      WHERE id = ${id}
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
  async update(id: string, input: { tag: string; title: string; date: string; body?: string }): Promise<void> {
    await ensureSchema();
    await sql`
      UPDATE news_items SET tag = ${input.tag}, title = ${input.title}, date = ${input.date}, body = ${input.body ?? ""}
      WHERE id = ${id}
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

export const faqRepo = {
  async list(): Promise<FaqRow[]> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM faqs ORDER BY created_at ASC`;
    return (rows as Record<string, unknown>[]).map(rowToFaq);
  },
  async create(input: { question: string; answer: string }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO faqs (id, question, answer, created_at)
      VALUES (${newId()}, ${input.question}, ${input.answer}, ${new Date().toISOString()})
    `;
  },
  async update(id: string, input: { question: string; answer: string }): Promise<void> {
    await ensureSchema();
    await sql`UPDATE faqs SET question = ${input.question}, answer = ${input.answer} WHERE id = ${id}`;
  },
  async remove(id: string): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM faqs WHERE id = ${id}`;
  },
};

export const officeRepo = {
  async list(): Promise<OfficeRow[]> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM offices ORDER BY created_at ASC`;
    return (rows as Record<string, unknown>[]).map(rowToOffice);
  },
  async create(input: { name: string; address: string; phone?: string; email?: string }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO offices (id, name, address, phone, email, created_at)
      VALUES (${newId()}, ${input.name}, ${input.address}, ${input.phone ?? null}, ${input.email ?? null}, ${new Date().toISOString()})
    `;
  },
  async update(id: string, input: { name: string; address: string; phone?: string; email?: string }): Promise<void> {
    await ensureSchema();
    await sql`
      UPDATE offices SET name = ${input.name}, address = ${input.address}, phone = ${input.phone ?? null}, email = ${input.email ?? null}
      WHERE id = ${id}
    `;
  },
  async remove(id: string): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM offices WHERE id = ${id}`;
  },
  async count(): Promise<number> {
    await ensureSchema();
    const rows = await sql`SELECT COUNT(*)::int AS c FROM offices`;
    return (rows[0] as { c: number }).c;
  },
};

export const distributorRepo = {
  async list(): Promise<DistributorRow[]> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM distributors ORDER BY created_at ASC`;
    return (rows as Record<string, unknown>[]).map(rowToDistributor);
  },
  async create(input: { country: string; partner: string; contact?: string; phone?: string }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO distributors (id, country, partner, contact, phone, created_at)
      VALUES (${newId()}, ${input.country}, ${input.partner}, ${input.contact ?? null}, ${input.phone ?? null}, ${new Date().toISOString()})
    `;
  },
  async update(id: string, input: { country: string; partner: string; contact?: string; phone?: string }): Promise<void> {
    await ensureSchema();
    await sql`
      UPDATE distributors SET country = ${input.country}, partner = ${input.partner}, contact = ${input.contact ?? null}, phone = ${input.phone ?? null}
      WHERE id = ${id}
    `;
  },
  async remove(id: string): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM distributors WHERE id = ${id}`;
  },
};

export async function seedOfficesIfEmpty(seeds: { name: string; address: string; phone?: string; email?: string }[]) {
  if ((await officeRepo.count()) === 0) {
    for (const s of seeds) {
      await officeRepo.create(s);
    }
  }
}

export async function seedIfEmpty(seedNews: { tag: string; title: string; date: string; body?: string }[]) {
  if ((await newsRepo.count()) === 0) {
    for (const n of seedNews) {
      await newsRepo.create({ ...n, published: true });
    }
  }
}

export const contentPageRepo = {
  async get(groupKey: string, itemKey: string): Promise<ContentPageRow | null> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM content_pages WHERE group_key = ${groupKey} AND item_key = ${itemKey}`;
    return rows.length ? rowToContentPage(rows[0] as Record<string, unknown>) : null;
  },
  async upsert(groupKey: string, itemKey: string, input: { title: string; description: string }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO content_pages (group_key, item_key, title, description, updated_at)
      VALUES (${groupKey}, ${itemKey}, ${input.title}, ${input.description}, ${new Date().toISOString()})
      ON CONFLICT (group_key, item_key) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, updated_at = EXCLUDED.updated_at
    `;
  },
  async count(groupKey: string): Promise<number> {
    await ensureSchema();
    const rows = await sql`SELECT COUNT(*)::int AS c FROM content_pages WHERE group_key = ${groupKey} AND description <> ''`;
    return (rows[0] as { c: number }).c;
  },
};

export const contentCaseRepo = {
  async listByKey(groupKey: string, itemKey: string): Promise<ContentCaseRow[]> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM content_cases WHERE group_key = ${groupKey} AND item_key = ${itemKey} ORDER BY created_at DESC`;
    return (rows as Record<string, unknown>[]).map(rowToContentCase);
  },
  async create(input: {
    groupKey: string;
    itemKey: string;
    productName: string;
    equipmentImageUrl?: string;
    videoUrl?: string;
    productImageUrl?: string;
  }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO content_cases (id, group_key, item_key, product_name, equipment_image_url, video_url, product_image_url, created_at)
      VALUES (${newId()}, ${input.groupKey}, ${input.itemKey}, ${input.productName}, ${input.equipmentImageUrl ?? null}, ${input.videoUrl ?? null}, ${input.productImageUrl ?? null}, ${new Date().toISOString()})
    `;
  },
  async update(
    id: string,
    input: { productName: string; equipmentImageUrl?: string; videoUrl?: string; productImageUrl?: string }
  ): Promise<void> {
    await ensureSchema();
    await sql`
      UPDATE content_cases
      SET product_name = ${input.productName}, equipment_image_url = ${input.equipmentImageUrl ?? null},
          video_url = ${input.videoUrl ?? null}, product_image_url = ${input.productImageUrl ?? null}
      WHERE id = ${id}
    `;
  },
  async remove(id: string): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM content_cases WHERE id = ${id}`;
  },
  async count(groupKey: string, itemKey: string): Promise<number> {
    await ensureSchema();
    const rows = await sql`SELECT COUNT(*)::int AS c FROM content_cases WHERE group_key = ${groupKey} AND item_key = ${itemKey}`;
    return (rows[0] as { c: number }).c;
  },
};

export async function seedContentIfEmpty(groupKey: string, seeds: { key: string; title: string; description: string }[]) {
  if ((await contentPageRepo.count(groupKey)) === 0) {
    for (const s of seeds) {
      await contentPageRepo.upsert(groupKey, s.key, { title: s.title, description: s.description });
    }
  }
}

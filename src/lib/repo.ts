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
  imageUrl: string | null;
  updatedAt: string;
}

export interface ContentImageRow {
  id: string;
  groupKey: string;
  itemKey: string;
  url: string;
  caption: string | null;
  content: string | null;
  sortOrder: number;
  createdAt: string;
}

function rowToContentImage(r: Record<string, unknown>): ContentImageRow {
  return {
    id: r.id as string,
    groupKey: r.group_key as string,
    itemKey: r.item_key as string,
    url: r.url as string,
    caption: (r.caption as string) ?? null,
    content: (r.content as string) ?? null,
    sortOrder: Number(r.sort_order ?? 0),
    createdAt: r.created_at as string,
  };
}

export interface ContentVideoRow {
  id: string;
  groupKey: string;
  itemKey: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  content: string | null;
  sortOrder: number;
  createdAt: string;
}

function rowToContentVideo(r: Record<string, unknown>): ContentVideoRow {
  return {
    id: r.id as string,
    groupKey: r.group_key as string,
    itemKey: r.item_key as string,
    url: r.url as string,
    thumbnailUrl: (r.thumbnail_url as string) ?? null,
    caption: (r.caption as string) ?? null,
    content: (r.content as string) ?? null,
    sortOrder: Number(r.sort_order ?? 0),
    createdAt: r.created_at as string,
  };
}

function rowToContentPage(r: Record<string, unknown>): ContentPageRow {
  return {
    groupKey: r.group_key as string,
    itemKey: r.item_key as string,
    title: (r.title as string) ?? "",
    description: (r.description as string) ?? "",
    imageUrl: (r.image_url as string) ?? null,
    updatedAt: r.updated_at as string,
  };
}

export interface HeroSlideRow {
  id: string;
  imageUrl: string;
  title: string;
  sortOrder: number;
  createdAt: string;
}

function rowToHeroSlide(r: Record<string, unknown>): HeroSlideRow {
  return {
    id: r.id as string,
    imageUrl: r.image_url as string,
    title: (r.title as string) ?? "",
    sortOrder: Number(r.sort_order ?? 0),
    createdAt: r.created_at as string,
  };
}

export const heroSlideRepo = {
  async list(): Promise<HeroSlideRow[]> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM hero_slides ORDER BY sort_order ASC, created_at ASC`;
    return (rows as Record<string, unknown>[]).map(rowToHeroSlide);
  },
  async create(input: { imageUrl: string; title: string; sortOrder?: number }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO hero_slides (id, image_url, title, sort_order, created_at)
      VALUES (${newId()}, ${input.imageUrl}, ${input.title}, ${input.sortOrder ?? 0}, ${new Date().toISOString()})
    `;
  },
  async update(id: string, input: { imageUrl: string; title: string }): Promise<void> {
    await ensureSchema();
    await sql`UPDATE hero_slides SET image_url = ${input.imageUrl}, title = ${input.title} WHERE id = ${id}`;
  },
  async remove(id: string): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM hero_slides WHERE id = ${id}`;
  },
  async count(): Promise<number> {
    await ensureSchema();
    const rows = await sql`SELECT COUNT(*)::int AS c FROM hero_slides`;
    return (rows[0] as { c: number }).c;
  },
};

export interface ClientLogoRow {
  id: string;
  name: string;
  logoUrl: string;
  sortOrder: number;
  createdAt: string;
}

function rowToClientLogo(r: Record<string, unknown>): ClientLogoRow {
  return {
    id: r.id as string,
    name: r.name as string,
    logoUrl: r.logo_url as string,
    sortOrder: Number(r.sort_order ?? 0),
    createdAt: r.created_at as string,
  };
}

export const clientLogoRepo = {
  async list(): Promise<ClientLogoRow[]> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM client_logos ORDER BY sort_order ASC, created_at ASC`;
    return (rows as Record<string, unknown>[]).map(rowToClientLogo);
  },
  async create(input: { name: string; logoUrl: string; sortOrder?: number }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO client_logos (id, name, logo_url, sort_order, created_at)
      VALUES (${newId()}, ${input.name}, ${input.logoUrl}, ${input.sortOrder ?? 0}, ${new Date().toISOString()})
    `;
  },
  async update(id: string, input: { name: string; logoUrl: string }): Promise<void> {
    await ensureSchema();
    await sql`UPDATE client_logos SET name = ${input.name}, logo_url = ${input.logoUrl} WHERE id = ${id}`;
  },
  async remove(id: string): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM client_logos WHERE id = ${id}`;
  },
};

// Neutral "logo pending" placeholder shown until the admin uploads the real
// logo file for a seeded client name — a self-contained SVG data URI, never
// a hotlinked external image.
function placeholderLogoDataUri(name: string): string {
  const label = (name.length > 20 ? name.slice(0, 19) + "…" : name)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160"><rect width="300" height="160" fill="#f2f4f7"/><text x="150" y="86" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#6b7280" text-anchor="middle">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export async function seedClientLogosIfEmpty(names: string[]): Promise<void> {
  await ensureSchema();
  const rows = await sql`SELECT COUNT(*)::int AS c FROM client_logos`;
  if ((rows[0] as { c: number }).c > 0) return;
  for (let i = 0; i < names.length; i++) {
    await clientLogoRepo.create({ name: names[i], logoUrl: placeholderLogoDataUri(names[i]), sortOrder: i });
  }
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

export const settingsRepo = {
  async get(key: string): Promise<string | null> {
    await ensureSchema();
    const rows = await sql`SELECT value FROM settings WHERE key = ${key}`;
    return rows.length ? (rows[0] as { value: string }).value : null;
  },
  async set(key: string, value: string): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO settings (key, value) VALUES (${key}, ${value})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
  },
};

export interface JobApplicationRow {
  id: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  fileNames: string | null;
  emailSent: boolean;
  createdAt: string;
}

function rowToJobApplication(r: Record<string, unknown>): JobApplicationRow {
  return {
    id: r.id as string,
    jobTitle: r.job_title as string,
    name: r.name as string,
    email: r.email as string,
    phone: (r.phone as string) ?? null,
    message: (r.message as string) ?? null,
    fileNames: (r.file_names as string) ?? null,
    emailSent: Boolean(r.email_sent),
    createdAt: r.created_at as string,
  };
}

export const jobApplicationRepo = {
  async list(): Promise<JobApplicationRow[]> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM job_applications ORDER BY created_at DESC`;
    return (rows as Record<string, unknown>[]).map(rowToJobApplication);
  },
  async create(input: {
    jobTitle: string;
    name: string;
    email: string;
    phone?: string;
    message?: string;
    fileNames?: string;
    emailSent: boolean;
  }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO job_applications (id, job_title, name, email, phone, message, file_names, email_sent, created_at)
      VALUES (${newId()}, ${input.jobTitle}, ${input.name}, ${input.email}, ${input.phone ?? null}, ${input.message ?? null}, ${input.fileNames ?? null}, ${input.emailSent}, ${new Date().toISOString()})
    `;
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

export interface ContentItemRow {
  id: string;
  groupKey: string;
  itemKey: string;
  name: string;
  icon: string;
  sortOrder: number;
  createdAt: string;
}

function rowToContentItem(r: Record<string, unknown>): ContentItemRow {
  return {
    id: r.id as string,
    groupKey: r.group_key as string,
    itemKey: r.item_key as string,
    name: r.name as string,
    icon: r.icon as string,
    sortOrder: Number(r.sort_order ?? 0),
    createdAt: r.created_at as string,
  };
}

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (base || "item") + "-" + Math.random().toString(36).slice(2, 7);
}

export const contentItemRepo = {
  async listByGroup(groupKey: string): Promise<ContentItemRow[]> {
    await ensureSchema();
    const rows = await sql`
      SELECT * FROM content_items WHERE group_key = ${groupKey} ORDER BY sort_order ASC, created_at ASC
    `;
    return (rows as Record<string, unknown>[]).map(rowToContentItem);
  },
  async create(input: { groupKey: string; name: string; icon: string; sortOrder?: number }): Promise<ContentItemRow> {
    await ensureSchema();
    const id = newId();
    const itemKey = slugify(input.name);
    const createdAt = new Date().toISOString();
    // Default to the end of the list, not sort_order 0 — otherwise a new
    // item ties with (and sorts ahead of, on equal timestamps) the first seeded item.
    const sortOrder = input.sortOrder ?? (await contentItemRepo.count(input.groupKey));
    await sql`
      INSERT INTO content_items (id, group_key, item_key, name, icon, sort_order, created_at)
      VALUES (${id}, ${input.groupKey}, ${itemKey}, ${input.name}, ${input.icon}, ${sortOrder}, ${createdAt})
    `;
    return { id, groupKey: input.groupKey, itemKey, name: input.name, icon: input.icon, sortOrder, createdAt };
  },
  // Removes the item and every piece of content registered under it
  // (본문/적용사례 사진·동영상), since nothing else can reach that group+key
  // combination once the item itself is gone.
  async remove(id: string, groupKey: string, itemKey: string): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM content_items WHERE id = ${id}`;
    await sql`DELETE FROM content_pages WHERE group_key = ${groupKey} AND item_key = ${itemKey}`;
    await sql`DELETE FROM content_images WHERE group_key = ${groupKey} AND item_key = ${itemKey}`;
    await sql`DELETE FROM content_videos WHERE group_key = ${groupKey} AND item_key = ${itemKey}`;
    if (groupKey === "lineup") {
      await sql`DELETE FROM lineup_category_links WHERE item_key = ${itemKey}`;
    } else {
      await sql`DELETE FROM lineup_category_links WHERE category_group = ${groupKey} AND category_key = ${itemKey}`;
    }
  },
  async count(groupKey: string): Promise<number> {
    await ensureSchema();
    const rows = await sql`SELECT COUNT(*)::int AS c FROM content_items WHERE group_key = ${groupKey}`;
    return (rows[0] as { c: number }).c;
  },
};

// Which 기술종류별/산업분야별/재료별 categories a given 설비 라인업 item
// belongs to (many-to-many per category group), so each category's detail
// page can list the equipment tagged with it, and 설비 라인업 can filter by
// category.
export const lineupCategoryLinkRepo = {
  async categoryKeysForItem(itemKey: string, categoryGroup: string): Promise<string[]> {
    await ensureSchema();
    const rows = await sql`
      SELECT category_key FROM lineup_category_links WHERE item_key = ${itemKey} AND category_group = ${categoryGroup}
    `;
    return (rows as { category_key: string }[]).map((r) => r.category_key);
  },
  async itemKeysForCategory(categoryGroup: string, categoryKey: string): Promise<string[]> {
    await ensureSchema();
    const rows = await sql`
      SELECT item_key FROM lineup_category_links WHERE category_group = ${categoryGroup} AND category_key = ${categoryKey}
    `;
    return (rows as { item_key: string }[]).map((r) => r.item_key);
  },
  async setForItem(itemKey: string, categoryGroup: string, categoryKeys: string[]): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM lineup_category_links WHERE item_key = ${itemKey} AND category_group = ${categoryGroup}`;
    for (const categoryKey of categoryKeys) {
      await sql`
        INSERT INTO lineup_category_links (item_key, category_group, category_key)
        VALUES (${itemKey}, ${categoryGroup}, ${categoryKey})
        ON CONFLICT DO NOTHING
      `;
    }
  },
  async listAll(categoryGroup: string): Promise<{ itemKey: string; categoryKey: string }[]> {
    await ensureSchema();
    const rows = await sql`SELECT item_key, category_key FROM lineup_category_links WHERE category_group = ${categoryGroup}`;
    return (rows as { item_key: string; category_key: string }[]).map((r) => ({ itemKey: r.item_key, categoryKey: r.category_key }));
  },
};

export async function seedContentItemsIfEmpty(
  groupKey: string,
  seeds: { key: string; name: string; icon: string }[]
): Promise<void> {
  await ensureSchema();
  if ((await contentItemRepo.count(groupKey)) > 0) return;
  for (let i = 0; i < seeds.length; i++) {
    const s = seeds[i];
    await sql`
      INSERT INTO content_items (id, group_key, item_key, name, icon, sort_order, created_at)
      VALUES (${newId()}, ${groupKey}, ${s.key}, ${s.name}, ${s.icon}, ${i}, ${new Date().toISOString()})
      ON CONFLICT (group_key, item_key) DO NOTHING
    `;
  }
}

export const contentPageRepo = {
  async get(groupKey: string, itemKey: string): Promise<ContentPageRow | null> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM content_pages WHERE group_key = ${groupKey} AND item_key = ${itemKey}`;
    return rows.length ? rowToContentPage(rows[0] as Record<string, unknown>) : null;
  },
  async upsert(groupKey: string, itemKey: string, input: { title: string; description: string; imageUrl?: string }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO content_pages (group_key, item_key, title, description, image_url, updated_at)
      VALUES (${groupKey}, ${itemKey}, ${input.title}, ${input.description}, ${input.imageUrl ?? null}, ${new Date().toISOString()})
      ON CONFLICT (group_key, item_key) DO UPDATE SET
        title = EXCLUDED.title, description = EXCLUDED.description, image_url = EXCLUDED.image_url, updated_at = EXCLUDED.updated_at
    `;
  },
  async count(groupKey: string): Promise<number> {
    await ensureSchema();
    const rows = await sql`SELECT COUNT(*)::int AS c FROM content_pages WHERE group_key = ${groupKey} AND description <> ''`;
    return (rows[0] as { c: number }).c;
  },
  async listAll(): Promise<ContentPageRow[]> {
    await ensureSchema();
    const rows = await sql`SELECT * FROM content_pages`;
    return (rows as Record<string, unknown>[]).map(rowToContentPage);
  },
};

export const contentImageRepo = {
  async listByKey(groupKey: string, itemKey: string): Promise<ContentImageRow[]> {
    await ensureSchema();
    const rows = await sql`
      SELECT * FROM content_images WHERE group_key = ${groupKey} AND item_key = ${itemKey}
      ORDER BY created_at DESC
    `;
    return (rows as Record<string, unknown>[]).map(rowToContentImage);
  },
  async create(input: { groupKey: string; itemKey: string; url: string; caption?: string; content?: string; sortOrder?: number }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO content_images (id, group_key, item_key, url, caption, content, sort_order, created_at)
      VALUES (${newId()}, ${input.groupKey}, ${input.itemKey}, ${input.url}, ${input.caption ?? null}, ${input.content ?? null}, ${input.sortOrder ?? 0}, ${new Date().toISOString()})
    `;
  },
  async update(id: string, input: { url: string; caption?: string; content?: string }): Promise<void> {
    await ensureSchema();
    await sql`UPDATE content_images SET url = ${input.url}, caption = ${input.caption ?? null}, content = ${input.content ?? null} WHERE id = ${id}`;
  },
  async remove(id: string): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM content_images WHERE id = ${id}`;
  },
  async count(groupKey: string, itemKey: string): Promise<number> {
    await ensureSchema();
    const rows = await sql`SELECT COUNT(*)::int AS c FROM content_images WHERE group_key = ${groupKey} AND item_key = ${itemKey}`;
    return (rows[0] as { c: number }).c;
  },
};

export const contentVideoRepo = {
  async listByKey(groupKey: string, itemKey: string): Promise<ContentVideoRow[]> {
    await ensureSchema();
    const rows = await sql`
      SELECT * FROM content_videos WHERE group_key = ${groupKey} AND item_key = ${itemKey}
      ORDER BY created_at DESC
    `;
    return (rows as Record<string, unknown>[]).map(rowToContentVideo);
  },
  async create(input: {
    groupKey: string;
    itemKey: string;
    url: string;
    thumbnailUrl?: string;
    caption?: string;
    content?: string;
    sortOrder?: number;
  }): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO content_videos (id, group_key, item_key, url, thumbnail_url, caption, content, sort_order, created_at)
      VALUES (${newId()}, ${input.groupKey}, ${input.itemKey}, ${input.url}, ${input.thumbnailUrl ?? null}, ${input.caption ?? null}, ${input.content ?? null}, ${input.sortOrder ?? 0}, ${new Date().toISOString()})
    `;
  },
  async update(id: string, input: { url: string; thumbnailUrl?: string; caption?: string; content?: string }): Promise<void> {
    await ensureSchema();
    await sql`
      UPDATE content_videos SET url = ${input.url}, thumbnail_url = ${input.thumbnailUrl ?? null}, caption = ${input.caption ?? null}, content = ${input.content ?? null}
      WHERE id = ${id}
    `;
  },
  async remove(id: string): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM content_videos WHERE id = ${id}`;
  },
  async count(groupKey: string, itemKey: string): Promise<number> {
    await ensureSchema();
    const rows = await sql`SELECT COUNT(*)::int AS c FROM content_videos WHERE group_key = ${groupKey} AND item_key = ${itemKey}`;
    return (rows[0] as { c: number }).c;
  },
};

export async function seedContentIfEmpty(
  groupKey: string,
  seeds: { key: string; title: string; description: string; imageUrl?: string }[]
) {
  if ((await contentPageRepo.count(groupKey)) === 0) {
    for (const s of seeds) {
      await contentPageRepo.upsert(groupKey, s.key, { title: s.title, description: s.description, imageUrl: s.imageUrl });
    }
  }
}

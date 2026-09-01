import { getDb, newId } from "./db";

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
    published: Boolean(r.published),
    createdAt: r.created_at as string,
  };
}

export const inquiryRepo = {
  create(input: {
    channel: string;
    name: string;
    company?: string;
    email: string;
    phone?: string;
    industry?: string;
    message: string;
    emailSent: boolean;
  }): Inquiry {
    const db = getDb();
    const id = newId();
    const createdAt = new Date().toISOString();
    db.prepare(
      `INSERT INTO inquiries (id, channel, name, company, email, phone, industry, message, email_sent, created_at)
       VALUES (@id, @channel, @name, @company, @email, @phone, @industry, @message, @emailSent, @createdAt)`
    ).run({
      id,
      channel: input.channel,
      name: input.name,
      company: input.company ?? null,
      email: input.email,
      phone: input.phone ?? null,
      industry: input.industry ?? null,
      message: input.message,
      emailSent: input.emailSent ? 1 : 0,
      createdAt,
    });
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
  list(): Inquiry[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM inquiries ORDER BY created_at DESC").all() as Record<string, unknown>[];
    return rows.map(rowToInquiry);
  },
};

export const resourceRepo = {
  list(): ResourceRow[] {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM resources ORDER BY created_at DESC").all() as Record<string, unknown>[];
    return rows.map(rowToResource);
  },
  create(input: { category: string; title: string; description: string; url?: string }): void {
    const db = getDb();
    db.prepare(
      `INSERT INTO resources (id, category, title, description, url, created_at) VALUES (@id, @category, @title, @description, @url, @createdAt)`
    ).run({ id: newId(), createdAt: new Date().toISOString(), url: input.url ?? null, ...input });
  },
  remove(id: string): void {
    getDb().prepare("DELETE FROM resources WHERE id = ?").run(id);
  },
  count(): number {
    const row = getDb().prepare("SELECT COUNT(*) as c FROM resources").get() as { c: number };
    return row.c;
  },
};

export const newsRepo = {
  list(onlyPublished = false): NewsRow[] {
    const db = getDb();
    const rows = (
      onlyPublished
        ? db.prepare("SELECT * FROM news_items WHERE published = 1 ORDER BY date DESC").all()
        : db.prepare("SELECT * FROM news_items ORDER BY date DESC").all()
    ) as Record<string, unknown>[];
    return rows.map(rowToNews);
  },
  create(input: { tag: string; title: string; date: string; published: boolean }): void {
    const db = getDb();
    db.prepare(
      `INSERT INTO news_items (id, tag, title, date, published, created_at) VALUES (@id, @tag, @title, @date, @published, @createdAt)`
    ).run({
      id: newId(),
      createdAt: new Date().toISOString(),
      tag: input.tag,
      title: input.title,
      date: input.date,
      published: input.published ? 1 : 0,
    });
  },
  remove(id: string): void {
    getDb().prepare("DELETE FROM news_items WHERE id = ?").run(id);
  },
  count(): number {
    const row = getDb().prepare("SELECT COUNT(*) as c FROM news_items").get() as { c: number };
    return row.c;
  },
};

export function seedIfEmpty(seedNews: { tag: string; title: string; date: string }[]) {
  if (newsRepo.count() === 0) {
    for (const n of seedNews) {
      newsRepo.create({ ...n, published: true });
    }
  }
}

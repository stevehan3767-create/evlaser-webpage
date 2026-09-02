import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "app.db");

declare global {
  var __evlaserDb: Database.Database | undefined;
}

function createDb() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      industry TEXT,
      message TEXT NOT NULL,
      email_sent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS news_items (
      id TEXT PRIMARY KEY,
      tag TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);

  const newsColumns = db.prepare("PRAGMA table_info(news_items)").all() as { name: string }[];
  if (!newsColumns.some((c) => c.name === "body")) {
    db.exec("ALTER TABLE news_items ADD COLUMN body TEXT NOT NULL DEFAULT ''");
  }

  return db;
}

export function getDb(): Database.Database {
  if (!global.__evlaserDb) {
    global.__evlaserDb = createDb();
  }
  return global.__evlaserDb;
}

export function newId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}

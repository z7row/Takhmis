import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const dbPath = path.resolve(
  process.cwd(),
  process.env.DATABASE_URL ?? "data/takhmis.db",
);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite);

console.log("▸ Applying migrations to", dbPath);
migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
sqlite.close();
console.log("✓ Database is up to date");

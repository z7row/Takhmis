import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const dbPath = path.resolve(
  process.cwd(),
  process.env.DATABASE_URL ?? "data/takhmis.db",
);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const globalForDb = globalThis as unknown as {
  __takhmisSqlite?: Database.Database;
};

const sqlite = globalForDb.__takhmisSqlite ?? new Database(dbPath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");

if (process.env.NODE_ENV !== "production") {
  globalForDb.__takhmisSqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
export { sqlite };
export * from "./schema";

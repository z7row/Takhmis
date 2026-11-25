import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { settings, weeks } from "@/db/schema";
import { addDays, today } from "./dates";
import { DEFAULT_WEEK_REWARD } from "./constants";

export function getActiveWeek() {
  return (
    db
      .select()
      .from(weeks)
      .where(eq(weeks.status, "active"))
      .orderBy(desc(weeks.createdAt))
      .get() ?? null
  );
}

export function ensureActiveWeek() {
  const active = getActiveWeek();
  if (active) return active;

  const startDay = today();
  const fallbackReward =
    db.select().from(settings).where(eq(settings.key, "default_week_reward")).get()
      ?.value ?? DEFAULT_WEEK_REWARD;

  return db
    .insert(weeks)
    .values({
      startDay,
      endDay: addDays(startDay, 6),
      reward: fallbackReward,
      status: "active",
    })
    .returning()
    .get();
}

export function getWeekHistory(limit = 8) {
  return db
    .select()
    .from(weeks)
    .orderBy(desc(weeks.createdAt))
    .limit(limit)
    .all();
}

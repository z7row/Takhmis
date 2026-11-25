import "server-only";
import { and, count, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { habits, proofs, users, weekResults, weeks } from "@/db/schema";
import { ACHIEVEMENTS } from "@/lib/constants";
import { addDays, today } from "@/lib/dates";
import { getLeaderboard, getMyHabitsToday } from "./habits";
import { ensureActiveWeek } from "@/lib/week";
import type { ArenaHabit } from "./habits";

export type ProfileData = {
  user: typeof users.$inferSelect;
  habits: ArenaHabit[];
  rank: number | null;
  membersCount: number;
  week: typeof weeks.$inferSelect;
  history: {
    id: string;
    startDay: string;
    endDay: string;
    reward: string;
    points: number;
    rank: number;
    won: boolean;
    status: "active" | "closed";
  }[];
  achievements: { key: string; label: string; emoji: string }[];
  days: { day: string; count: number }[];
  gallery: {
    id: string;
    imageUrl: string | null;
    day: string;
    habitTitle: string;
    habitEmoji: string;
  }[];
  totals: {
    proofsCount: number;
    lifetimePoints: number;
    wins: number;
  };
};

export function getProfileData(userId: string): ProfileData {
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) throw new Error("User not found");

  const leaderboard = getLeaderboard(userId);
  const week = ensureActiveWeek();
  const myHabits = getMyHabitsToday(userId);

  const historyRows = db
    .select({
      id: weeks.id,
      startDay: weeks.startDay,
      endDay: weeks.endDay,
      reward: weeks.reward,
      status: weeks.status,
      winnerId: weeks.winnerId,
      points: weekResults.points,
      rank: weekResults.rank,
    })
    .from(weekResults)
    .innerJoin(weeks, eq(weeks.id, weekResults.weekId))
    .where(eq(weekResults.userId, userId))
    .orderBy(desc(weeks.createdAt))
    .limit(6)
    .all();

  const achievements = ACHIEVEMENTS.filter((a) =>
    a.check({
      proofsCount: user.proofsCount,
      longestStreak: user.longestStreak,
      wins: user.wins,
    }),
  ).map(({ key, label, emoji }) => ({ key, label, emoji }));

  const start = addDays(today(), -13);
  const grouped = db
    .select({ day: proofs.day, value: count() })
    .from(proofs)
    .where(and(eq(proofs.userId, userId), gte(proofs.day, start)))
    .groupBy(proofs.day)
    .all();
  const counts = new Map(grouped.map((g) => [g.day, g.value]));
  const days = Array.from({ length: 14 }, (_, i) => {
    const day = addDays(today(), i - 13);
    return { day, count: counts.get(day) ?? 0 };
  });

  const gallery = db
    .select({
      id: proofs.id,
      imageUrl: proofs.imageUrl,
      day: proofs.day,
      habitTitle: habits.title,
      habitEmoji: habits.emoji,
    })
    .from(proofs)
    .innerJoin(habits, eq(habits.id, proofs.habitId))
    .where(eq(proofs.userId, userId))
    .orderBy(desc(proofs.createdAt))
    .limit(6)
    .all();

  return {
    user,
    habits: myHabits,
    rank: leaderboard.find((r) => r.isViewer)?.rank ?? null,
    membersCount: leaderboard.length,
    week,
    history: historyRows.map((row) => ({
      id: row.id,
      startDay: row.startDay,
      endDay: row.endDay,
      reward: row.reward,
      status: row.status,
      points: row.points,
      rank: row.rank,
      won: row.winnerId === userId,
    })),
    achievements,
    days,
    gallery,
    totals: {
      proofsCount: user.proofsCount,
      lifetimePoints: user.lifetimePoints,
      wins: user.wins,
    },
  };
}

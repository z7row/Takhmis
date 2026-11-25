import "server-only";
import { and, count, desc, eq, gte, asc } from "drizzle-orm";
import { db } from "@/db";
import { habits, proofs, users } from "@/db/schema";
import { addDays, diffDays, isOnline, today } from "@/lib/dates";
import { computeTitles } from "@/lib/titles";
import { ensureDailyRollover } from "@/lib/rollover";
import { ensureActiveWeek } from "@/lib/week";
import type { Week } from "@/db/schema";

export type LeaderRow = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  title: string;
  titleEmoji: string;
  titleTone: "positive" | "neutral" | "negative";
  points: number;
  streak: number;
  longestStreak: number;
  jokers: number;
  wins: number;
  proofsCount: number;
  lifetimePoints: number;
  rank: number;
  isViewer: boolean;
  online: boolean;
};

export type ArenaHabit = {
  id: string;
  title: string;
  emoji: string;
  proof: {
    id: string;
    imageUrl: string;
    caption: string | null;
    createdAt: number;
    points: number;
  } | null;
};

export type ArenaData = {
  week: Week;
  habits: ArenaHabit[];
  leaderboard: LeaderRow[];
  myRank: number | null;
  days: { day: string; count: number; done: boolean }[];
  todayProofs: number;
  membersCount: number;
  weekDaysLeft: number;
};

export function getLeaderboard(viewerId: string): LeaderRow[] {
  const members = db
    .select()
    .from(users)
    .where(eq(users.disabled, false))
    .orderBy(
      desc(users.points),
      desc(users.streak),
      desc(users.lifetimePoints),
      desc(users.proofsCount),
      asc(users.nickname),
    )
    .all();

  const titles = computeTitles(members);

  return members.map((member, index) => {
    const computed = titles.get(member.id);
    const useManual = member.titleLocked;
    return {
      id: member.id,
      nickname: member.nickname,
      avatarUrl: member.avatarUrl,
      title: useManual ? member.title : (computed?.title ?? member.title),
      titleEmoji: useManual
        ? member.titleEmoji
        : (computed?.emoji ?? member.titleEmoji),
      titleTone: useManual
        ? member.titleTone
        : (computed?.tone ?? member.titleTone),
      points: member.points,
      streak: member.streak,
      longestStreak: member.longestStreak,
      jokers: member.jokers,
      wins: member.wins,
      proofsCount: member.proofsCount,
      lifetimePoints: member.lifetimePoints,
      rank: index + 1,
      isViewer: member.id === viewerId,
      online: isOnline(member.lastSeenAt),
    };
  });
}

export function getMyHabitsToday(userId: string): ArenaHabit[] {
  const day = today();
  const rows = db
    .select({
      id: habits.id,
      title: habits.title,
      emoji: habits.emoji,
      proofId: proofs.id,
      proofImage: proofs.imageUrl,
      proofCaption: proofs.caption,
      proofCreatedAt: proofs.createdAt,
      proofPoints: proofs.points,
    })
    .from(habits)
    .leftJoin(
      proofs,
      and(eq(proofs.habitId, habits.id), eq(proofs.day, day)),
    )
    .where(and(eq(habits.userId, userId), eq(habits.archived, false)))
    .orderBy(asc(habits.position), asc(habits.createdAt))
    .all();

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    emoji: row.emoji,
    proof: row.proofId
      ? {
          id: row.proofId,
          imageUrl: row.proofImage ?? "",
          caption: row.proofCaption,
          createdAt: new Date(row.proofCreatedAt ?? Date.now()).getTime(),
          points: row.proofPoints ?? 0,
        }
      : null,
  }));
}

export function getArenaData(userId: string): ArenaData {
  ensureDailyRollover();
  const week = ensureActiveWeek();
  const leaderboard = getLeaderboard(userId);
  const myHabits = getMyHabitsToday(userId);

  const start = addDays(today(), -6);
  const grouped = db
    .select({ day: proofs.day, value: count() })
    .from(proofs)
    .where(and(eq(proofs.userId, userId), gte(proofs.day, start)))
    .groupBy(proofs.day)
    .all();

  const counts = new Map(grouped.map((g) => [g.day, g.value]));
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today(), i - 6);
    const c = counts.get(day) ?? 0;
    return { day, count: c, done: c > 0 };
  });

  return {
    week,
    habits: myHabits,
    leaderboard,
    myRank: leaderboard.find((row) => row.isViewer)?.rank ?? null,
    days,
    todayProofs: myHabits.filter((h) => h.proof).length,
    membersCount: leaderboard.length,
    weekDaysLeft: Math.max(diffDays(week.endDay, today()), 0),
  };
}

export function getMyHabits(userId: string) {
  return db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.archived, false)))
    .orderBy(asc(habits.position), asc(habits.createdAt))
    .all();
}

export function getWeekStanding(viewerId: string) {
  const leaderboard = getLeaderboard(viewerId);
  const me = leaderboard.find((row) => row.isViewer);
  return {
    leaderboard,
    rank: me?.rank ?? null,
    points: me?.points ?? 0,
    gapToTop:
      leaderboard[0] && me ? Math.max(leaderboard[0].points - me.points, 0) : 0,
    top: leaderboard[0] ?? null,
  };
}

export type HabitActivityDay = { day: string; done: number; total: number };

export function getHabitActivity(userId: string, daysCount = 14): HabitActivityDay[] {
  ensureDailyRollover();
  const start = addDays(today(), -(daysCount - 1));
  const grouped = db
    .select({ day: proofs.day, value: count() })
    .from(proofs)
    .where(and(eq(proofs.userId, userId), gte(proofs.day, start)))
    .groupBy(proofs.day)
    .all();
  const counts = new Map(grouped.map((g) => [g.day, g.value]));
  const total = db
    .select({ value: count() })
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.archived, false)))
    .get()?.value ?? 0;
  return Array.from({ length: daysCount }, (_, i) => {
    const day = addDays(today(), i - (daysCount - 1));
    return { day, done: counts.get(day) ?? 0, total };
  });
}

export function getLevel(points: number) {
  const level = Math.floor(points / 100) + 1;
  const current = points % 100;
  return { level, current, next: 100 };
}

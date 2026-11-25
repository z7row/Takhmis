import "server-only";
import { and, count, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { notifications, posts, proofs, rollovers, users } from "@/db/schema";
import { addDays, diffDays, today } from "./dates";
import { nextStreakValue } from "./streak";
import { SLACK_LINES, JOKER_EVERY } from "./constants";

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function processDay(day: string): void {
  db.transaction((tx) => {
    const already = tx
      .select({ day: rollovers.day })
      .from(rollovers)
      .where(eq(rollovers.day, day))
      .get();
    if (already) return;

    const members = tx
      .select()
      .from(users)
      .where(and(eq(users.disabled, false), lte(users.joinDay, day)))
      .all();

    for (const member of members) {
      const proofCount =
        tx
          .select({ value: count() })
          .from(proofs)
          .where(and(eq(proofs.userId, member.id), eq(proofs.day, day)))
          .get()?.value ?? 0;

      if (proofCount > 0) {
        if (member.lastStreakDay !== day) {
          const { streak, milestone } = nextStreakValue(
            member.streak,
            member.lastStreakDay,
            day,
          );
          tx.update(users)
            .set({
              streak,
              longestStreak: Math.max(member.longestStreak, streak),
              lastStreakDay: day,
              jokers: member.jokers + (milestone ? 1 : 0),
            })
            .where(eq(users.id, member.id))
            .run();

          if (milestone) {
            tx.insert(notifications)
              .values({
                userId: member.id,
                type: "joker",
                title: "كارت جوكر جديد 🃏",
                body: `وصلت ${streak} أيام ورا بعض — خدت جوكر يحمي الستريك.`,
                href: "/profile",
              })
              .run();
          }
        }
        continue;
      }

      // يوم من غير إثبات
      if (member.lastStreakDay !== day) {
        if (member.streak > 0 && member.jokers > 0) {
          tx.update(users)
            .set({ jokers: member.jokers - 1, lastStreakDay: day })
            .where(eq(users.id, member.id))
            .run();
          tx.insert(notifications)
            .values({
              userId: member.id,
              type: "joker_used",
              title: "الجوكر أنقذك 🃏",
              body: `استخدمت جوكر عشان تحمي ستريك ${member.streak} يوم.`,
              href: "/profile",
            })
            .run();
        } else if (member.streak > 0) {
          tx.update(users)
            .set({ streak: 0, lastStreakDay: day })
            .where(eq(users.id, member.id))
            .run();
        } else {
          tx.update(users)
            .set({ lastStreakDay: day })
            .where(eq(users.id, member.id))
            .run();
        }
      }

      const slackExists = tx
        .select({ id: posts.id })
        .from(posts)
        .where(
          and(
            eq(posts.userId, member.id),
            eq(posts.day, day),
            eq(posts.type, "slack"),
          ),
        )
        .get();

      if (!slackExists) {
        const line = SLACK_LINES[hash(`${member.id}:${day}`) % SLACK_LINES.length];
        tx.insert(posts)
          .values({
            userId: member.id,
            type: "slack",
            body: line.replaceAll("{name}", member.nickname),
            day,
          })
          .run();
      }
    }

    tx.insert(rollovers).values({ day }).run();
  });
}

let lastAttempt = 0;

/**
 * يعالج الأيام اللي عدّت من غير ما يفتح حد التطبيق:
 * ستريك / جوكر / بوستات التقصير. آمن يتنادي كل شوية (idempotent).
 */
export function ensureDailyRollover(force = false): void {
  const now = Date.now();
  if (!force && now - lastAttempt < 60_000) return;
  lastAttempt = now;

  const yesterday = addDays(today(), -1);
  const done = db
    .select({ day: rollovers.day })
    .from(rollovers)
    .where(eq(rollovers.day, yesterday))
    .get();
  if (done) return;

  const latest = db
    .select({ day: rollovers.day })
    .from(rollovers)
    .orderBy(rollovers.day)
    .all()
    .at(-1);

  let cursor = latest ? addDays(latest.day, 1) : yesterday;
  const days: string[] = [];
  while (cursor <= yesterday && days.length < 30) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  for (const day of days) {
    if (diffDays(today(), day) <= 0) continue;
    processDay(day);
  }
}

export function runRolloverForDay(day: string): void {
  processDay(day);
}

export { JOKER_EVERY };

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  TITLE_DEFAULT,
  TITLE_LAST,
  TITLE_NEWBIE,
  TITLE_RANKS,
} from "./constants";

export type ComputedTitle = {
  title: string;
  emoji: string;
  tone: "positive" | "neutral" | "negative";
  rank: number | null;
};

export function computeTitles(
  members: Array<{
    id: string;
    points: number;
    streak: number;
    proofsCount: number;
    lifetimePoints: number;
  }>,
): Map<string, ComputedTitle> {
  const result = new Map<string, ComputedTitle>();
  const participants = members.filter((member) => member.proofsCount > 0);

  for (const member of members) {
    if (member.proofsCount === 0) {
      result.set(member.id, { ...TITLE_NEWBIE, rank: null });
    }
  }

  const ranked = [...participants].sort(
    (a, b) =>
      b.points - a.points ||
      b.streak - a.streak ||
      b.lifetimePoints - a.lifetimePoints ||
      b.proofsCount - a.proofsCount,
  );

  ranked.forEach((member, index) => {
    const rank = index + 1;
    if (rank <= TITLE_RANKS.length) {
      result.set(member.id, { ...TITLE_RANKS[index], rank });
      return;
    }
    if (rank === ranked.length && ranked.length >= 4) {
      result.set(member.id, { ...TITLE_LAST, rank });
      return;
    }
    result.set(member.id, { ...TITLE_DEFAULT, rank });
  });

  return result;
}

export function syncTitles(): void {
  const members = db
    .select({
      id: users.id,
      points: users.points,
      streak: users.streak,
      proofsCount: users.proofsCount,
      lifetimePoints: users.lifetimePoints,
      titleLocked: users.titleLocked,
    })
    .from(users)
    .where(eq(users.disabled, false))
    .all();

  const titles = computeTitles(members);

  db.transaction((tx) => {
    for (const member of members) {
      if (member.titleLocked) continue;
      const computed = titles.get(member.id);
      if (!computed) continue;
      tx.update(users)
        .set({
          title: computed.title,
          titleEmoji: computed.emoji,
          titleTone: computed.tone,
        })
        .where(eq(users.id, member.id))
        .run();
    }
  });
}

export function leaderboardMembers() {
  return db
    .select()
    .from(users)
    .where(eq(users.disabled, false))
    .orderBy(asc(users.id))
    .all();
}

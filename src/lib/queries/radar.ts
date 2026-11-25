import "server-only";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  lt,
  or,
} from "drizzle-orm";
import { db } from "@/db";
import { hangouts, hangoutRsvps, statuses, users } from "@/db/schema";
import { isOnline } from "@/lib/dates";

export type RadarPerson = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  title: string;
  titleEmoji: string;
  online: boolean;
  status: {
    kind: "free" | "busy" | "need_company" | "custom";
    message: string | null;
    place: string | null;
    createdAt: number;
    expiresAt: number | null;
  } | null;
};

export type HangoutPerson = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
};

export type HangoutItem = {
  id: string;
  createdBy: string | null;
  title: string;
  place: string | null;
  notes: string | null;
  startsAt: number;
  going: HangoutPerson[];
  faks: HangoutPerson[];
  myStatus: "going" | "faks" | null;
};

export type RadarData = {
  me: { status: RadarPerson["status"] };
  people: RadarPerson[];
};

export type HangoutsData = {
  upcoming: HangoutItem[];
  past: HangoutItem[];
};

function hangoutDTO(
  rows: (typeof hangouts.$inferSelect)[],
  rsvps: Array<{
    hangoutId: string;
    status: "going" | "faks";
    userId: string;
    nickname: string;
    avatarUrl: string | null;
  }>,
  viewerId: string,
): HangoutItem[] {
  return rows.map((h) => {
    const mine = rsvps.filter((r) => r.hangoutId === h.id);
    const toPerson = (r: (typeof mine)[number]): HangoutPerson => ({
      id: r.userId,
      nickname: r.nickname,
      avatarUrl: r.avatarUrl,
    });
    return {
      id: h.id,
      createdBy: h.createdBy,
      title: h.title,
      place: h.place,
      notes: h.notes,
      startsAt: new Date(h.startsAt).getTime(),
      going: mine.filter((r) => r.status === "going").map(toPerson),
      faks: mine.filter((r) => r.status === "faks").map(toPerson),
      myStatus: mine.find((r) => r.userId === viewerId)?.status ?? null,
    };
  });
}

export function getRadarData(viewerId: string): RadarData {
  const now = new Date();

  const members = db
    .select()
    .from(users)
    .where(eq(users.disabled, false))
    .orderBy(desc(users.points), asc(users.nickname))
    .all();

  const activeStatuses = db
    .select({
      userId: statuses.userId,
      kind: statuses.kind,
      message: statuses.message,
      place: statuses.place,
      createdAt: statuses.createdAt,
      expiresAt: statuses.expiresAt,
    })
    .from(statuses)
    .innerJoin(users, eq(users.id, statuses.userId))
    .where(
      and(
        eq(users.disabled, false),
        eq(statuses.active, true),
        or(isNull(statuses.expiresAt), gt(statuses.expiresAt, now)),
      ),
    )
    .orderBy(desc(statuses.createdAt))
    .all();

  const latestStatus = new Map<string, RadarPerson["status"]>();
  for (const s of activeStatuses) {
    if (latestStatus.has(s.userId)) continue;
    latestStatus.set(s.userId, {
      kind: s.kind,
      message: s.message,
      place: s.place,
      createdAt: new Date(s.createdAt).getTime(),
      expiresAt: s.expiresAt ? new Date(s.expiresAt).getTime() : null,
    });
  }

  const order: Record<string, number> = {
    need_company: 0,
    free: 1,
    custom: 2,
    busy: 3,
  };

  const people: RadarPerson[] = members
    .map((m) => {
      const status = latestStatus.get(m.id) ?? null;
      return {
        id: m.id,
        nickname: m.nickname,
        avatarUrl: m.avatarUrl,
        title: m.title,
        titleEmoji: m.titleEmoji,
        online: isOnline(m.lastSeenAt),
        status,
      };
    })
    .sort((a, b) => {
      const ao = a.status ? order[a.status.kind] : 4;
      const bo = b.status ? order[b.status.kind] : 4;
      if (ao !== bo) return ao - bo;
      if (a.status && b.status) return b.status.createdAt - a.status.createdAt;
      return a.nickname.localeCompare(b.nickname, "ar");
    });

  return {
    me: { status: latestStatus.get(viewerId) ?? null },
    people,
  };
}

export function getHangoutsData(viewerId: string): HangoutsData {
  const now = new Date();
  const upcoming = db
    .select()
    .from(hangouts)
    .where(and(eq(hangouts.active, true), gte(hangouts.startsAt, now)))
    .orderBy(asc(hangouts.startsAt))
    .all();

  const past = db
    .select()
    .from(hangouts)
    .where(and(eq(hangouts.active, true), lt(hangouts.startsAt, now)))
    .orderBy(desc(hangouts.startsAt))
    .limit(12)
    .all();

  const hangoutIds = [...upcoming, ...past].map((h) => h.id);
  const rsvps = hangoutIds.length
    ? db
        .select({
          hangoutId: hangoutRsvps.hangoutId,
          status: hangoutRsvps.status,
          userId: users.id,
          nickname: users.nickname,
          avatarUrl: users.avatarUrl,
        })
        .from(hangoutRsvps)
        .innerJoin(users, eq(users.id, hangoutRsvps.userId))
        .where(inArray(hangoutRsvps.hangoutId, hangoutIds))
        .all()
    : [];

  return {
    upcoming: hangoutDTO(upcoming, rsvps, viewerId),
    past: hangoutDTO(past, rsvps, viewerId),
  };
}

import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export const users = sqliteTable(
  "users",
  {
    id: id(),
    nickname: text("nickname").notNull(),
    nicknameKey: text("nickname_key").notNull(),
    passwordHash: text("password_hash").notNull(),
    avatarUrl: text("avatar_url"),
    role: text("role", { enum: ["admin", "member"] })
      .notNull()
      .default("member"),
    /** نقاط الأسبوع الحالي */
    points: integer("points").notNull().default(0),
    /** إجمالي النقاط على مدار العمر */
    lifetimePoints: integer("lifetime_points").notNull().default(0),
    streak: integer("streak").notNull().default(0),
    longestStreak: integer("longest_streak").notNull().default(0),
    /** آخر يوم تم احتسابه في الستريك (YYYY-MM-DD) */
    lastStreakDay: text("last_streak_day"),
    jokers: integer("jokers").notNull().default(1),
    wins: integer("wins").notNull().default(0),
    proofsCount: integer("proofs_count").notNull().default(0),
    title: text("title").notNull().default("المبتدئ"),
    titleEmoji: text("title_emoji").notNull().default("🌱"),
    titleTone: text("title_tone", { enum: ["positive", "neutral", "negative"] })
      .notNull()
      .default("neutral"),
    titleLocked: integer("title_locked", { mode: "boolean" })
      .notNull()
      .default(false),
    disabled: integer("disabled", { mode: "boolean" }).notNull().default(false),
    joinDay: text("join_day").notNull(),
    lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("users_nickname_key_idx").on(t.nicknameKey),
    index("users_points_idx").on(t.points),
  ],
);

/* ------------------------------------------------------------------ */
/* Invites                                                             */
/* ------------------------------------------------------------------ */

export const invites = sqliteTable(
  "invites",
  {
    id: id(),
    code: text("code").notNull(),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    maxUses: integer("max_uses").notNull().default(1),
    uses: integer("uses").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    note: text("note"),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("invites_code_idx").on(t.code)],
);

/* ------------------------------------------------------------------ */
/* Habits                                                              */
/* ------------------------------------------------------------------ */

export const habits = sqliteTable(
  "habits",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    emoji: text("emoji").notNull().default("🎯"),
    position: integer("position").notNull().default(0),
    archived: integer("archived", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("habits_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* Proofs (photo proofs)                                               */
/* ------------------------------------------------------------------ */

export const proofs = sqliteTable(
  "proofs",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    habitId: text("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    day: text("day").notNull(),
    imageUrl: text("image_url"),
    caption: text("caption"),
    points: integer("points").notNull().default(0),
    fullDay: integer("full_day", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("proofs_user_habit_day_idx").on(t.userId, t.habitId, t.day),
    index("proofs_day_idx").on(t.day),
    index("proofs_user_day_idx").on(t.userId, t.day),
  ],
);

/* ------------------------------------------------------------------ */
/* Feed posts                                                          */
/* ------------------------------------------------------------------ */

export const posts = sqliteTable(
  "posts",
  {
    id: id(),
    userId: text("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    type: text("type", {
      enum: ["proof", "slack", "weekly", "system", "post"],
    })
      .notNull()
      .default("proof"),
    body: text("body"),
    imageUrl: text("image_url"),
    proofId: text("proof_id").references(() => proofs.id, {
      onDelete: "cascade",
    }),
    habitId: text("habit_id").references(() => habits.id, {
      onDelete: "set null",
    }),
    day: text("day"),
    deleted: integer("deleted", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    index("posts_created_idx").on(t.createdAt),
    index("posts_user_idx").on(t.userId),
  ],
);

/* ------------------------------------------------------------------ */
/* Reactions & comments                                                */
/* ------------------------------------------------------------------ */

export const reactions = sqliteTable(
  "reactions",
  {
    id: id(),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    emoji: text("emoji").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("reactions_post_user_idx").on(t.postId, t.userId),
    index("reactions_post_idx").on(t.postId),
  ],
);

export const comments = sqliteTable(
  "comments",
  {
    id: id(),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    deleted: integer("deleted", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    index("comments_post_idx").on(t.postId),
    index("comments_created_idx").on(t.createdAt),
  ],
);

/* ------------------------------------------------------------------ */
/* Radar (live status)                                                 */
/* ------------------------------------------------------------------ */

export const statuses = sqliteTable(
  "statuses",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind", {
      enum: ["free", "busy", "need_company", "custom"],
    }).notNull(),
    message: text("message"),
    place: text("place"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [index("statuses_user_idx").on(t.userId, t.active)],
);

/* ------------------------------------------------------------------ */
/* Hangouts                                                            */
/* ------------------------------------------------------------------ */

export const hangouts = sqliteTable("hangouts", {
  id: id(),
  title: text("title").notNull(),
  place: text("place"),
  startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
  notes: text("notes"),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

export const hangoutRsvps = sqliteTable(
  "hangout_rsvps",
  {
    hangoutId: text("hangout_id")
      .notNull()
      .references(() => hangouts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["going", "faks"] }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [primaryKey({ columns: [t.hangoutId, t.userId] })],
);

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export const notifications = sqliteTable(
  "notifications",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    href: text("href"),
    read: integer("read", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.read)],
);

/* ------------------------------------------------------------------ */
/* Weekly cycles                                                       */
/* ------------------------------------------------------------------ */

export const weeks = sqliteTable("weeks", {
  id: id(),
  startDay: text("start_day").notNull(),
  endDay: text("end_day").notNull(),
  reward: text("reward").notNull(),
  status: text("status", { enum: ["active", "closed"] })
    .notNull()
    .default("active"),
  winnerId: text("winner_id").references(() => users.id, {
    onDelete: "set null",
  }),
  closedAt: integer("closed_at", { mode: "timestamp_ms" }),
  createdAt: createdAt(),
});

export const weekResults = sqliteTable(
  "week_results",
  {
    id: id(),
    weekId: text("week_id")
      .notNull()
      .references(() => weeks.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    points: integer("points").notNull(),
    rank: integer("rank").notNull(),
    title: text("title"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("week_results_week_user_idx").on(t.weekId, t.userId)],
);

/* ------------------------------------------------------------------ */
/* System                                                              */
/* ------------------------------------------------------------------ */

export const rollovers = sqliteTable("rollovers", {
  day: text("day").primaryKey(),
  processedAt: integer("processed_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const bonuses = sqliteTable(
  "bonuses",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    day: text("day").notNull(),
    kind: text("kind").notNull(),
    points: integer("points").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("bonuses_user_day_kind_idx").on(t.userId, t.day, t.kind)],
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type Proof = typeof proofs.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Week = typeof weeks.$inferSelect;
export type Hangout = typeof hangouts.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export const defaultWeekRewardSql = sql`'مكان الخروجة الجاية على الباقي 🎉'`;

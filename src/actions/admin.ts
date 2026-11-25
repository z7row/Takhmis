"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  invites,
  notifications,
  posts,
  settings,
  users,
  weekResults,
  weeks,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { addDays, today } from "@/lib/dates";
import { normalizeNickname } from "@/lib/password";
import { notifyEveryoneExcept } from "@/lib/notify";
import { getLeaderboard } from "@/lib/queries/habits";
import { syncTitles } from "@/lib/titles";
import { ensureDailyRollover } from "@/lib/rollover";
import { ensureActiveWeek, getActiveWeek } from "@/lib/week";
import {
  firstError,
  inviteSchema,
  rewardSchema,
  type ActionState,
} from "@/lib/validation";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length = 5): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `TKH-${out}`;
}

export async function createInviteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = inviteSchema.safeParse({
    maxUses: formData.get("maxUses") || 1,
    note: formData.get("note") || undefined,
    expiresInDays: formData.get("expiresInDays") || 14,
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  let code = randomCode();
  for (let attempt = 0; attempt < 10; attempt++) {
    const exists = db
      .select({ id: invites.id })
      .from(invites)
      .where(eq(invites.code, code))
      .get();
    if (!exists) break;
    code = randomCode(attempt > 5 ? 7 : 5);
  }

  db.insert(invites)
    .values({
      code,
      createdBy: admin.id,
      maxUses: parsed.data.maxUses,
      note: parsed.data.note || null,
      expiresAt:
        parsed.data.expiresInDays > 0
          ? new Date(Date.now() + parsed.data.expiresInDays * 86400000)
          : null,
    })
    .run();

  revalidatePath("/admin");
  return { success: `كود جديد جاهز: ${code}` };
}

export async function toggleInviteAction(
  inviteId: string,
): Promise<ActionState> {
  await requireAdmin();
  const invite = db
    .select()
    .from(invites)
    .where(eq(invites.id, inviteId))
    .get();
  if (!invite) return { error: "الكود مش موجود" };

  db.update(invites)
    .set({ active: !invite.active })
    .where(eq(invites.id, inviteId))
    .run();

  revalidatePath("/admin");
  return { success: invite.active ? "الكود اتوقف" : "الكود اتفعّل" };
}

export async function deleteInviteAction(
  inviteId: string,
): Promise<ActionState> {
  await requireAdmin();
  db.delete(invites)
    .where(eq(invites.id, inviteId))
    .run();
  revalidatePath("/admin");
  return { success: "الكود اتمسح" };
}

const memberSchema = z.object({
  nickname: z.string().trim().min(2).max(24),
  role: z.enum(["admin", "member"]),
  points: z.coerce.number().int().min(0).max(1_000_000),
  streak: z.coerce.number().int().min(0).max(10_000),
  jokers: z.coerce.number().int().min(0).max(999),
  wins: z.coerce.number().int().min(0).max(999),
  title: z.string().trim().max(40).optional(),
  titleEmoji: z.string().trim().max(12).optional(),
  titleLocked: z.boolean(),
  disabled: z.boolean(),
});

export async function updateMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "العضو مش موجود" };

  const target = db.select().from(users).where(eq(users.id, id)).get();
  if (!target) return { error: "العضو مش موجود" };

  const parsed = memberSchema.safeParse({
    nickname: formData.get("nickname"),
    role: formData.get("role"),
    points: formData.get("points"),
    streak: formData.get("streak"),
    jokers: formData.get("jokers"),
    wins: formData.get("wins"),
    title: formData.get("title") || undefined,
    titleEmoji: formData.get("titleEmoji") || undefined,
    titleLocked: formData.get("titleLocked") === "on",
    disabled: formData.get("disabled") === "on",
  });

  if (!parsed.success) return { error: firstError(parsed.error) };

  if (id === admin.id) {
    if (parsed.data.role !== "admin") return { error: "مش ممكن تشيل صلاحية نفسك" };
    if (parsed.data.disabled) return { error: "مش ممكن توقف حسابك أنت" };
  }

  const nicknameKey = normalizeNickname(parsed.data.nickname);
  const taken = db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.nicknameKey, nicknameKey), ne(users.id, id)))
    .get();
  if (taken) return { error: "الاسم ده محجوز لعضو تاني" };

  db.update(users)
    .set({
      nickname: parsed.data.nickname,
      nicknameKey,
      role: parsed.data.role,
      points: parsed.data.points,
      streak: parsed.data.streak,
      jokers: parsed.data.jokers,
      wins: parsed.data.wins,
      disabled: parsed.data.disabled,
      titleLocked: parsed.data.titleLocked,
      title: parsed.data.title || target.title,
      titleEmoji: parsed.data.titleEmoji || target.titleEmoji,
      titleTone: parsed.data.titleLocked ? "neutral" : target.titleTone,
    })
    .where(eq(users.id, id))
    .run();

  syncTitles();
  revalidatePath("/admin");
  revalidatePath("/habits");
  revalidatePath("/feed");
  revalidatePath("/profile");
  return { success: "بيانات العضو اتحدّثت ✅" };
}

export async function deleteMemberAction(
  memberId: string,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (memberId === admin.id) return { error: "مش ممكن تمسح حسابك أنت" };

  const target = db
    .select()
    .from(users)
    .where(eq(users.id, memberId))
    .get();
  if (!target) return { error: "العضو مش موجود" };

  if (target.role === "admin") {
    const admins =
      db
        .select({ value: count() })
        .from(users)
        .where(and(eq(users.role, "admin"), eq(users.disabled, false)))
        .get()?.value ?? 0;
    if (admins <= 1) return { error: "لازم يفضل أدمن واحد على الأقل" };
  }

  db.delete(users).where(eq(users.id, memberId)).run();
  syncTitles();
  revalidatePath("/admin");
  revalidatePath("/feed");
  revalidatePath("/habits");
  return { success: "العضو اتمسح" };
}

export async function setWeekRewardAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = rewardSchema.safeParse(formData.get("reward"));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const week = ensureActiveWeek();
  db.update(weeks)
    .set({ reward: parsed.data })
    .where(eq(weeks.id, week.id))
    .run();

  db.insert(settings)
    .values({ key: "default_week_reward", value: parsed.data })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: parsed.data, updatedAt: new Date() },
    })
    .run();

  revalidatePath("/admin");
  revalidatePath("/habits");
  return { success: "مكافأة الأسبوع اتحدّثت ✅" };
}

export async function closeWeekAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = rewardSchema.safeParse(formData.get("reward"));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const week = getActiveWeek();
  if (!week) return { error: "مفيش أسبوع شغال" };

  const leaderboard = getLeaderboard(admin.id);
  if (!leaderboard.length) return { error: "مفيش أعضاء في الشلة" };

  const hasCompetition = leaderboard.some((row) => row.points > 0);
  const top = hasCompetition ? leaderboard[0] : null;
  const startDay = today();

  db.transaction((tx) => {
    leaderboard.forEach((row, index) => {
      tx.insert(weekResults)
        .values({
          weekId: week.id,
          userId: row.id,
          points: row.points,
          rank: index + 1,
          title: `${row.titleEmoji} ${row.title}`,
        })
        .run();
    });

    tx.update(weeks)
      .set({
        status: "closed",
        winnerId: top?.id ?? null,
        closedAt: new Date(),
      })
      .where(eq(weeks.id, week.id))
      .run();

    if (top) {
      tx.update(users)
        .set({ wins: top.wins + 1 })
        .where(eq(users.id, top.id))
        .run();
    }

    tx.update(users).set({ points: 0 }).run();

    tx.insert(weeks)
      .values({
        startDay,
        endDay: addDays(startDay, 6),
        reward: parsed.data,
        status: "active",
      })
      .run();

    const body = top
      ? `🏆 ${top.nickname} كسب رهان الأسبوع بـ ${top.points} نقطة!\nالمكافأة: ${week.reward}\n\nنبدأ أسبوع جديد من دلوقتي — المكافأة الجديدة: ${parsed.data}`
      : `الأسبوع خلص من غير منافسة 😴\nنبدأ أسبوع جديد من دلوقتي — المكافأة: ${parsed.data}`;

    tx.insert(posts)
      .values({
        userId: top?.id ?? null,
        type: "weekly",
        body,
        day: startDay,
      })
      .run();

    const recipients = tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.disabled, false))
      .all();

    if (recipients.length) {
      tx.insert(notifications)
        .values(
          recipients.map((r) => ({
            userId: r.id,
            type: "week",
            title: top
              ? `🏆 ${top.nickname} كسب الأسبوع!`
              : "أسبوع جديد بدأ 🔄",
            body: `المكافأة الجديدة: ${parsed.data}`,
            href: "/habits",
          })),
        )
        .run();
    }
  });

  db.insert(settings)
    .values({ key: "default_week_reward", value: parsed.data })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: parsed.data, updatedAt: new Date() },
    })
    .run();

  syncTitles();
  revalidatePath("/", "layout");
  return {
    success: top
      ? `الأسبوع اتقفل — ${top.nickname} كسب! 🏆`
      : "الأسبوع اتقفل وأسبوع جديد بدأ 🔄",
  };
}

export async function runRolloverAction(): Promise<ActionState> {
  await requireAdmin();
  ensureDailyRollover(true);
  revalidatePath("/", "layout");
  return { success: "معالجة الأيام اللي فاتت تمت ✅" };
}

export async function resetWeekScoresAction(): Promise<ActionState> {
  await requireAdmin();
  db.update(users).set({ points: 0 }).run();
  syncTitles();
  revalidatePath("/", "layout");
  return { success: "نقاط الأسبوع اتصفّرت" };
}

export async function sendBroadcastAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (title.length < 2) return { error: "اكتب عنوان الرسالة" };

  notifyEveryoneExcept(
    {
      type: "broadcast",
      title,
      body: body || undefined,
      href: "/feed",
    },
    admin.id,
  );

  revalidatePath("/", "layout");
  return { success: "الإشعار اتبعت للشلة ✅" };
}


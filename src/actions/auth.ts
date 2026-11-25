"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { habits, invites, notifications, posts, users } from "@/db/schema";
import {
  createSession,
  destroySession,
  requireUser,
} from "@/lib/auth";
import { today } from "@/lib/dates";
import { hashPassword, normalizeNickname, verifyPassword } from "@/lib/password";
import { saveImage } from "@/lib/upload";
import {
  firstError,
  habitsPayloadSchema,
  loginSchema,
  registerSchema,
  type ActionState,
  type HabitInput,
} from "@/lib/validation";

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    code: formData.get("code"),
    nickname: formData.get("nickname"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) return { error: firstError(parsed.error) };

  let habitsInput: HabitInput[];
  try {
    habitsInput = JSON.parse(String(formData.get("habits") ?? "[]"));
  } catch {
    return { error: "اختار عاداتك تاني من فضلك" };
  }

  const habitsParsed = habitsPayloadSchema.safeParse(habitsInput);
  if (!habitsParsed.success) return { error: firstError(habitsParsed.error) };

  const { code, nickname, password } = parsed.data;
  const nicknameKey = normalizeNickname(nickname);

  const invite = db
    .select()
    .from(invites)
    .where(and(eq(invites.code, code), eq(invites.active, true)))
    .get();

  if (!invite) return { error: "كود الدعوة غلط أو متوقف — كلّم الأدمن" };
  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
    return { error: "كود الدعوة انتهت صلاحيته — اطلب كود جديد" };
  }
  if (invite.uses >= invite.maxUses) {
    return { error: "كود الدعوة استخدم قبل كده — اطلب كود جديد" };
  }

  const existing = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.nicknameKey, nicknameKey))
    .get();
  if (existing) return { error: "الاسم ده محجوز — جرّب لقب تاني" };

  let avatarUrl: string | null = null;
  const avatar = formData.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    try {
      avatarUrl = await saveImage(avatar, "avatar");
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "مشكلة في رفع الصورة",
      };
    }
  }

  const passwordHash = await hashPassword(password);
  const joinDay = today();

  try {
    const created = db.transaction((tx) => {
      const user = tx
        .insert(users)
        .values({
          nickname,
          nicknameKey,
          passwordHash,
          avatarUrl,
          role: "member",
          joinDay,
          lastSeenAt: new Date(),
        })
        .returning()
        .get();

      const nextUses = invite.uses + 1;
      tx.update(invites)
        .set({
          uses: nextUses,
          active: nextUses < invite.maxUses,
        })
        .where(eq(invites.id, invite.id))
        .run();

      tx.insert(habits)
        .values(
          habitsParsed.data.map((habit, index) => ({
            userId: user.id,
            title: habit.title,
            emoji: habit.emoji,
            position: index,
          })),
        )
        .run();

      tx.insert(posts)
        .values({
          userId: user.id,
          type: "system",
          body: `${nickname} انضم للشلة 🎉 خلونا نرحب بيه`,
          day: joinDay,
        })
        .run();

      const admins = tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, "admin"))
        .all();

      if (admins.length) {
        tx.insert(notifications)
          .values(
            admins.map((admin) => ({
              userId: admin.id,
              type: "member",
              title: "عضو جديد في الشلة 🎉",
              body: `${nickname} انضم عن طريق كود ${code}`,
              href: "/admin?tab=members",
            })),
          )
          .run();
      }

      return user;
    });

    await createSession(created.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE") || message.includes("unique")) {
      return { error: "الاسم ده محجوز — جرّب لقب تاني" };
    }
    return { error: "حصلت مشكلة وإحنا بنعمل الحساب — جرّب تاني" };
  }

  redirect("/feed?welcome=1");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    nickname: formData.get("nickname"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: firstError(parsed.error) };

  const user = db
    .select()
    .from(users)
    .where(eq(users.nicknameKey, normalizeNickname(parsed.data.nickname)))
    .get();

  if (!user) return { error: "الاسم أو كلمة السر غلط" };
  if (user.disabled) return { error: "الحساب ده متوقف — كلّم الأدمن" };

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return { error: "الاسم أو كلمة السر غلط" };

  db.update(users)
    .set({ lastSeenAt: new Date() })
    .where(eq(users.id, user.id))
    .run();

  await createSession(user.id);
  redirect("/feed");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function touchPresenceAction(): Promise<void> {
  const user = await requireUser();
  db.update(users)
    .set({ lastSeenAt: new Date() })
    .where(eq(users.id, user.id))
    .run();
}

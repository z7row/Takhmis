"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { habits, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { HABIT_HARD_LIMIT } from "@/lib/constants";
import { normalizeNickname, hashPassword, verifyPassword } from "@/lib/password";
import { saveImage } from "@/lib/upload";
import {
  firstError,
  nicknameSchema,
  passwordSchema,
  type ActionState,
} from "@/lib/validation";
import { syncTitles } from "@/lib/titles";

const habitEditSchema = z
  .array(
    z.object({
      id: z.string().optional(),
      title: z.string().trim().min(2, "اسم العادة قصير أوي").max(40, "اسم العادة طويل أوي"),
      emoji: z.string().trim().min(1).max(12).default("🎯"),
    }),
  )
  .min(1, "محتاج عادة واحدة على الأقل")
  .max(HABIT_HARD_LIMIT, `حد أقصى ${HABIT_HARD_LIMIT} عادة`);

export async function updateHabitsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  let parsedInput: unknown;
  try {
    parsedInput = JSON.parse(String(formData.get("habits") ?? "[]"));
  } catch {
    return { error: "البيانات مش مظبوطة" };
  }

  const parsed = habitEditSchema.safeParse(parsedInput);
  if (!parsed.success) return { error: firstError(parsed.error) };

  const existing = db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, user.id), eq(habits.archived, false)))
    .all();

  const incomingIds = new Set(
    parsed.data.map((h) => h.id).filter((id): id is string => Boolean(id)),
  );
  const ownedIds = new Set(existing.map((h) => h.id));

  for (const id of incomingIds) {
    if (!ownedIds.has(id)) return { error: "في عادة مش بتاعتك" };
  }

  db.transaction((tx) => {
    for (const habit of existing) {
      if (!incomingIds.has(habit.id)) {
        tx.update(habits)
          .set({ archived: true })
          .where(eq(habits.id, habit.id))
          .run();
      }
    }

    parsed.data.forEach((input, index) => {
      if (input.id) {
        tx.update(habits)
          .set({
            title: input.title,
            emoji: input.emoji,
            position: index,
          })
          .where(and(eq(habits.id, input.id), eq(habits.userId, user.id)))
          .run();
      } else {
        tx.insert(habits)
          .values({
            userId: user.id,
            title: input.title,
            emoji: input.emoji,
            position: index,
          })
          .run();
      }
    });
  });

  revalidatePath("/habits");
  revalidatePath("/profile");
  revalidatePath("/feed");
  return { success: "عاداتك اتظبطت ✅" };
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const nicknameParsed = nicknameSchema.safeParse(formData.get("nickname"));
  if (!nicknameParsed.success) {
    return { error: firstError(nicknameParsed.error) };
  }

  const nickname = nicknameParsed.data;
  const nicknameKey = normalizeNickname(nickname);

  if (nicknameKey !== user.nicknameKey) {
    const taken = db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.nicknameKey, nicknameKey))
      .get();
    if (taken) return { error: "الاسم ده محجوز — جرّب لقب تاني" };
  }

  let avatarUrl = user.avatarUrl;
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

  db.update(users)
    .set({ nickname, nicknameKey, avatarUrl })
    .where(eq(users.id, user.id))
    .run();

  revalidatePath("/", "layout");
  return { success: "البروفايل اتحدّث ✅" };
}

export async function updatePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const current = String(formData.get("current") ?? "");
  const next = passwordSchema.safeParse(formData.get("new"));
  const confirm = String(formData.get("confirm") ?? "");

  if (!next.success) return { error: firstError(next.error) };
  if (next.data !== confirm) return { error: "كلمتين السر الجداد مش متطابقين" };

  const ok = await verifyPassword(current, user.passwordHash);
  if (!ok) return { error: "كلمة السر الحالية غلط" };

  const passwordHash = await hashPassword(next.data);
  db.update(users)
    .set({ passwordHash })
    .where(eq(users.id, user.id))
    .run();

  return { success: "كلمة السر اتغيرت ✅" };
}

export async function refreshTitlesAction(): Promise<void> {
  await requireUser();
  syncTitles();
  revalidatePath("/habits");
  revalidatePath("/feed");
}

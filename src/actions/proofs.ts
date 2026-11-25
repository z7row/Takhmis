"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { bonuses, habits, notifications, posts, proofs, users } from "@/db/schema";
import { requireAdmin, requireUser } from "@/lib/auth";
import { POINTS } from "@/lib/constants";
import { today } from "@/lib/dates";
import { notifyEveryoneExcept } from "@/lib/notify";
import { ensureDailyRollover } from "@/lib/rollover";
import { nextStreakValue } from "@/lib/streak";
import { syncTitles } from "@/lib/titles";
import { saveImage } from "@/lib/upload";
import {
  captionSchema,
  firstError,
  type ActionState,
} from "@/lib/validation";

export async function submitProofAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  ensureDailyRollover();

  const habitId = String(formData.get("habitId") ?? "");
  const day = today();

  const habit = db
    .select()
    .from(habits)
    .where(
      and(
        eq(habits.id, habitId),
        eq(habits.userId, user.id),
        eq(habits.archived, false),
      ),
    )
    .get();

  if (!habit) return { error: "العادة دي مش موجودة عندك" };

  const existing = db
    .select({ id: proofs.id })
    .from(proofs)
    .where(
      and(
        eq(proofs.userId, user.id),
        eq(proofs.habitId, habitId),
        eq(proofs.day, day),
      ),
    )
    .get();

  if (existing) {
    return { error: "العادة دي متوثقة النهاردة خلاص ✅" };
  }

  const captionResult = captionSchema.safeParse(
    String(formData.get("caption") ?? ""),
  );
  if (!captionResult.success) return { error: firstError(captionResult.error) };

  const image = formData.get("image");
  let imageUrl: string | null = null;
  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await saveImage(image, "proof");
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "مشكلة في رفع الصورة",
      };
    }
  }

  try {
    const outcome = db.transaction((tx) => {
      const fresh = tx
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .get();
      if (!fresh) throw new Error("USER_NOT_FOUND");

      const streakInfo = nextStreakValue(
        fresh.streak,
        fresh.lastStreakDay,
        day,
      );

      const activeHabitIds = tx
        .select({ id: habits.id })
        .from(habits)
        .where(
          and(eq(habits.userId, user.id), eq(habits.archived, false)),
        )
        .all();

      const proofsToday =
        tx
          .select({ value: count() })
          .from(proofs)
          .where(and(eq(proofs.userId, user.id), eq(proofs.day, day)))
          .get()?.value ?? 0;

      const bonusAlready = tx
        .select({ id: bonuses.id })
        .from(bonuses)
        .where(
          and(
            eq(bonuses.userId, user.id),
            eq(bonuses.day, day),
            eq(bonuses.kind, "full_day"),
          ),
        )
        .get();

      const fullDay =
        !bonusAlready &&
        activeHabitIds.length > 0 &&
        proofsToday + 1 >= activeHabitIds.length;

      const earned = POINTS.proof + (fullDay ? POINTS.fullDay : 0);

      const proof = tx
        .insert(proofs)
        .values({
          userId: user.id,
          habitId,
          day,
          imageUrl,
          caption: captionResult.data || null,
          points: earned,
          fullDay,
        })
        .returning()
        .get();

      tx.insert(posts)
        .values({
          userId: user.id,
          type: "proof",
          body: captionResult.data || null,
          imageUrl,
          proofId: proof.id,
          habitId,
          day,
        })
        .run();

      if (fullDay) {
        tx.insert(bonuses)
          .values({
            userId: user.id,
            day,
            kind: "full_day",
            points: POINTS.fullDay,
          })
          .run();
        tx.insert(notifications)
          .values({
            userId: user.id,
            type: "full_day",
            title: "يوم كامل يا وحش! 🔥",
            body: `وثّقت كل عاداتك النهاردة وخدت +${POINTS.fullDay} نقطة بونص.`,
            href: "/habits",
          })
          .run();
      }

      if (streakInfo.changed && streakInfo.milestone) {
        tx.insert(notifications)
          .values({
            userId: user.id,
            type: "joker",
            title: "كارت جوكر جديد 🃏",
            body: `وصلت ${streakInfo.streak} أيام ورا بعض — خدت جوكر يحمي الستريك.`,
            href: "/profile",
          })
          .run();
      }

      tx.update(users)
        .set({
          points: fresh.points + earned,
          lifetimePoints: fresh.lifetimePoints + earned,
          proofsCount: fresh.proofsCount + 1,
          streak: streakInfo.changed ? streakInfo.streak : fresh.streak,
          longestStreak: Math.max(
            fresh.longestStreak,
            streakInfo.changed ? streakInfo.streak : fresh.streak,
          ),
          lastStreakDay: streakInfo.changed ? day : fresh.lastStreakDay,
          jokers:
            fresh.jokers + (streakInfo.changed && streakInfo.milestone ? 1 : 0),
        })
        .where(eq(users.id, user.id))
        .run();

      return { earned, fullDay, streak: streakInfo.streak };
    });

    syncTitles();

    notifyEveryoneExcept(
      {
        type: "proof",
        title: `${user.nickname} وثّق ${habit.emoji} ${habit.title}`,
        body: captionResult.data || "ادخل شوف الإثبات وادعمه 💪",
        href: "/feed",
      },
      user.id,
    );

    revalidatePath("/feed");
    revalidatePath("/habits");
    revalidatePath("/profile");

    const bonusText = outcome.fullDay ? " + بونص اليوم الكامل" : "";
    return {
      success: `تم التوثيق! +${outcome.earned} نقطة${bonusText} · ستريك ${outcome.streak} 🔥`,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return { error: "العادة دي متوثقة النهاردة خلاص ✅" };
    }
    return { error: "حصلت مشكلة وإحنا بنسجل الإثبات — جرّب تاني" };
  }
}

export async function deleteProofPostAction(
  postId: string,
): Promise<ActionState> {
  await requireAdmin();

  try {
    db.transaction((tx) => {
      const post = tx.select().from(posts).where(eq(posts.id, postId)).get();
      if (!post) throw new Error("NOT_FOUND");

      if (post.proofId) {
        const proof = tx
          .select()
          .from(proofs)
          .where(eq(proofs.id, post.proofId))
          .get();
        if (proof) {
          tx.delete(proofs).where(eq(proofs.id, proof.id)).run();
          const author = tx
            .select()
            .from(users)
            .where(eq(users.id, proof.userId))
            .get();
          if (author) {
            tx.update(users)
              .set({
                points: Math.max(author.points - proof.points, 0),
                lifetimePoints: Math.max(author.lifetimePoints - proof.points, 0),
                proofsCount: Math.max(author.proofsCount - 1, 0),
              })
              .where(eq(users.id, author.id))
              .run();
            tx.insert(notifications)
              .values({
                userId: author.id,
                type: "moderation",
                title: "إثبات اتشال من الفيد",
                body: "الأدمن شال واحد من إثباتاتك. كلّم الأدمن لو في لبس.",
                href: "/feed",
              })
              .run();
          }
        }
      } else {
        tx.update(posts)
          .set({ deleted: true })
          .where(eq(posts.id, postId))
          .run();
      }
    });

    syncTitles();
    revalidatePath("/feed");
    revalidatePath("/admin");
    revalidatePath("/habits");
    return { success: "المنشور اتشال" };
  } catch {
    return { error: "مش قادرين نشيل المنشور ده" };
  }
}

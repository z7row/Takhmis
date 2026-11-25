"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { hangoutRsvps, hangouts, statuses } from "@/db/schema";
import { requireAdmin, requireUser } from "@/lib/auth";
import { STATUS_KIND_META } from "@/lib/constants";
import { fromLocalInputValue } from "@/lib/dates";
import { notifyEveryoneExcept } from "@/lib/notify";
import {
  firstError,
  hangoutSchema,
  statusSchema,
  type ActionState,
} from "@/lib/validation";

export async function setStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = statusSchema.safeParse({
    kind: formData.get("kind"),
    message: formData.get("message") || undefined,
    place: formData.get("place") || undefined,
    hours: formData.get("hours") || 1,
  });

  if (!parsed.success) return { error: firstError(parsed.error) };

  const { kind, message, place, hours } = parsed.data;
  const preset = STATUS_KIND_META[kind];
  const finalMessage = message?.trim() || preset?.label || "حالة جديدة";

  db.transaction((tx) => {
    tx.update(statuses)
      .set({ active: false })
      .where(
        and(eq(statuses.userId, user.id), eq(statuses.active, true)),
      )
      .run();

    tx.insert(statuses)
      .values({
        userId: user.id,
        kind,
        message: finalMessage,
        place: place?.trim() || null,
        active: true,
        expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
      })
      .run();
  });

  const title =
    kind === "need_company"
      ? `${user.nickname} محتاج حد ينزل معاه 🙋`
      : kind === "free"
        ? `${user.nickname} فاضي دلوقتي 🟢`
        : `${user.nickname} حدّث حالته 💬`;

  notifyEveryoneExcept(
    {
      type: "status",
      title,
      body: [finalMessage, place ? `📍 ${place}` : null]
        .filter(Boolean)
        .join(" · "),
      href: "/radar",
    },
    user.id,
  );

  revalidatePath("/radar");
  revalidatePath("/hangouts");
  return { success: "حالتك اتحدّثت" };
}

export async function clearStatusAction(): Promise<ActionState> {
  const user = await requireUser();
  db.update(statuses)
    .set({ active: false })
    .where(and(eq(statuses.userId, user.id), eq(statuses.active, true)))
    .run();
  revalidatePath("/radar");
  revalidatePath("/hangouts");
  return { success: "شيلنا حالتك" };
}

export async function rsvpAction(
  hangoutId: string,
  status: "going" | "faks",
): Promise<ActionState> {
  const user = await requireUser();

  const hangout = db
    .select()
    .from(hangouts)
    .where(eq(hangouts.id, hangoutId))
    .get();
  if (!hangout || !hangout.active) return { error: "الخروجة مش موجودة" };

  const existing = db
    .select()
    .from(hangoutRsvps)
    .where(
      and(
        eq(hangoutRsvps.hangoutId, hangoutId),
        eq(hangoutRsvps.userId, user.id),
      ),
    )
    .get();

  if (existing) {
    db.update(hangoutRsvps)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(hangoutRsvps.hangoutId, hangoutId),
          eq(hangoutRsvps.userId, user.id),
        ),
      )
      .run();
  } else {
    db.insert(hangoutRsvps)
      .values({ hangoutId, userId: user.id, status })
      .run();
  }

  revalidatePath("/radar");
  revalidatePath("/hangouts");
  return { success: status === "going" ? "تم التأكيد، نتقابل هناك" : "تمام، فكس" };
}

export async function saveHangoutAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = hangoutSchema.safeParse({
    title: formData.get("title"),
    place: formData.get("place") || undefined,
    startsAt: formData.get("startsAt"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { error: firstError(parsed.error) };

  const startsAt = fromLocalInputValue(parsed.data.startsAt);
  if (!startsAt) return { error: "الميعاد مش مظبوط" };

  const id = String(formData.get("id") ?? "");

  if (id) {
    const existing = db
      .select({ createdBy: hangouts.createdBy })
      .from(hangouts)
      .where(eq(hangouts.id, id))
      .get();
    if (!existing) return { error: "الخروجة مش موجودة" };
    if (user.role !== "admin" && existing.createdBy !== user.id) {
      return { error: "مش مسموحلك تعدّل الخروجة دي" };
    }

    db.update(hangouts)
      .set({
        title: parsed.data.title,
        place: parsed.data.place || null,
        startsAt,
        notes: parsed.data.notes || null,
      })
      .where(eq(hangouts.id, id))
      .run();
  } else {
    db.insert(hangouts)
      .values({
        title: parsed.data.title,
        place: parsed.data.place || null,
        startsAt,
        notes: parsed.data.notes || null,
        createdBy: user.id,
      })
      .run();

    notifyEveryoneExcept(
      {
        type: "hangout",
        title: `خروجة جديدة: ${parsed.data.title}`,
        body: parsed.data.place?.trim() || "ادخل شوف التفاصيل وسجّل حضورك",
        href: "/hangouts",
      },
      user.id,
    );
  }

  revalidatePath("/radar");
  revalidatePath("/hangouts");
  revalidatePath("/admin");
  return { success: id ? "الخروجة اتعدلت" : "الخروجة اتضافت" };
}

export async function deleteHangoutAction(
  hangoutId: string,
): Promise<ActionState> {
  const user = await requireUser();
  const existing = db
    .select({ createdBy: hangouts.createdBy })
    .from(hangouts)
    .where(eq(hangouts.id, hangoutId))
    .get();
  if (!existing) return { error: "الخروجة مش موجودة" };
  if (user.role !== "admin" && existing.createdBy !== user.id) {
    return { error: "مش مسموحلك تمسح الخروجة دي" };
  }
  db.update(hangouts)
    .set({ active: false })
    .where(eq(hangouts.id, hangoutId))
    .run();
  revalidatePath("/radar");
  revalidatePath("/hangouts");
  revalidatePath("/admin");
  return { success: "الخروجة اتلغت" };
}

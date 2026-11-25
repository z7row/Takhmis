"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  comments,
  notifications,
  posts,
  reactions,
  users,
} from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { REACTION_EMOJIS } from "@/lib/constants";
import {
  commentSchema,
  firstError,
  postBodySchema,
  type ActionState,
} from "@/lib/validation";
import { notifyEveryoneExcept } from "@/lib/notify";

export async function toggleReactionAction(
  postId: string,
  emoji: string,
): Promise<ActionState> {
  const user = await requireUser();

  if (!REACTION_EMOJIS.includes(emoji as (typeof REACTION_EMOJIS)[number])) {
    return { error: "ريأكشن غير معروف" };
  }

  const post = db.select().from(posts).where(eq(posts.id, postId)).get();
  if (!post || post.deleted) return { error: "المنشور مش موجود" };

  const existing = db
    .select()
    .from(reactions)
    .where(and(eq(reactions.postId, postId), eq(reactions.userId, user.id)))
    .get();

  if (existing) {
    if (existing.emoji === emoji) {
      db.delete(reactions).where(eq(reactions.id, existing.id)).run();
    } else {
      db.update(reactions)
        .set({ emoji })
        .where(eq(reactions.id, existing.id))
        .run();
    }
  } else {
    db.insert(reactions).values({ postId, userId: user.id, emoji }).run();

    if (post.userId && post.userId !== user.id) {
      db.insert(notifications)
        .values({
          userId: post.userId,
          type: "reaction",
          title: `${user.nickname} عمل ${emoji} على منشورك`,
          href: "/feed",
        })
        .run();
    }
  }

  revalidatePath("/feed");
  return { success: "تم" };
}

export async function addCommentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const postId = String(formData.get("postId") ?? "");

  const parsed = commentSchema.safeParse(String(formData.get("body") ?? ""));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const post = db.select().from(posts).where(eq(posts.id, postId)).get();
  if (!post || post.deleted) return { error: "المنشور مش موجود" };

  db.insert(comments)
    .values({ postId, userId: user.id, body: parsed.data })
    .run();

  if (post.userId && post.userId !== user.id) {
    db.insert(notifications)
      .values({
        userId: post.userId,
        type: "comment",
        title: `${user.nickname} علّق على منشورك`,
        body: parsed.data.slice(0, 90),
        href: "/feed",
      })
      .run();
  }

  revalidatePath("/feed");
  return { success: "تم" };
}

export async function deleteCommentAction(
  commentId: string,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "لازم تسجل دخول" };

  const comment = db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .get();

  if (!comment) return { error: "التعليق مش موجود" };
  if (comment.userId !== user.id && user.role !== "admin") {
    return { error: "مش مسموح" };
  }

  db.update(comments)
    .set({ deleted: true })
    .where(eq(comments.id, commentId))
    .run();

  revalidatePath("/feed");
  revalidatePath("/admin");
  return { success: "التعليق اتشال" };
}

export async function markNotificationsReadAction(): Promise<void> {
  const user = await requireUser();
  db.update(notifications)
    .set({ read: true })
    .where(
      and(eq(notifications.userId, user.id), eq(notifications.read, false)),
    )
    .run();
  revalidatePath("/", "layout");
}

export async function pingPostAuthorAction(postId: string): Promise<ActionState> {
  const user = await requireUser();
  const post = db
    .select({ userId: posts.userId })
    .from(posts)
    .where(eq(posts.id, postId))
    .get();
  if (!post?.userId) return { error: "مش موجود" };
  if (post.userId === user.id) return { error: "ده منشورك أنت 😄" };
  const author = db
    .select({ nickname: users.nickname })
    .from(users)
    .where(eq(users.id, post.userId))
    .get();
  db.insert(notifications)
    .values({
      userId: post.userId,
      type: "ping",
      title: `${user.nickname} بيحفّزك 😂`,
      body: "يلا ورّينا إثبات النهاردة!",
      href: "/feed",
    })
    .run();
  revalidatePath("/feed");
  return { success: `تم التحفيل على ${author?.nickname ?? "صاحبك"}` };
}


export async function createPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = postBodySchema.safeParse(String(formData.get("body") ?? ""));
  if (!parsed.success) return { error: firstError(parsed.error) };

  db.insert(posts)
    .values({
      userId: user.id,
      type: "post",
      body: parsed.data,
    })
    .run();

  notifyEveryoneExcept(
    {
      type: "post",
      title: `${user.nickname} نشر منشور جديد`,
      body: parsed.data.slice(0, 90),
      href: "/feed",
    },
    user.id,
  );

  revalidatePath("/feed");
  return { success: "المنشور اتنشر" };
}

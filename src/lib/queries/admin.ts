import "server-only";
import { and, count, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import {
  comments,
  hangouts,
  invites,
  posts,
  proofs,
  users,
  weeks,
} from "@/db/schema";
import { today } from "@/lib/dates";
import { getActiveWeek } from "@/lib/week";

export function getAdminData() {
  const allMembers = db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .all();

  const inviteRows = db
    .select({
      id: invites.id,
      code: invites.code,
      maxUses: invites.maxUses,
      uses: invites.uses,
      active: invites.active,
      note: invites.note,
      expiresAt: invites.expiresAt,
      createdAt: invites.createdAt,
      creator: users.nickname,
    })
    .from(invites)
    .leftJoin(users, eq(users.id, invites.createdBy))
    .orderBy(desc(invites.createdAt))
    .limit(30)
    .all();

  const weekRows = db
    .select({
      week: weeks,
      winnerName: users.nickname,
    })
    .from(weeks)
    .leftJoin(users, eq(users.id, weeks.winnerId))
    .orderBy(desc(weeks.createdAt))
    .limit(10)
    .all();

  const hangoutRows = db
    .select()
    .from(hangouts)
    .orderBy(desc(hangouts.startsAt))
    .limit(20)
    .all();

  const postRows = db
    .select({
      id: posts.id,
      type: posts.type,
      body: posts.body,
      imageUrl: posts.imageUrl,
      createdAt: posts.createdAt,
      deleted: posts.deleted,
      authorId: users.id,
      authorName: users.nickname,
      authorAvatar: users.avatarUrl,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.userId))
    .where(eq(posts.deleted, false))
    .orderBy(desc(posts.createdAt))
    .limit(30)
    .all();

  const commentRows = db
    .select({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
      postId: comments.postId,
      authorName: users.nickname,
      authorAvatar: users.avatarUrl,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(eq(comments.deleted, false))
    .orderBy(desc(comments.createdAt))
    .limit(20)
    .all();

  const todayProofs =
    db
      .select({ value: count() })
      .from(proofs)
      .where(eq(proofs.day, today()))
      .get()?.value ?? 0;

  const totalPosts =
    db
      .select({ value: count() })
      .from(posts)
      .where(eq(posts.deleted, false))
      .get()?.value ?? 0;

  const totalComments =
    db
      .select({ value: count() })
      .from(comments)
      .where(eq(comments.deleted, false))
      .get()?.value ?? 0;

  const activeMembers = allMembers.filter((m) => !m.disabled).length;
  const activeWeek = getActiveWeek();

  return {
    members: allMembers,
    invites: inviteRows,
    weeks: weekRows,
    hangouts: hangoutRows,
    posts: postRows,
    comments: commentRows,
    activeWeek,
    stats: {
      members: allMembers.length,
      activeMembers,
      todayProofs,
      totalPosts,
      totalComments,
      invitesActive: inviteRows.filter((i) => i.active).length,
    },
  };
}

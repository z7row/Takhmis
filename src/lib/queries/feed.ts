import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { comments, habits, posts, proofs, reactions, users } from "@/db/schema";
import { ensureDailyRollover } from "@/lib/rollover";

export type FeedPerson = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  title: string;
  titleEmoji: string;
  titleTone: "positive" | "neutral" | "negative";
};

export type FeedComment = {
  id: string;
  body: string;
  createdAt: number;
  author: FeedPerson;
};

export type FeedPost = {
  id: string;
  type: "proof" | "slack" | "weekly" | "system" | "post";
  body: string | null;
  imageUrl: string | null;
  createdAt: number;
  day: string | null;
  author: FeedPerson | null;
  habit: { title: string; emoji: string } | null;
  proofPoints: number | null;
  reactions: { emoji: string; count: number }[];
  myReaction: string | null;
  comments: FeedComment[];
};

export type FeedPage = {
  posts: FeedPost[];
  hasMore: boolean;
  nextPage: number;
};

const FEED_PAGE_SIZE = 8;

export function getFeedPosts(
  viewerId: string,
  page = 0,
  pageSize = FEED_PAGE_SIZE,
): FeedPage {
  ensureDailyRollover();

  const rows = db
    .select({
      id: posts.id,
      type: posts.type,
      body: posts.body,
      imageUrl: posts.imageUrl,
      createdAt: posts.createdAt,
      day: posts.day,
      authorId: users.id,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl,
      title: users.title,
      titleEmoji: users.titleEmoji,
      titleTone: users.titleTone,
      habitTitle: habits.title,
      habitEmoji: habits.emoji,
      points: proofs.points,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.userId))
    .leftJoin(habits, eq(habits.id, posts.habitId))
    .leftJoin(proofs, eq(proofs.id, posts.proofId))
    .where(eq(posts.deleted, false))
    .orderBy(desc(posts.createdAt))
    .limit(pageSize + 1)
    .offset(page * pageSize)
    .all();

  const hasMore = rows.length > pageSize;
  const sliced = hasMore ? rows.slice(0, pageSize) : rows;
  const postIds = sliced.map((r) => r.id);

  const allReactions = postIds.length
    ? db
        .select({
          postId: reactions.postId,
          emoji: reactions.emoji,
          userId: reactions.userId,
        })
        .from(reactions)
        .where(inArray(reactions.postId, postIds))
        .all()
    : [];

  const allComments = postIds.length
    ? db
        .select({
          id: comments.id,
          postId: comments.postId,
          body: comments.body,
          createdAt: comments.createdAt,
          authorId: users.id,
          nickname: users.nickname,
          avatarUrl: users.avatarUrl,
          title: users.title,
          titleEmoji: users.titleEmoji,
          titleTone: users.titleTone,
        })
        .from(comments)
        .innerJoin(users, eq(users.id, comments.userId))
        .where(
          and(inArray(comments.postId, postIds), eq(comments.deleted, false)),
        )
        .orderBy(comments.createdAt)
        .all()
    : [];

  const reactionsByPost = new Map<string, Map<string, number>>();
  const myReactionByPost = new Map<string, string>();
  for (const r of allReactions) {
    const map = reactionsByPost.get(r.postId) ?? new Map<string, number>();
    map.set(r.emoji, (map.get(r.emoji) ?? 0) + 1);
    reactionsByPost.set(r.postId, map);
    if (r.userId === viewerId) myReactionByPost.set(r.postId, r.emoji);
  }

  const commentsByPost = new Map<string, FeedComment[]>();
  for (const c of allComments) {
    const list = commentsByPost.get(c.postId) ?? [];
    list.push({
      id: c.id,
      body: c.body,
      createdAt: new Date(c.createdAt).getTime(),
      author: {
        id: c.authorId,
        nickname: c.nickname,
        avatarUrl: c.avatarUrl,
        title: c.title,
        titleEmoji: c.titleEmoji,
        titleTone: c.titleTone,
      },
    });
    commentsByPost.set(c.postId, list);
  }

  const feedPosts: FeedPost[] = sliced.map((row) => ({
    id: row.id,
    type: row.type,
    body: row.body,
    imageUrl: row.imageUrl,
    createdAt: new Date(row.createdAt).getTime(),
    day: row.day,
    author: row.authorId
      ? {
          id: row.authorId,
          nickname: row.nickname ?? "",
          avatarUrl: row.avatarUrl,
          title: row.title ?? "",
          titleEmoji: row.titleEmoji ?? "",
          titleTone: row.titleTone ?? "neutral",
        }
      : null,
    habit:
      row.habitTitle && row.habitEmoji
        ? { title: row.habitTitle, emoji: row.habitEmoji }
        : null,
    proofPoints: row.points,
    reactions: [...(reactionsByPost.get(row.id) ?? new Map()).entries()]
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count),
    myReaction: myReactionByPost.get(row.id) ?? null,
    comments: commentsByPost.get(row.id) ?? [],
  }));

  return { posts: feedPosts, hasMore, nextPage: page + 1 };
}

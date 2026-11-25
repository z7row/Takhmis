import type { User } from "@/db/schema";

export type PublicUser = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  role: "admin" | "member";
  title: string;
  titleEmoji: string;
  titleTone: "positive" | "neutral" | "negative";
  points: number;
  streak: number;
  longestStreak: number;
  jokers: number;
  wins: number;
};

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    role: user.role,
    title: user.title,
    titleEmoji: user.titleEmoji,
    titleTone: user.titleTone,
    points: user.points,
    streak: user.streak,
    longestStreak: user.longestStreak,
    jokers: user.jokers,
    wins: user.wins,
  };
}

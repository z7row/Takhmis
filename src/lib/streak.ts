import { diffDays } from "./dates";

export function nextStreakValue(
  currentStreak: number,
  lastStreakDay: string | null,
  day: string,
): { streak: number; changed: boolean; milestone: boolean } {
  if (lastStreakDay === day) {
    return { streak: currentStreak, changed: false, milestone: false };
  }

  let streak: number;
  if (currentStreak <= 0) {
    streak = 1;
  } else if (lastStreakDay && diffDays(day, lastStreakDay) === 1) {
    streak = currentStreak + 1;
  } else {
    streak = 1;
  }

  return {
    streak,
    changed: true,
    milestone: streak > 0 && streak % 5 === 0,
  };
}

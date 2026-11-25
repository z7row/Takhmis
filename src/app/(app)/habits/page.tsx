import type { Metadata } from "next";
import { Flame, Shield, Target, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMyHabits, getWeekStanding, getHabitActivity, getLevel } from "@/lib/queries/habits";
import { HabitsManager } from "@/components/habits/habits-manager";
import { ActivityChart } from "@/components/habits/activity-chart";
import { formatNumber } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "العادات" };

export default async function HabitsPage() {
  const user = await requireUser();
  const habits = getMyHabits(user.id);
  const standing = getWeekStanding(user.id);
  const activity = getHabitActivity(user.id, 14);
  const level = getLevel(user.points);

  const stats = [
    { icon: Flame, label: "الاستريك", value: `${formatNumber(user.streak)} يوم` },
    { icon: Target, label: "النقاط", value: formatNumber(user.points) },
    { icon: Trophy, label: "الترتيب", value: standing.rank ? `#${standing.rank}` : "—" },
    { icon: Shield, label: "المستوى", value: `Lv ${level.level}` },
  ];

  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <HabitsManager initialHabits={habits.map((h) => ({ id: h.id, title: h.title, emoji: h.emoji }))} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-[6px] border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{s.label}</p>
                    <p className="num mt-2 text-[32px] font-normal leading-none text-primary">{s.value}</p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-[4px] border border-border bg-background">
                    <Icon className="size-5 text-primary" />
                  </span>
                </div>
                {s.label === "المستوى" && (
                  <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-border">
                      <div className="h-full bg-primary" style={{ width: `${(level.current / level.next) * 100}%` }} />
                    </div>
                    <p className="mt-1 font-[family-name:var(--font-mono)] text-[10px] tracking-[0.04em] text-muted-foreground">
                      {level.current}/{level.next} للنقطة اللي بعدها
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <ActivityChart days={activity} />
    </div>
  );
}

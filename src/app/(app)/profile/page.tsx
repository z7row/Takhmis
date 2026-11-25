import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Crown,
  Flame,
  LogOut,
  Medal,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getProfileData } from "@/lib/queries/profile";
import { toPublicUser } from "@/lib/user";
import { UserAvatar } from "@/components/user-avatar";
import { TitleBadge } from "@/components/title-badge";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { EditHabitsDialog } from "@/components/profile/edit-habits-dialog";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { InstallPwa } from "@/components/pwa/install-pwa";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { formatShortDay, weekLabel, formatNumber } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "البروفايل",
};

export default async function ProfilePage() {
  const user = await requireUser();
  const viewer = toPublicUser(user);
  const data = getProfileData(user.id);

  if (!data.user) redirect("/login");

  const stats = [
    { label: "نقاط الأسبوع", value: data.user.points, icon: Sparkles },
    { label: "مجموع النقاط", value: data.user.lifetimePoints, icon: Zap },
    { label: "الستريك", value: data.user.streak, icon: Flame },
    { label: "أطول ستريك", value: data.user.longestStreak, icon: Trophy },
    { label: "جوكر", value: data.user.jokers, icon: Shield, emoji: "🃏" },
    { label: "فوز", value: data.user.wins, icon: Crown },
  ];

  const maxDay = Math.max(...data.days.map((d) => d.count), 1);
  const streakRemainder = data.user.streak % 5;
  const toNextJoker = streakRemainder === 0 ? 5 : 5 - streakRemainder;

  return (
    <div className="space-y-4">
      <section className="surface rounded-[10px] p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start gap-3">
            <UserAvatar
              user={data.user}
              className="size-16 border border-border sm:size-[72px]"
              fallbackClassName="text-xl"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold leading-tight sm:text-2xl">
                  {data.user.nickname}
                </h1>
                {data.user.role === "admin" && (
                  <span className="rounded-xl border border-border bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <TitleBadge
                  title={data.user.title}
                  emoji={data.user.titleEmoji}
                  tone={data.user.titleTone}
                />
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                  <CalendarDays className="size-3.5" />
                  عضو من {formatShortDay(data.user.joinDay)}
                </span>
                {data.rank && (
                  <span className="flex items-center gap-1 rounded-xl border border-border bg-accent/10 px-1.5 py-0.5 text-[11px] text-primary/70">
                    <Medal className="size-3.5" />#{data.rank} من {data.membersCount}
                  </span>
                )}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-primary/70">
                <Trophy className="size-3.5 text-primary" />
                {data.week.reward}
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:ms-auto">
              <EditProfileDialog user={viewer} />
              <EditHabitsDialog
                habits={data.habits.map((h) => ({
                  id: h.id,
                  title: h.title,
                  emoji: h.emoji,
                }))}
              />
              <ChangePasswordDialog />
            </div>
          </div>

          <div className="border-t border-border/60 pt-3">
            <div className="grid grid-cols-3 gap-x-3 gap-y-3 sm:grid-cols-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="min-w-0">
                    <div className="flex items-center gap-1.5 text-muted-foreground/70">
                      <Icon className="size-3.5" />
                      <span className="truncate text-[11px]">{stat.label}</span>
                    </div>
                    <p className="num mt-1 text-lg font-bold leading-none text-foreground">
                      {stat.emoji ? `${stat.emoji} ` : ""}
                      {formatNumber(stat.value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0 space-y-4">
          <section className="surface rounded-[10px] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-1.5 text-sm font-bold">
                <CalendarDays className="size-4 text-primary" />
                نشاطك آخر ١٤ يوم
              </h2>
              <span className="text-[11px] text-muted-foreground/70">
                {data.days.filter((d) => d.count > 0).length} يوم نشط
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {data.days.map((day) => {
                const intensity =
                  day.count === 0 ? 0 : Math.min(0.18 + day.count / maxDay, 1);
                return (
                  <div key={day.day} className="text-center">
                    <div
                      className={cn(
                        "grid aspect-square place-items-center rounded-[4px] border text-[10px] font-semibold num",
                        day.count > 0
                          ? "border-border text-foreground"
                          : "border-border/60 text-muted-foreground/40",
                      )}
                      style={
                        day.count > 0
                          ? {
                              backgroundColor: `color-mix(in oklab, var(--primary) ${Math.round(
                                intensity * 22,
                              )}%, var(--card))`,
                            }
                          : { backgroundColor: "var(--card)" }
                      }
                      title={`${formatShortDay(day.day)} — ${day.count} إثبات`}
                    >
                      {day.count > 0 ? day.count : ""}
                    </div>
                    <p className="mt-1 truncate text-[10px] text-muted-foreground/70">
                      {formatShortDay(day.day)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="surface rounded-[10px] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-1.5 text-sm font-bold">
                <Trophy className="size-4 text-primary" />
                سجل الأسابيع
              </h2>
              <span className="text-[11px] text-muted-foreground/70">
                {data.history.length} أسبوع
              </span>
            </div>
            {data.history.length === 0 ? (
              <p className="py-6 text-center text-[12px] text-muted-foreground/70">
                أول أسبوع ليك لسه بيبدأ — كمّله وهتلاقي اسمك هنا.
              </p>
            ) : (
              <div className="divide-y divide-border/60">
                {data.history.map((week) => (
                  <div
                    key={week.id}
                    className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-[4px] border border-border",
                        week.won
                          ? "bg-accent/15 text-primary"
                          : "bg-background text-muted-foreground/70",
                      )}
                    >
                      {week.won ? <Crown className="size-4" /> : <Trophy className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-semibold">
                        {weekLabel(week.startDay, week.endDay)}
                        {week.won && (
                          <span className="ms-1.5 rounded-xl bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            كسبت
                          </span>
                        )}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground/70">
                        {week.reward}
                      </p>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="num text-[12px] font-bold text-primary">
                        {formatNumber(week.points)}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70">
                        مركز #{week.rank}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {data.gallery.length > 0 && (
            <section className="surface rounded-[10px] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-1.5 text-sm font-bold">
                  <Sparkles className="size-4 text-primary" />
                  آخر إثباتاتك
                </h2>
                <span className="text-[11px] text-muted-foreground/70">
                  {formatNumber(data.totals.proofsCount)} إثبات إجمالي
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {data.gallery.map((proof) => (
                  <div
                    key={proof.id}
                    className="relative aspect-square overflow-hidden rounded-[4px] border border-border bg-background"
                  >
                    {proof.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={proof.imageUrl}
                        alt={proof.habitTitle}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center bg-card text-[11px] text-muted-foreground">بدون صورة</div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 border-t border-border/60 bg-card/95 px-1.5 py-1">
                      <p className="truncate text-[10px] font-medium text-foreground">
                        {proof.habitEmoji} {proof.habitTitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-4">
          <section className="surface rounded-[10px] p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-bold">
              <Medal className="size-4 text-primary" />
              إنجازاتك
            </h2>
            {data.achievements.length === 0 ? (
              <p className="mt-2 text-[12px] leading-5 text-muted-foreground/70">
                لسه مفيش إنجازات — أول إثبات بيفتح أول ميدالية.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {data.achievements.map((achievement) => (
                  <span
                    key={achievement.key}
                    className="flex items-center gap-1 rounded-xl border border-border bg-accent/10 px-2 py-1 text-[11px] font-medium text-foreground"
                  >
                    {achievement.emoji}
                    {achievement.label}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 border-t border-border/60 pt-3">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground/70">
                <span>الجوكر الجاي</span>
                <span className="num text-primary/70">{toNextJoker} أيام</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/60">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${streakRemainder * 20}%` }}
                />
              </div>
            </div>
          </section>

          <section className="surface rounded-[10px] p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-bold">
              <Target className="size-4 text-primary" />
              عاداتك
            </h2>
            <div className="mt-3 divide-y divide-border/60">
              {data.habits.length === 0 ? (
                <p className="text-[12px] text-muted-foreground/70">
                  لسه مختارتش عادات — اضغط «تعديل العادات» فوق.
                </p>
              ) : (
                data.habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-2 py-2 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm">{habit.emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
                      {habit.title}
                    </span>
                    {habit.proof && (
                      <span className="rounded-xl bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        النهاردة
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="surface space-y-3 rounded-[10px] p-4">
            <div className="flex items-start gap-2 text-[11px] leading-5 text-muted-foreground/70">
              <Shield className="mt-0.5 size-4 shrink-0 text-primary/70" />
              <p>الصور بترفع على سيرفر الشلة الخاص. متشاركهاش برّه التطبيق.</p>
            </div>
            <InstallPwa />
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="outline"
                className="h-9 w-full gap-1.5 rounded-[4px] border-accent/40 bg-accent/10 text-[12px] text-foreground hover:bg-accent/20 hover:text-foreground"
              >
                <LogOut className="size-4" />
                تسجيل الخروج
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

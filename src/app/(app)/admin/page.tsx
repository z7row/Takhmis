import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  Flame,
  Gift,
  Inbox,
  Layers3,
  Link2,
  MessageCircle,
  ShieldCheck,
  Ticket,
  Trash2,
  Trophy,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminData } from "@/lib/queries/admin";
import { getLeaderboard } from "@/lib/queries/habits";
import { weekLabel, formatShortDay, formatDateTime, formatNumber } from "@/lib/dates";
import { UserAvatar } from "@/components/user-avatar";
import { TitleBadge } from "@/components/title-badge";
import { TimeAgo } from "@/components/time-ago";
import { InviteCreateDialog } from "@/components/admin/invite-create-dialog";
import { InviteRowActions } from "@/components/admin/invite-row-actions";
import { MemberEditDialog } from "@/components/admin/member-edit-dialog";
import { MemberDeleteButton } from "@/components/admin/member-delete-button";
import { WeekControls } from "@/components/admin/week-controls";
import { BroadcastDialog } from "@/components/admin/broadcast-dialog";
import {
  AdminDeleteCommentButton,
  AdminDeletePostButton,
} from "@/components/admin/content-actions";
import { HangoutDialog } from "@/components/radar/hangout-dialog";
import { HangoutAdminActions } from "@/components/radar/hangout-admin-actions";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لوحة الأدمن",
};

const TABS = [
  { key: "overview", label: "نظرة عامة", icon: Layers3 },
  { key: "members", label: "الأعضاء", icon: Users },
  { key: "invites", label: "الدعوات", icon: Ticket },
  { key: "week", label: "الأسبوع", icon: Trophy },
  { key: "hangouts", label: "الخروجات", icon: CalendarDays },
  { key: "content", label: "المحتوى", icon: ClipboardList },
] as const;

const POST_TYPE_LABEL: Record<string, string> = {
  proof: "إثبات",
  slack: "تقصير",
  weekly: "نتيجة أسبوع",
  system: "نظام",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const activeTab = TABS.some((t) => t.key === params.tab)
    ? (params.tab as (typeof TABS)[number]["key"])
    : "overview";

  const data = getAdminData();
  const leaderboard = getLeaderboard(admin.id);
  const top = leaderboard[0] ?? null;

  const stats = [
    { label: "الأعضاء", value: data.stats.activeMembers, icon: Users, hint: `${data.stats.members} إجمالي` },
    { label: "إثباتات النهاردة", value: data.stats.todayProofs, icon: Camera },
    { label: "منشورات", value: data.stats.totalPosts, icon: MessageCircle },
    { label: "تعليقات", value: data.stats.totalComments, icon: Inbox },
    {
      label: "دعوات شغالة",
      value: data.stats.invitesActive,
      icon: Link2,
    },
  ];

  return (
    <div className="space-y-4">
      <section className="surface rounded-[10px] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold leading-tight sm:text-2xl">لوحة الأدمن</h1>
              <span className="inline-flex items-center gap-1 rounded-xl border border-border bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-primary/70">
                <ShieldCheck className="size-3.5" />
                صلاحية كاملة
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-[12px] leading-5 text-muted-foreground/70">
              كل حاجة في الشلة تحت إيدك — الأعضاء، الدعوات، الأسبوع، الخروجات، والمحتوى.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <InviteCreateDialog />
            <BroadcastDialog />
          </div>
        </div>

        <div className="mt-4 border-t border-border/60 pt-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="min-w-0">
                  <div className="flex items-center gap-1.5 text-muted-foreground/70">
                    <Icon className="size-3.5" />
                    <span className="truncate text-[11px]">{stat.label}</span>
                    {stat.hint && (
                      <span className="truncate text-[10px] text-muted-foreground/70">· {stat.hint}</span>
                    )}
                  </div>
                  <p className="num mt-1 text-lg font-bold leading-none text-foreground">
                    {formatNumber(stat.value)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="hide-scrollbar -mx-1 overflow-x-auto border-b border-border/60 px-1">
        <div className="flex min-w-max items-center gap-4">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.key}
                href={`/admin?tab=${tab.key}`}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 border-b-2 px-1 pb-2.5 text-[12px] font-medium transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground/70 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="space-y-4">
            <section className="surface rounded-[10px] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-1.5 text-sm font-bold">
                  <Trophy className="size-4 text-primary" />
                  ترتيب الأسبوع الحالي
                </h2>
                <span className="text-[11px] text-muted-foreground/70">
                  {data.activeWeek
                    ? weekLabel(data.activeWeek.startDay, data.activeWeek.endDay)
                    : "مفيش أسبوع"}
                </span>
              </div>
              <div className="divide-y divide-border/60">
                {leaderboard.slice(0, 5).map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0"
                  >
                    <span className="num w-5 text-[11px] font-semibold text-muted-foreground/70">
                      {row.rank}
                    </span>
                    <UserAvatar user={row} className="size-7 border border-border" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-semibold">
                        {row.nickname}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground/70">
                        🔥 {row.streak} · 🃏 {row.jokers}
                      </p>
                    </div>
                    <span className="num text-[12px] font-bold text-primary">
                      {formatNumber(row.points)}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/admin?tab=week"
                className="mt-3 block border-t border-border/60 pt-3 text-[11px] font-medium text-primary/70 transition-colors hover:text-primary"
              >
                إدارة الأسبوع والمكافأة ←
              </Link>
            </section>

            <section className="surface rounded-[10px] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-1.5 text-sm font-bold">
                  <MessageCircle className="size-4 text-primary" />
                  آخر المنشورات
                </h2>
                <Link
                  href="/admin?tab=content"
                  className="text-[11px] text-muted-foreground/70 hover:text-primary"
                >
                  الكل ←
                </Link>
              </div>
              <div className="divide-y divide-border/60">
                {data.posts.slice(0, 5).map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-2 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground/70">
                        <span className="rounded-xl bg-accent/15 px-1.5 py-0.5 font-medium text-primary">
                          {POST_TYPE_LABEL[post.type] ?? post.type}
                        </span>
                        {post.authorName ?? "نظام"} ·{" "}
                        <TimeAgo date={new Date(post.createdAt).getTime()} />
                      </p>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-foreground/85">
                        {post.body ?? "—"}
                      </p>
                    </div>
                    <AdminDeletePostButton postId={post.id} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <WeekControls
              reward={data.activeWeek?.reward ?? "—"}
              weekLabel={
                data.activeWeek
                  ? weekLabel(data.activeWeek.startDay, data.activeWeek.endDay)
                  : "مفيش أسبوع شغال"
              }
              topName={top?.nickname ?? null}
              topPoints={top?.points ?? 0}
            />

            <section className="surface rounded-[10px] p-4">
              <h2 className="flex items-center gap-1.5 text-sm font-bold">
                <Ticket className="size-4 text-primary" />
                آخر الدعوات
              </h2>
              <div className="mt-3 divide-y divide-border/60">
                {data.invites.slice(0, 4).map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                  >
                    <span className="font-display text-[11px] tracking-wider text-foreground">
                      {invite.code}
                    </span>
                    <span className="num text-[11px] text-muted-foreground/70">
                      {invite.uses}/{invite.maxUses}
                    </span>
                    <span
                      className={cn(
                        "rounded-xl px-1.5 py-0.5 text-[10px] font-medium",
                        invite.active
                          ? "bg-accent/15 text-primary"
                          : "border border-border bg-transparent text-muted-foreground/70",
                      )}
                    >
                      {invite.active ? "شغال" : "موقوف"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <section className="surface overflow-hidden rounded-[10px]">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div>
              <h2 className="flex items-center gap-1.5 text-sm font-bold">
                <Users className="size-4 text-primary" />
                أعضاء الشلة ({formatNumber(data.members.length)})
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                عدّل النقاط، الألقاب، أو أوقف الحساب.
              </p>
            </div>
          </div>
          <div className="divide-y divide-border/60">
            {data.members.map((member) => (
              <div
                key={member.id}
                className={cn(
                  "flex flex-wrap items-center gap-2.5 px-4 py-2.5",
                  member.disabled && "opacity-55",
                )}
              >
                <UserAvatar user={member} className="size-9 border border-border" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-[12px] font-bold">
                      {member.nickname}
                    </span>
                    {member.role === "admin" && (
                      <span className="rounded-xl bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        ADMIN
                      </span>
                    )}
                    {member.disabled && (
                      <span className="rounded-xl border border-border bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-primary/70">
                        موقوف
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground/70">
                    <TitleBadge
                      title={member.title}
                      emoji={member.titleEmoji}
                      tone={member.titleTone}
                      size="xs"
                    />
                    <span className="num">🔥 {member.streak}</span>
                    <span className="num">🃏 {member.jokers}</span>
                    <span className="num">👑 {member.wins}</span>
                  </div>
                </div>
                <span className="num text-[13px] font-bold text-primary">
                  {formatNumber(member.points)}
                </span>
                <div className="flex items-center gap-0.5">
                  <MemberEditDialog member={member} />
                  {member.id !== admin.id && (
                    <MemberDeleteButton
                      memberId={member.id}
                      nickname={member.nickname}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "invites" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-1.5 text-sm font-bold">
                <Ticket className="size-4 text-primary" />
                أكواد الدعوة
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                {data.invites.length} كود · انسخ اللينك وابعته للعضو.
              </p>
            </div>
            <InviteCreateDialog />
          </div>

          <div className="surface overflow-hidden rounded-[10px]">
            <div className="divide-y divide-border/60">
              {data.invites.length === 0 ? (
                <p className="px-4 py-8 text-center text-[12px] text-muted-foreground/70">
                  مفيش أكواد لسه — ولّد أول كود وابدأ دعوة الشلة.
                </p>
              ) : (
                data.invites.map((invite) => (
                  <div key={invite.id} className="flex flex-wrap items-center gap-2.5 px-4 py-2.5">
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-[4px] border border-border",
                        invite.active
                          ? "bg-accent/10 text-primary"
                          : "bg-background text-muted-foreground/70",
                      )}
                    >
                      <Ticket className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-display text-[12px] font-semibold tracking-[0.08em]">
                          {invite.code}
                        </span>
                        <span
                          className={cn(
                            "rounded-xl px-1.5 py-0.5 text-[10px] font-medium",
                            invite.active
                              ? "bg-accent/15 text-primary"
                              : "border border-border bg-transparent text-muted-foreground/70",
                          )}
                        >
                          {invite.active ? "شغال" : "موقوف"}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
                        {invite.note ? `${invite.note} · ` : ""}
                        استُخدم {formatNumber(invite.uses)}/
                        {formatNumber(invite.maxUses)} ·{" "}
                        {invite.expiresAt
                          ? `ينتهي ${formatDateTime(new Date(invite.expiresAt).getTime())}`
                          : "بدون انتهاء"}
                      </p>
                    </div>
                    <InviteRowActions invite={invite} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "week" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <section className="surface overflow-hidden rounded-[10px]">
            <div className="border-b border-border/60 px-4 py-3">
              <h2 className="flex items-center gap-1.5 text-sm font-bold">
                <Trophy className="size-4 text-primary" />
                سجل الأسابيع
              </h2>
            </div>
            <div className="divide-y divide-border/60">
              {data.weeks.map(({ week, winnerName }) => (
                <div key={week.id} className="flex items-center gap-2.5 px-4 py-2.5">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-[4px] border border-border",
                      week.status === "active"
                        ? "bg-accent/10 text-primary"
                        : "bg-background text-muted-foreground/70",
                    )}
                  >
                    {week.status === "active" ? (
                      <Flame className="size-4" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold">
                      {weekLabel(week.startDay, week.endDay)}
                      <span
                        className={cn(
                          "ms-1.5 rounded-xl px-1.5 py-0.5 text-[10px] font-medium",
                          week.status === "active"
                            ? "bg-accent/15 text-primary"
                            : "border border-border bg-transparent text-muted-foreground/70",
                        )}
                      >
                        {week.status === "active" ? "شغال" : "مقفول"}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
                      {week.reward}
                      {winnerName ? ` · الفائز: ${winnerName}` : ""}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground/70">
                    {formatShortDay(week.startDay)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <WeekControls
            reward={data.activeWeek?.reward ?? "—"}
            weekLabel={
              data.activeWeek
                ? weekLabel(data.activeWeek.startDay, data.activeWeek.endDay)
                : "مفيش أسبوع شغال"
            }
            topName={top?.nickname ?? null}
            topPoints={top?.points ?? 0}
          />
        </div>
      )}

      {activeTab === "hangouts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-1.5 text-sm font-bold">
                <CalendarDays className="size-4 text-primary" />
                الخروجات
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                أضف، عدّل، أو الغِ خروجة — الشلة بتوصلها إشعارات.
              </p>
            </div>
            <HangoutDialog />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {data.hangouts.length === 0 ? (
              <p className="col-span-full rounded-[10px] border border-dashed border-border px-4 py-8 text-center text-[12px] text-muted-foreground/70">
                مفيش خروجات لسه — ضيف أول لمّة للشلة.
              </p>
            ) : (
              data.hangouts.map((hangout) => (
                <div
                  key={hangout.id}
                  className={cn(
                    "flex items-start gap-2.5 rounded-[10px] border border-border bg-card p-3.5",
                    !hangout.active && "opacity-60",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-[12px] font-bold">
                      {hangout.title}
                      {!hangout.active && (
                        <span className="rounded-xl border border-border bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-primary/70">
                          ملغية
                        </span>
                      )}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground/70">
                      <CalendarDays className="size-3" />
                      {formatDateTime(new Date(hangout.startsAt).getTime())}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
                      📍 {hangout.place ?? "بدون مكان"}
                    </p>
                  </div>
                  {hangout.active && (
                    <HangoutAdminActions
                      hangout={{
                        id: hangout.id,
                        title: hangout.title,
                        place: hangout.place,
                        notes: hangout.notes,
                        startsAt: new Date(hangout.startsAt).getTime(),
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "content" && (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <section className="surface overflow-hidden rounded-[10px]">
            <div className="border-b border-border/60 px-4 py-3">
              <h2 className="flex items-center gap-1.5 text-sm font-bold">
                <MessageCircle className="size-4 text-primary" />
                المنشورات ({formatNumber(data.posts.length)})
              </h2>
            </div>
            <div className="divide-y divide-border/60">
              {data.posts.map((post) => (
                <div key={post.id} className="flex items-start gap-2 px-3.5 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground/70">
                      <span className="rounded-xl bg-accent/15 px-1.5 py-0.5 font-medium text-primary">
                        {POST_TYPE_LABEL[post.type] ?? post.type}
                      </span>
                      {post.authorName ?? "نظام"}
                      <TimeAgo date={new Date(post.createdAt).getTime()} />
                    </p>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-foreground/85">
                      {post.body ?? "—"}
                    </p>
                  </div>
                  <AdminDeletePostButton postId={post.id} />
                </div>
              ))}
            </div>
          </section>

          <section className="surface overflow-hidden rounded-[10px]">
            <div className="border-b border-border/60 px-4 py-3">
              <h2 className="flex items-center gap-1.5 text-sm font-bold">
                <Inbox className="size-4 text-primary" />
                التعليقات ({formatNumber(data.comments.length)})
              </h2>
            </div>
            <div className="divide-y divide-border/60">
              {data.comments.length === 0 ? (
                <p className="px-4 py-8 text-center text-[12px] text-muted-foreground/70">
                  مفيش تعليقات لسه.
                </p>
              ) : (
                data.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start gap-2 px-3.5 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                        <UserRound className="size-3" />
                        {comment.authorName}
                        <TimeAgo
                          date={new Date(comment.createdAt).getTime()}
                        />
                      </p>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-foreground/85">
                        {comment.body}
                      </p>
                    </div>
                    <AdminDeleteCommentButton commentId={comment.id} />
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Bell,
  CheckCheck,
  Flame,
  Heart,
  MessageCircle,
  PartyPopper,
  Shield,
  Trophy,
  Layers3,
  Megaphone,
  UserPlus,
  Radar,
  Camera,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TimeAgo } from "@/components/time-ago";
import { markNotificationsReadAction } from "@/actions/social";
import type { NotificationItem } from "@/lib/queries/notifications";

const ICONS: Record<string, React.ElementType> = {
  reaction: Flame,
  comment: MessageCircle,
  proof: Camera,
  hangout: PartyPopper,
  status: Radar,
  week: Trophy,
  joker: Layers3,
  joker_used: Layers3,
  member: UserPlus,
  broadcast: Megaphone,
  full_day: Zap,
  streak: Flame,
  like: Heart,
  moderation: Shield,
  ping: Bell,
};

export function NotificationBell({
  notifications,
  unread,
}: {
  notifications: NotificationItem[];
  unread: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const markRead = () => {
    if (unread === 0) return;
    startTransition(async () => {
      await markNotificationsReadAction();
      router.refresh();
    });
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && markRead()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-10 rounded-full border border-border bg-card hover:bg-accent/10"
          aria-label={`الإشعارات${unread ? ` (${unread} غير مقروء)` : ""}`}
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -end-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(92vw,360px)] overflow-hidden rounded-[6px] border-border bg-card p-0"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
          <div>
            <p className="text-sm font-bold leading-none">الإشعارات</p>
            <p className="mt-1 text-[11px] text-muted-foreground/70">
              {unread > 0 ? `${unread} جديد` : "كل حاجة متقرّية"}
            </p>
          </div>
          {unread > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-primary/70">
              <CheckCheck className="size-3.5" />
              {pending ? "..." : "اتقريت"}
            </span>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <span className="mb-2 text-2xl">🦦</span>
              <p className="text-sm font-semibold">مفيش إشعارات لسه</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                أول ما الشلة تتحرك هتلاقي كل حاجة هنا
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const Icon = ICONS[item.type] ?? Bell;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.href) router.push(item.href);
                  }}
                  className={cn(
                    "flex w-full items-start gap-2.5 border-b border-border/60 px-3 py-2.5 text-start transition-colors last:border-b-0 hover:bg-accent/10",
                    !item.read && "bg-accent/10",
                  )}
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-border bg-background">
                    <Icon className="size-4 text-primary/70" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[12.5px] font-semibold">{item.title}</span>
                      {!item.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                    </span>
                    {item.body && (
                      <span className="mt-0.5 line-clamp-2 block text-[11px] leading-5 text-muted-foreground/70">
                        {item.body}
                      </span>
                    )}
                    <span className="mt-1 block text-[10px] text-muted-foreground/70">
                      <TimeAgo date={item.createdAt} />
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator className="bg-border/60" />
        <Link
          href="/radar"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-primary/70 transition-colors hover:bg-accent/10 hover:text-primary"
        >
          <Radar className="size-3.5" />
          روح للرادار وشوف الشلة
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

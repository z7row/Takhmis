"use client";

import Link from "next/link";
import { LogOut, Settings2, ShieldCheck, UserRound } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { NotificationBell } from "./notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/actions/auth";
import type { PublicUser } from "@/lib/user";
import type { NotificationItem } from "@/lib/queries/notifications";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

function rankMessage(rank: number | null) {
  if (rank === 1) return "عاش، حطيت عليهم كلهم!";
  if (rank === 2) return "قريب أوي، شد حيلك!";
  if (rank === 3) return "ماشي حلو، كمل!";
  if (rank && rank > 3) return "شد حيلك واطلع فوق!";
  return "يلا نبدأ ونثبت نفسنا!";
}

export function Topbar({
  user,
  notifications,
  unread,
  rank,
}: {
  user: PublicUser;
  notifications: NotificationItem[];
  unread: number;
  rank: number | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-[color:var(--bg)]/85 backdrop-blur-[12px]">
      <div className="mx-auto flex min-h-20 w-full max-w-[1200px] items-center gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-sans)] text-[16px] leading-8 text-foreground sm:text-[18px]">
            إيه الأخبار يا {user.nickname}، ترتيبك النهاردة{" "}
            <span className="num mx-1 inline-block align-middle text-[40px] font-normal leading-none text-primary sm:text-[48px]">
              #{rank ?? "—"}
            </span>
            <span className="text-muted-foreground">، {rankMessage(rank)}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell notifications={notifications} unread={unread} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus-ring rounded-full border border-border bg-card p-0.5" aria-label="قائمة البروفايل">
                <UserAvatar user={user} className="size-10 rounded-full" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px] rounded-[6px] border-border bg-popover p-1">
              <DropdownMenuLabel className="px-2 py-2">
                <span className="block text-sm font-semibold">{user.nickname}</span>
                <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">{user.titleEmoji} {user.title}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="rounded-[3px]" onSelect={() => router.push("/profile")}>
                <UserRound className="size-4" />
                البروفايل
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-[3px]" onSelect={() => router.push("/profile#settings")}>
                <Settings2 className="size-4" />
                الإعدادات
              </DropdownMenuItem>
              {user.role === "admin" && (
                <DropdownMenuItem className="rounded-[3px]" onSelect={() => router.push("/admin")}>
                  <ShieldCheck className="size-4" />
                  لوحة الأدمن
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onSelect={() => startTransition(() => logoutAction())}
                disabled={pending}
                className="rounded-xl text-destructive focus:bg-accent/10 focus:text-destructive"
              >
                <LogOut className="size-4" />
                {pending ? "بنخرج..." : "تسجيل الخروج"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Camera,
  ChevronUp,
  LogOut,
  Settings2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { UserAvatar } from "@/components/user-avatar";
import { TitleBadge } from "@/components/title-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import type { PublicUser } from "@/lib/user";
import { navFor } from "./nav-items";

export function Sidebar({ user }: { user: PublicUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navFor(user.role);
  const [pending, startTransition] = useTransition();

  return (
    <aside className="fixed inset-y-0 start-0 z-40 hidden w-[260px] flex-col border-e border-border bg-[var(--bg)] p-4 lg:flex">
      <div className="px-2 pb-4 pt-2">
        <Logo size="sm" />
      </div>

      <div className="mb-4 px-1">
        <Button asChild className="h-9 w-full justify-start gap-2 rounded-[4px] font-[family-name:var(--font-mono)] text-[12px] tracking-[0.04em]">
          <Link href="/habits">
            <Camera className="size-4" />
            وثّق عادة
            <span className="ms-auto text-[10px] text-primary-foreground/70">+10</span>
          </Link>
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <p className="mb-1 px-2 text-[10px] font-medium text-muted-foreground/70">تنقّل</p>
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-[4px] border px-2.5 py-2 font-[family-name:var(--font-mono)] text-[13px] tracking-[0.02em] transition-colors",
                active
                  ? "border-primary/25 bg-accent/15 text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.href === "/admin" && (
                <span className="ms-auto rounded bg-accent/20 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                  ADMIN
                </span>
              )}
            </Link>
          );
        })}

        <div className="mt-auto space-y-2 pt-3">
          <div className="rounded-[4px] border border-border bg-card px-3 py-2.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>الستريك</span>
              <span className="num text-foreground">{user.streak} يوم</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>جوكر</span>
              <span className="num text-foreground">{user.jokers}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2.5 rounded-[4px] border border-border bg-card p-2 text-start transition-colors hover:bg-accent/10">
                <UserAvatar user={user} className="size-8" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-[family-name:var(--font-mono)] text-[12px] tracking-[0.04em]">{user.nickname}</span>
                  <TitleBadge
                    title={user.title}
                    emoji={user.titleEmoji}
                    tone={user.titleTone}
                    size="xs"
                    className="mt-0.5"
                  />
                </span>
                <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-[232px] rounded-[4px] border-border bg-popover p-1"
            >
              <DropdownMenuLabel className="px-2 py-2">
                <span className="block text-sm font-semibold">{user.nickname}</span>
                <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                  {user.points} نقطة · {user.wins} فوز
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="rounded-xl" onSelect={() => router.push("/profile")}>
                <UserRound className="size-4" />
                البروفايل
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl" onSelect={() => router.push("/profile#settings")}>
                <Settings2 className="size-4" />
                الإعدادات
              </DropdownMenuItem>
              {user.role === "admin" && (
                <DropdownMenuItem className="rounded-xl" onSelect={() => router.push("/admin")}>
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
      </nav>
    </aside>
  );
}

"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { PageTransition } from "@/components/page-transition";
import type { PublicUser } from "@/lib/user";
import type { NotificationItem } from "@/lib/queries/notifications";

export function AppShell({
  user,
  notifications,
  unread,
  rank,
  children,
}: {
  user: PublicUser;
  notifications: NotificationItem[];
  unread: number;
  rank: number | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <Sidebar user={user} />
      <div className="lg:ps-[260px]">
        <Topbar user={user} notifications={notifications} unread={unread} rank={rank} />
        <main className="mx-auto w-full max-w-[1200px] px-4 pb-28 pt-6 sm:px-6 lg:px-6 lg:pb-16 lg:pt-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <MobileNav user={user} />
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { PublicUser } from "@/lib/user";
import { navFor } from "./nav-items";

export function MobileNav({ user }: { user: PublicUser }) {
  const pathname = usePathname();
  const items = navFor(user.role);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="التنقل الرئيسي"
    >
      <div
        className="grid items-center"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors",
                active
                  ? "bg-accent/15 text-primary"
                  : "text-muted-foreground/70 hover:bg-accent/10 hover:text-foreground",
              )}
            >
              <Icon className="size-[18px]" />
              <span>{item.short}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

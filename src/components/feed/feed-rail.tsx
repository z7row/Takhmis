import { Trophy } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/dates";
import type { LeaderRow } from "@/lib/queries/habits";

export function FeedRail({ leaderboard }: { leaderboard: LeaderRow[] }) {
  return (
    <section className="rounded-[6px] border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Trophy className="size-4 text-primary" />
        <p className="font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.08em] text-primary">الترتيب</p>
      </div>
      <div className="divide-y divide-border/60">
        {leaderboard.map((row) => (
          <div
            key={row.id}
            className={cn("flex items-center gap-3 px-4 py-3", row.isViewer && "bg-accent/10")}
          >
            <span className="num w-6 shrink-0 text-[13px] font-bold text-primary">#{row.rank}</span>
            <UserAvatar user={row} className="size-8 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-[family-name:var(--font-sans)] text-[15px] font-medium">{row.nickname}</p>
              <p className="truncate text-[11px] text-muted-foreground">{row.title}</p>
            </div>
            <span className="num shrink-0 text-[12px] text-muted-foreground">{formatNumber(row.points)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

import { Crown, Flame, Shield } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { TitleBadge } from "@/components/title-badge";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/dates";
import type { LeaderRow } from "@/lib/queries/habits";

export function LeaderboardTable({ rows }: { rows: LeaderRow[] }) {
  return (
    <div className="overflow-hidden rounded-[4px] border border-border">
      <div className="hidden grid-cols-[48px_minmax(0,1fr)_88px_72px_72px] items-center gap-2 border-b border-border/60 bg-background px-3 py-2 text-[10px] font-medium text-muted-foreground/70 sm:grid">
        <span>#</span>
        <span>العضو</span>
        <span className="text-center">النقاط</span>
        <span className="text-center">ستريك</span>
        <span className="text-center">جوكر</span>
      </div>

      <div className="divide-y divide-border/60">
        {rows.map((row) => {
          const isTop = row.rank <= 3;
          return (
            <div
              key={row.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 sm:grid sm:grid-cols-[48px_minmax(0,1fr)_88px_72px_72px] sm:gap-2",
                row.isViewer ? "bg-primary/10" : "bg-card hover:bg-accent/10",
              )}
            >
              <span className="flex shrink-0 items-center gap-1">
                <span
                  className={cn(
                    "num grid size-6 place-items-center rounded-xl border text-[11px] font-semibold",
                    isTop
                      ? "border-primary/35 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground/70",
                  )}
                >
                  {row.rank}
                </span>
              </span>

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="relative shrink-0">
                  <UserAvatar user={row} className="size-8" ring={row.rank === 1} />
                  {row.online && (
                    <span className="absolute -bottom-0.5 -end-0.5 size-2.5 rounded-full border-2 border-card bg-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[12px] font-semibold text-foreground">
                      {row.nickname}
                    </span>
                    {row.rank === 1 && <Crown className="size-3 shrink-0 text-primary" />}
                    {row.isViewer && (
                      <span className="shrink-0 rounded-xl border border-primary/30 bg-primary/10 px-1 text-[10px] font-medium text-primary">
                        أنت
                      </span>
                    )}
                  </div>
                  <TitleBadge
                    title={row.title}
                    emoji={row.titleEmoji}
                    tone={row.titleTone}
                    size="xs"
                    className="mt-0.5"
                  />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 sm:contents">
                <div className="text-center">
                  <span className="num block text-[13px] font-semibold text-primary">
                    {formatNumber(row.points)}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 sm:hidden">نقطة</span>
                </div>
                <div className="hidden items-center justify-center gap-1 text-[11px] text-muted-foreground/70 sm:flex">
                  <Flame className="size-3 text-primary/70" />
                  <span className="num font-medium">{row.streak}</span>
                </div>
                <div className="hidden items-center justify-center gap-1 text-[11px] text-muted-foreground/70 sm:flex">
                  <Shield className="size-3 text-primary/70" />
                  <span className="num font-medium">{row.jokers}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 sm:hidden">
                  <Flame className="size-3 text-primary/70" />
                  <span className="num">{row.streak}</span>
                  <Shield className="ms-1 size-3 text-primary/70" />
                  <span className="num">{row.jokers}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

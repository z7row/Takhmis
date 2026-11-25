import { Camera, Check, Clock } from "lucide-react";
import { QuickProofDialog } from "@/components/feed/quick-proof-dialog";
import { Button } from "@/components/ui/button";
import { TimeAgo } from "@/components/time-ago";
import { cn } from "@/lib/utils";
import type { ArenaHabit } from "@/lib/queries/habits";

export function HabitCard({
  habit,
  habits,
  index,
}: {
  habit: ArenaHabit;
  habits: ArenaHabit[];
  index: number;
}) {
  const done = Boolean(habit.proof);

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-[10px] border bg-background",
        done ? "border-primary/35" : "border-border",
      )}
    >
      <div className="flex items-start gap-3 p-3.5 pb-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-[4px] border text-lg",
            done
              ? "border-primary/35 bg-primary/10"
              : "border-border bg-card",
          )}
        >
          {habit.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[13px] font-semibold text-foreground">{habit.title}</h3>
            {done && (
              <span className="flex shrink-0 items-center gap-0.5 rounded-xl border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                <Check className="size-3" /> تم
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">
            {done ? (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                <TimeAgo date={habit.proof!.createdAt} />
                <span className="text-muted-foreground/40">·</span>
                <span className="num text-primary/70">+{habit.proof!.points}</span>
              </span>
            ) : (
              `عادة ${index + 1} — مستنية إثبات النهاردة`
            )}
          </p>
        </div>
      </div>

      {done && habit.proof ? (
        <div className="space-y-2 px-3.5 pb-3.5">
          {habit.proof.imageUrl ? (
            <div className="overflow-hidden rounded-[4px] border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={habit.proof.imageUrl}
                alt={habit.title}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          ) : (
            <div className="rounded-[4px] border border-border bg-card px-2.5 py-2 text-[11px] text-muted-foreground">متوثقة بدون صورة</div>
          )}
          {habit.proof.caption && (
            <p className="rounded-[4px] border border-border bg-card px-2.5 py-1.5 text-[11px] leading-5 text-foreground/85">
              “{habit.proof.caption}”
            </p>
          )}
        </div>
      ) : (
        <div className="mt-auto px-3.5 pb-3.5">
          <QuickProofDialog
            habits={habits}
            defaultHabitId={habit.id}
            trigger={
              <Button className="h-9 w-full gap-1.5 rounded-[4px] text-[12px] font-semibold">
                <Camera className="size-3.5" />
                وثّق {habit.title}
              </Button>
            }
          />
        </div>
      )}
    </article>
  );
}

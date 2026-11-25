"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CalendarDays, Check, Loader2, MapPin, NotebookPen, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rsvpAction } from "@/actions/radar";
import { formatDateTime, countdown } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { HangoutItem } from "@/lib/queries/radar";
import { toast } from "sonner";

export function HangoutCard({
  hangout,
  past = false,
  adminActions,
}: {
  hangout: HangoutItem;
  past?: boolean;
  adminActions?: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const rsvp = (status: "going" | "faks") => {
    if (pending) return;
    startTransition(async () => {
      const result = await rsvpAction(hangout.id, status);
      if (result?.error) toast.error(result.error);
      else toast.success(result?.success ?? "تم");
      router.refresh();
    });
  };

  const going = hangout.myStatus === "going";
  const faks = hangout.myStatus === "faks";

  return (
    <article
      className={cn(
        "rounded-[10px] border bg-background p-4",
        past ? "border-border opacity-75" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-[13px] font-semibold leading-5 text-foreground">{hangout.title}</h3>
            {past && (
              <span className="rounded-xl border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground/70">
                خلصت
              </span>
            )}
          </div>
          <div className="mt-2 space-y-1 text-[11px] text-muted-foreground/70">
            <p className="flex flex-wrap items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              <span>{formatDateTime(hangout.startsAt)}</span>
              {!past && (
                <span className="rounded-xl border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  {countdown(hangout.startsAt)}
                </span>
              )}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {hangout.place ?? "المكان لسه بيتظبط"}
            </p>
            {hangout.notes && (
              <p className="flex items-start gap-1.5 leading-5">
                <NotebookPen className="mt-0.5 size-3.5 shrink-0" />
                {hangout.notes}
              </p>
            )}
          </div>
        </div>
        {adminActions}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex -space-x-1.5 space-x-reverse">
            {hangout.going.slice(0, 5).map((person) =>
              person.avatarUrl ? (
                <Image
                  key={person.id}
                  src={person.avatarUrl}
                  alt={person.nickname}
                  width={24}
                  height={24}
                  className="size-6 rounded-full border-2 border-background object-cover"
                />
              ) : (
                <span
                  key={person.id}
                  className="grid size-6 place-items-center rounded-full border-2 border-background bg-card text-[9px] font-semibold text-foreground"
                >
                  {person.nickname.slice(0, 1)}
                </span>
              ),
            )}
          </div>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
            <Users className="size-3.5" />
            {hangout.going.length} جاي
          </span>
          {hangout.faks.length > 0 && (
            <span className="text-[11px] text-muted-foreground/60">· {hangout.faks.length} فكس</span>
          )}
        </div>

        {!past && (
          <div className="ms-auto flex items-center gap-1.5">
            <Button
              size="sm"
              variant={going ? "default" : "outline"}
              onClick={() => rsvp("going")}
              disabled={pending}
              className={cn(
                "h-8 gap-1 rounded-[4px] px-2.5 text-[11px] font-semibold",
                !going && "border-border bg-background text-muted-foreground/70 hover:bg-accent/10 hover:text-foreground",
              )}
            >
              {pending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
              {going ? "أنت جاي" : "جاي"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => rsvp("faks")}
              disabled={pending}
              className={cn(
                "h-8 gap-1 rounded-[4px] px-2.5 text-[11px] font-semibold",
                faks
                  ? "border-primary/35 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground/70 hover:bg-accent/10 hover:text-foreground",
              )}
            >
              <X className="size-3" />
              فكس
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}

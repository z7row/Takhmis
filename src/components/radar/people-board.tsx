import { Clock, MapPin } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { TitleBadge } from "@/components/title-badge";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { countdown } from "@/lib/dates";
import type { RadarPerson } from "@/lib/queries/radar";

const KIND_META: Record<string, { label: string; card: string; pill: string }> = {
  need_company: { label: "محتاج شركة", card: "border-primary/35 bg-primary/5", pill: "border-primary/35 bg-primary/10 text-primary" },
  free: { label: "فاضي", card: "border-border bg-card", pill: "border-border bg-background text-foreground" },
  busy: { label: "مشغول", card: "border-border bg-card", pill: "border-border bg-background text-muted-foreground" },
  custom: { label: "حالة", card: "border-border bg-card", pill: "border-border bg-background text-muted-foreground" },
};

export function PeopleBoard({ people }: { people: RadarPerson[] }) {
  if (people.length === 0) {
    return <EmptyState emoji="👥" title="مفيش حد" description="لسه مفيش أعضاء." />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {people.map((p) => {
        const meta = p.status ? KIND_META[p.status.kind] ?? KIND_META.custom : null;
        return (
          <article key={p.id} className={cn("rounded-[6px] border p-4", meta?.card ?? "border-border bg-card/60")}>
            <div className="flex items-start gap-3">
              <UserAvatar user={{ nickname: p.nickname, avatarUrl: p.avatarUrl }} className="size-11 rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-[15px] font-semibold">{p.nickname}</span>
                  <TitleBadge title={p.title} emoji={p.titleEmoji} tone="neutral" size="xs" />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", meta?.pill ?? "border-border bg-background text-muted-foreground")}>
                    {p.status ? meta?.label : "مفيش حالة"}
                  </span>
                  {p.status?.expiresAt ? (
                    <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.04em] text-muted-foreground">
                      فاضل {countdown(p.status.expiresAt).replace(/^بعد\s*/, "")}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {p.status?.message ? <p className="mt-3 text-[13px] leading-6 text-foreground/85">{p.status.message}</p> : null}
            {p.status?.place ? (
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground"><MapPin className="size-3.5" />{p.status.place}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

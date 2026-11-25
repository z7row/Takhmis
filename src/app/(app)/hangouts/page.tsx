import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getHangoutsData } from "@/lib/queries/radar";
import { HangoutCard } from "@/components/radar/hangout-card";
import { HangoutDialog } from "@/components/radar/hangout-dialog";
import { HangoutAdminActions } from "@/components/radar/hangout-admin-actions";
import { EmptyState } from "@/components/empty-state";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "الخروجات" };

export default async function HangoutsPage() {
  const user = await requireUser();
  const data = getHangoutsData(user.id);
  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-4">
      <section className="rounded-[6px] border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] text-primary">الخروجات</p>
            <h1 className="mt-1 text-[32px] font-bold leading-none">خطط الشلة</h1>
            <p className="mt-2 text-[13px] text-muted-foreground">كل الخروجات في مكان واحد — انضم، فاكس، أو اقترح خروجة جديدة.</p>
          </div>
          <HangoutDialog />
        </div>

        <div className="mt-4 space-y-3">
          {data.upcoming.length === 0 ? (
            <EmptyState emoji="📅" title="مفيش خروجات جاية" description="اعمل أول خروجة للشلة." />
          ) : (
            data.upcoming.map((h) => (
              <HangoutCard
                key={h.id}
                hangout={h}
                adminActions={(isAdmin || h.createdBy === user.id) ? <HangoutAdminActions hangout={{ id: h.id, title: h.title, place: h.place, notes: h.notes, startsAt: h.startsAt }} /> : undefined}
              />
            ))
          )}
        </div>
      </section>

      {data.past.length > 0 && (
        <section className="rounded-[6px] border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 border-b border-border/60 pb-3">
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] text-muted-foreground">السجل</p>
            <h2 className="mt-1 text-[24px] font-bold">خروجات فاتت</h2>
          </div>
          <div className="space-y-3">
            {data.past.map((h) => (
              <HangoutCard key={h.id} hangout={h} past />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

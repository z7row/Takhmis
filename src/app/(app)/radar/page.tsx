import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getRadarData } from "@/lib/queries/radar";
import { toPublicUser } from "@/lib/user";
import { StatusPanel } from "@/components/radar/status-panel";
import { PeopleBoard } from "@/components/radar/people-board";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "الرادار" };

export default async function RadarPage() {
  const user = await requireUser();
  const viewer = toPublicUser(user);
  const radar = getRadarData(user.id);
  const withStatus = radar.people.filter((p) => p.status).length;

  return (
    <div className="space-y-4">
      <StatusPanel viewer={viewer} status={radar.me.status} />

      <section className="rounded-[6px] border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] text-primary">الشلة</p>
            <h2 className="mt-1 text-[24px] font-bold">حالة الصحاب</h2>
          </div>
          <span className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] text-muted-foreground">
            {withStatus} ليهم حالة
          </span>
        </div>
        <PeopleBoard people={radar.people} />
      </section>
    </div>
  );
}

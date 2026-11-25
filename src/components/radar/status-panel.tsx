"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2, Minus, Plus, X } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearStatusAction, setStatusAction } from "@/actions/radar";
import { STATUS_PRESETS, STATUS_KIND_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { RadarPerson } from "@/lib/queries/radar";
import type { PublicUser } from "@/lib/user";
import { toast } from "sonner";

const DURATION_OPTIONS = [0.5, 1, 2, 3, 4, 6, 12, 24];

function formatHours(h: number) {
  if (h === 0.5) return "نص ساعة";
  if (h === 1) return "ساعة";
  if (h === 2) return "ساعتين";
  if (h <= 10) return `${h} ساعات`;
  return `${h} ساعة`;
}

export function StatusPanel({
  viewer,
  status,
}: {
  viewer: PublicUser;
  status: RadarPerson["status"];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [kind, setKind] = useState<"free" | "busy" | "need_company" | "custom">(status?.kind ?? "free");
  const [message, setMessage] = useState(status?.message ?? "");
  const [place, setPlace] = useState(status?.place ?? "");
  const [hours, setHours] = useState(1);

  const meta = STATUS_KIND_META[kind] ?? STATUS_KIND_META.custom;

  const submit = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("kind", kind);
      fd.set("message", message);
      fd.set("place", place);
      fd.set("hours", String(hours));
      const result = await setStatusAction(null, fd);
      if (result?.error) toast.error(result.error);
      else { toast.success(result?.success ?? "تم"); router.refresh(); }
    });
  };

  const clear = () => {
    startTransition(async () => {
      const result = await clearStatusAction();
      if (result?.error) toast.error(result.error);
      else { toast.success(result?.success ?? "تم"); router.refresh(); }
    });
  };

  return (
    <section className="rounded-[6px] border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={viewer} className="size-11 rounded-full" />
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] text-primary">حالتك</p>
            <h2 className="mt-1 text-[24px] font-bold leading-tight">الرادار</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {status ? "حالتك ظاهرة للشلة دلوقتي." : "الحالة العادية: مفيش — اختار حالة لو عايز تظهر للشلة."}
            </p>
          </div>
        </div>
        {status && (
          <Button variant="ghost" onClick={clear} disabled={pending} className="h-9 gap-1.5 rounded-[3px] text-muted-foreground hover:text-foreground">
            <X className="size-4" /> شيل الحالة
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <Label className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] text-muted-foreground">اختار الحالة</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            {STATUS_PRESETS.map((p) => (
              <button
                key={p.kind}
                type="button"
                onClick={() => { setKind(p.kind as any); if (!message) setMessage(p.message); }}
                className={cn(
                  "rounded-[4px] border px-3 py-3 text-right transition-colors",
                  kind === p.kind ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background/30 text-muted-foreground hover:border-primary/40",
                )}
              >
                <div className="text-[13px] font-medium">{p.label}</div>
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px]">رسالة (اختياري)</Label>
            <Input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={120} placeholder={meta.label} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">المكان (اختياري)</Label>
            <Input value={place} onChange={(e) => setPlace(e.target.value)} maxLength={80} placeholder="القاهرة، قهوة، ..." className="h-10" />
          </div>
        </div>

        <div className="space-y-3 rounded-[4px] border border-border bg-background/20 p-4">
          <Label className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] text-muted-foreground">
            <Clock className="size-3.5" /> المدة
          </Label>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon-sm" className="rounded-full" onClick={() => setHours((h) => Math.max(0.5, h === 1 ? 0.5 : h - 1))}><Minus className="size-4" /></Button>
            <div className="flex-1 rounded-[4px] border border-border bg-card px-3 py-2 text-center">
              <div className="num text-[28px] leading-none text-primary">{hours}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{formatHours(hours)}</div>
            </div>
            <Button type="button" variant="outline" size="icon-sm" className="rounded-full" onClick={() => setHours((h) => Math.min(24, h === 0.5 ? 1 : h + 1))}><Plus className="size-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DURATION_OPTIONS.map((h) => (
              <button key={h} type="button" onClick={() => setHours(h)} className={cn("rounded-full border px-2.5 py-1 text-[11px]", hours === h ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                {formatHours(h)}
              </button>
            ))}
          </div>
          <Button onClick={submit} disabled={pending} className="mt-2 h-10 w-full gap-2 rounded-[3px]">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {status ? "حدّث الحالة" : "اظهر حالتي للشلة"}
          </Button>
        </div>
      </div>
    </section>
  );
}

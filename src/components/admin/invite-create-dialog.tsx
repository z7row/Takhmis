"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Link2, Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createInviteAction } from "@/actions/admin";
import type { ActionState } from "@/lib/validation";
import { toast } from "sonner";

export function InviteCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createInviteAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.success, { duration: 6000 });
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 gap-1.5 rounded-[4px] px-3.5 text-[12px] font-bold">
          <Plus className="size-3.5" />
          كود دعوة جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[4px] border-border bg-card sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Link2 className="size-4 text-primary" />
            كود دعوة جديد
          </DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground/70">
            الكود بيتولّد تلقائيًا وبيشتغل على لينك `/join/CODE`.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-1 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <Label className="text-[11px]">أقصى عدد استخدامات</Label>
              <Input
                name="maxUses"
                type="number"
                min={1}
                max={200}
                defaultValue={1}
                className="h-10 rounded-[4px] border-border bg-card text-[12px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">تنتهي بعد (أيام)</Label>
              <Input
                name="expiresInDays"
                type="number"
                min={0}
                max={365}
                defaultValue={14}
                className="h-10 rounded-[4px] border-border bg-card text-[12px]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px]">ملاحظة (اختياري)</Label>
            <Input
              name="note"
              placeholder="مثال: دعوة كريم"
              maxLength={120}
              className="h-10 rounded-[4px] border-border bg-card text-[12px]"
            />
            <p className="text-[11px] text-muted-foreground/70">
              ٠ في الأيام = الكود من غير تاريخ انتهاء.
            </p>
          </div>

          {state?.success && (
            <div className="rounded-[4px] border border-border bg-accent/10 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                الكود جاهز — ابعت اللينك للعضو الجديد
              </p>
              <p className="mt-1 select-all font-display text-[13px] tracking-[0.1em] text-primary">
                {state.success.replace("كود جديد جاهز: ", "")}
              </p>
            </div>
          )}

          {state?.error && (
            <p className="flex items-start gap-1.5 rounded-[4px] border border-accent/40 bg-accent/10 px-2.5 py-2 text-[11px] text-foreground">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="h-10 w-full rounded-[4px] text-[12px] font-bold"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            ولّد الكود
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

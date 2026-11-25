"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, KeyRound, Loader2, LockKeyhole } from "lucide-react";
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
import { updatePasswordAction } from "@/actions/habits";
import type { ActionState } from "@/lib/validation";
import { toast } from "sonner";

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updatePasswordAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.success);
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-[4px] border-border bg-transparent text-[12px] text-primary hover:bg-accent/10 hover:text-primary"
        >
          <KeyRound className="size-3.5" />
          تغيير الباسورد
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[4px] border-border bg-card sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-base">تغيير كلمة السر</DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground/70">
            اختار كلمة سر قوية ومتشاركهاش مع حد.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-1 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[12px]">كلمة السر الحالية</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                type="password"
                name="current"
                required
                autoComplete="current-password"
                className="h-10 rounded-[4px] border-border bg-card ps-9 text-[12px]"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">كلمة السر الجديدة</Label>
            <Input
              type="password"
              name="new"
              required
              minLength={6}
              autoComplete="new-password"
              className="h-10 rounded-[4px] border-border bg-card text-[12px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">تأكيد كلمة السر</Label>
            <Input
              type="password"
              name="confirm"
              required
              minLength={6}
              autoComplete="new-password"
              className="h-10 rounded-[4px] border-border bg-card text-[12px]"
            />
          </div>

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
              <KeyRound className="size-4" />
            )}
            غيّر كلمة السر
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

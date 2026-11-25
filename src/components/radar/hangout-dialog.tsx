"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarPlus, Loader2, Pencil, Save } from "lucide-react";
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
import { saveHangoutAction } from "@/actions/radar";
import { toLocalInputValue } from "@/lib/dates";
import type { ActionState } from "@/lib/validation";

import { toast } from "sonner";

export type HangoutDraft = {
  id: string;
  title: string;
  place: string | null;
  notes: string | null;
  startsAt: number;
};

export function HangoutDialog({
  hangout,
  trigger,
}: {
  hangout?: HangoutDraft;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveHangoutAction,
    null,
  );

  const [defaults] = useState(() => ({
    startsAt: toLocalInputValue(
      hangout?.startsAt ?? Date.now() + 2 * 86400000,
    ),
  }));

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.success);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="h-9 gap-1.5 rounded-[4px] px-3.5 text-[12px] font-semibold">
            <CalendarPlus className="size-3.5" />
            خروجة جديدة
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-[10px] border-border bg-card sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {hangout ? (
              <>
                <Pencil className="size-4 text-primary" />
                تعديل الخروجة
              </>
            ) : (
              <>
                <CalendarPlus className="size-4 text-primary" />
                خروجة جديدة
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-[11px] text-muted-foreground/70">
            الشلة كلها هيوصلها إشعار بالخروجة الجديدة.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-1 space-y-3">
          {hangout && <input type="hidden" name="id" value={hangout.id} />}

          <div className="space-y-1.5">
            <Label className="text-[11px]">اسم الخروجة</Label>
            <Input
              name="title"
              defaultValue={hangout?.title}
              placeholder="لمة الجمعة — كشري وقهوة"
              maxLength={80}
              required
              className="h-10 rounded-[4px] border-border bg-background text-[12px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px]">المكان (اختياري)</Label>
            <Input
              name="place"
              defaultValue={hangout?.place ?? ""}
              placeholder="بيت الكشري، المعادي"
              maxLength={80}
              className="h-10 rounded-[4px] border-border bg-background text-[12px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px]">الميعاد</Label>
            <Input
              type="datetime-local"
              name="startsAt"
              defaultValue={defaults.startsAt}
              required
              dir="ltr"
              className="h-10 rounded-[4px] border-border bg-background text-[12px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px]">ملاحظات (اختياري)</Label>
            <Input
              name="notes"
              defaultValue={hangout?.notes ?? ""}
              placeholder="اللي جاي يكتب جاي عشان نحجز"
              maxLength={200}
              className="h-10 rounded-[4px] border-border bg-background text-[12px]"
            />
          </div>

          {state?.error && (
            <p className="flex items-start gap-1.5 rounded-[4px] border border-border bg-background px-2.5 py-2 text-[11px] text-foreground">
              <AlertCircle className="mt-0.5 size-3 shrink-0 text-primary" />
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="h-10 w-full rounded-[4px] text-[12px] font-semibold"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {hangout ? "احفظ التعديل" : "أضف الخروجة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Megaphone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sendBroadcastAction } from "@/actions/admin";
import type { ActionState } from "@/lib/validation";
import { toast } from "sonner";

export function BroadcastDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    sendBroadcastAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.success);
      setOpen(false);
      router.refresh();
    } else if (state.error) toast.error(state.error);
  }, [state, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-9 gap-1.5 rounded-[4px] border-border bg-transparent px-3.5 text-[12px] text-primary hover:bg-accent/10 hover:text-primary"
        >
          <Megaphone className="size-3.5" />
          إشعار جماعي
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[4px] border-border bg-card sm:max-w-[430px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Megaphone className="size-4 text-primary" />
            إشعار للشلة كلها
          </DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground/70">
            هيوصل لكل الأعضاء ما عداك. استخدمه في الإعلانات المهمة بس.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-1 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[12px]">العنوان</Label>
            <Input
              name="title"
              placeholder="مثال: الخروجة اتأجلت لبكرة 🗓️"
              maxLength={80}
              required
              className="h-10 rounded-[4px] border-border bg-card text-[12px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">التفاصيل (اختياري)</Label>
            <Textarea
              name="body"
              placeholder="اكتب أي تفاصيل إضافية..."
              maxLength={400}
              rows={3}
              className="resize-none rounded-[4px] border-border bg-card text-[12px]"
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
              <Send className="size-4" />
            )}
            ابعت للشلة
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

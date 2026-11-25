"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Flag,
  Gift,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  closeWeekAction,
  resetWeekScoresAction,
  runRolloverAction,
  setWeekRewardAction,
} from "@/actions/admin";
import type { ActionState } from "@/lib/validation";
import { toast } from "sonner";

function WeekFeedback({ state }: { state: ActionState }) {
  if (state?.error) {
    return (
      <p className="flex items-start gap-1.5 rounded-[4px] border border-accent/40 bg-accent/10 px-2.5 py-2 text-[11px] text-foreground">
        <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-primary" />
        {state.error}
      </p>
    );
  }
  if (state?.success) {
    return (
      <p className="flex items-start gap-1.5 rounded-[4px] border border-border bg-accent/10 px-2.5 py-2 text-[11px] text-primary">
        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
        {state.success}
      </p>
    );
  }
  return null;
}

export function WeekControls({
  reward,
  weekLabel,
  topName,
  topPoints,
}: {
  reward: string;
  weekLabel: string;
  topName: string | null;
  topPoints: number;
}) {
  const router = useRouter();
  const [rewardState, rewardAction, rewardPending] = useActionState<
    ActionState,
    FormData
  >(setWeekRewardAction, null);
  const [closeState, closeAction, closePending] = useActionState<
    ActionState,
    FormData
  >(closeWeekAction, null);
  const [pending, startTransition] = useTransition();
  const [closeOpen, setCloseOpen] = useState(false);

  useEffect(() => {
    if (rewardState?.success) {
      toast.success(rewardState.success);
      router.refresh();
    } else if (rewardState?.error) toast.error(rewardState.error);
  }, [rewardState, router]);

  useEffect(() => {
    if (closeState?.success) {
      toast.success(closeState.success, { duration: 7000 });
      setCloseOpen(false);
      router.refresh();
    } else if (closeState?.error) toast.error(closeState.error);
  }, [closeState, router]);

  const runRollover = () => {
    startTransition(async () => {
      const result = await runRolloverAction();
      if (result?.error) toast.error(result.error);
      else toast.success(result?.success ?? "تم");
      router.refresh();
    });
  };

  const resetScores = () => {
    startTransition(async () => {
      const result = await resetWeekScoresAction();
      if (result?.error) toast.error(result.error);
      else toast.success(result?.success ?? "اتصفّرت");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <section className="surface rounded-[10px] p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-bold">
            <Gift className="size-4 text-primary" />
            مكافأة الأسبوع الحالي
          </h2>
          <span className="rounded-xl border border-border bg-accent/10 px-2 py-0.5 text-[11px] text-muted-foreground/70">
            {weekLabel}
          </span>
        </div>

        <form action={rewardAction} className="mt-3 space-y-2">
          <Label className="text-[12px]">المكافأة</Label>
          <div className="flex items-center gap-2">
            <Input
              name="reward"
              defaultValue={reward}
              maxLength={120}
              className="h-10 flex-1 rounded-[4px] border-border bg-card text-[12px]"
            />
            <Button
              type="submit"
              disabled={rewardPending}
              className="h-10 gap-1.5 rounded-[4px] px-3.5 text-[12px] font-bold"
            >
              {rewardPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              احفظ
            </Button>
          </div>
          <WeekFeedback state={rewardState} />
        </form>
      </section>

      <section className="surface rounded-[10px] p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-bold">
          <Flag className="size-4 text-primary" />
          إغلاق الأسبوع
        </h2>
        <div className="mt-3 rounded-[4px] border border-border bg-background px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground/70">المتصدّر حاليًا</p>
          <p className="mt-0.5 text-[13px] font-bold">
            {topName ? `${topName} — ${topPoints} نقطة` : "مفيش منافسة لسه"}
          </p>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground/70">
          الإغلاق بيسجّل النتائج، بيزوّد فوز للفائز، بيصفّر نقاط الأسبوع، وبيبدأ
          أسبوع جديد بالمكافأة اللي هتكتبها.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <AlertDialog open={closeOpen} onOpenChange={setCloseOpen}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                className="h-9 gap-1.5 rounded-[4px] px-3 text-[12px] font-bold"
              >
                <Flag className="size-3.5" />
                اقفل الأسبوع
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[4px] border-border bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle>متأكد من إغلاق الأسبوع؟</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground/70">
                  هنسجّل ترتيب كل الأعضاء دلوقتي، والفائز هياخد فوز. نقاط الأسبوع
                  هتتصفّر وتبدأ صفحة جديدة.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form action={closeAction} className="space-y-2.5">
                <Label className="text-[12px]">مكافأة الأسبوع الجديد</Label>
                <Input
                  name="reward"
                  defaultValue={reward}
                  maxLength={120}
                  className="h-10 rounded-[4px] border-border bg-card text-[12px]"
                />
                <WeekFeedback state={closeState} />
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-[4px] border-border bg-transparent">بس لا</AlertDialogCancel>
                  <Button
                    type="submit"
                    disabled={closePending}
                    className="h-9 rounded-[4px]"
                  >
                    {closePending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Flag className="size-3.5" />
                    )}
                    أيوه اقفله
                  </Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-1.5 rounded-[4px] border-border bg-transparent px-3 text-[12px] text-primary hover:bg-accent/10 hover:text-primary"
              >
                <RotateCcw className="size-3.5" />
                صفّر النقاط
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[4px] border-border bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle>تصفير نقاط الأسبوع؟</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground/70">
                  كل نقاط الأسبوع هتبقى صفر من غير ما نغلق أسبوع أو نسجّل نتائج.
                  مجموع النقاط مدى الحياة مش هيتأثر.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-[4px] border-border bg-transparent">لا</AlertDialogCancel>
                <Button
                  onClick={resetScores}
                  disabled={pending}
                  variant="outline"
                  className="h-9 rounded-[4px] border-border bg-transparent text-primary hover:bg-accent/10 hover:text-primary"
                >
                  {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  أيوه صفّر
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            size="sm"
            variant="ghost"
            onClick={runRollover}
            disabled={pending}
            className="h-9 gap-1.5 rounded-[4px] px-3 text-[12px] text-muted-foreground/70 hover:bg-accent/10 hover:text-foreground"
          >
            <RefreshCw className="size-3.5" />
            شغّل معالجة الأيام
          </Button>
        </div>
      </section>
    </div>
  );
}

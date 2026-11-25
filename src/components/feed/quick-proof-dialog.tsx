"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Camera,
  Check,
  ImagePlus,
  Link2,
  Sparkles,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitProofAction } from "@/actions/proofs";
import { POINTS } from "@/lib/constants";
import type { ArenaHabit } from "@/lib/queries/habits";
import type { ActionState } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function QuickProofDialog({
  habits,
  defaultHabitId,
  trigger,
}: {
  habits: ArenaHabit[];
  defaultHabitId?: string;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ActionState, FormData>(
    submitProofAction,
    null,
  );
  const pendingHabits = habits.filter((h) => !h.proof);
  const [habitId, setHabitId] = useState(
    defaultHabitId ?? pendingHabits[0]?.id ?? habits[0]?.id ?? "",
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      setOpen(false);
      setFile(null);
      setCaption("");
      setPreview(null);
      toast.success(state.success, { duration: 4500 });
      router.refresh();
      import("canvas-confetti")
        .then((mod) => {
          mod.default({
            particleCount: 80,
            spread: 70,
            startVelocity: 36,
            origin: { y: 0.72 },
            colors: ["#DFB6B2", "#FBE4D8", "#854F6C", "#522B5B"],
            scalar: 0.85,
          });
        })
        .catch(() => {});
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const pickFile = (picked: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    if (!picked) {
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const allDone = habits.length > 0 && pendingHabits.length === 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setFile(null);
          setCaption("");
          setPreview(null);
          if (inputRef.current) inputRef.current.value = "";
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-[10px] border-border bg-card p-0 sm:max-w-[520px]">
        <div className="border-b border-border/60 p-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-[4px] border border-border bg-background">
              <Camera className="size-4 text-primary/70" />
            </span>
            <div>
              <h2 className="text-base font-bold">وثّق عادة النهاردة</h2>
              <p className="text-[11px] text-muted-foreground/70">
                الصورة أفضل، ولو مش قادر تقدر توثّق بدون صورة
              </p>
            </div>
          </div>
        </div>

        <form action={formAction} className="space-y-4 p-4">
          <input type="hidden" name="habitId" value={habitId} />

          {habits.length === 0 ? (
            <div className="rounded-[4px] border border-dashed border-border bg-background p-5 text-center">
              <p className="text-2xl">🌱</p>
              <p className="mt-2 text-sm font-bold">لسه مفيش عادات</p>
              <p className="mt-1 text-[11px] text-muted-foreground/70">
                اختار ٣ عادات من البروفايل عشان تبدأ.
              </p>
              <Button asChild size="sm" className="mt-3 h-8 rounded-[4px]">
                <Link href="/profile" onClick={() => setOpen(false)}>
                  ظبّط عاداتك
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-muted-foreground/70">اختار العادة</p>
                <div className="grid gap-1.5 sm:grid-cols-3">
                  {habits.map((habit) => {
                    const disabled = Boolean(habit.proof);
                    const selected = habitId === habit.id;
                    return (
                      <button
                        key={habit.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setHabitId(habit.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-[4px] border px-2.5 py-2 text-start transition-colors",
                          selected
                            ? "border-primary/40 bg-accent/15"
                            : "border-border bg-background hover:bg-accent/10",
                          disabled && "opacity-50",
                        )}
                      >
                        <span className="text-lg">{habit.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11.5px] font-semibold">
                            {habit.title}
                          </span>
                          <span className="block text-[9px] text-muted-foreground/70">
                            {habit.proof ? "متوثقة النهاردة" : "مستنية إثبات"}
                          </span>
                        </span>
                        {habit.proof ? (
                          <Check className="size-3.5 shrink-0 text-primary/70" />
                        ) : selected ? (
                          <span className="size-2 shrink-0 rounded-full bg-primary" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold text-muted-foreground/70">صورة الإثبات (اختياري بس مُفضّل)</p>
                <input
                  ref={inputRef}
                  type="file"
                  name="image"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                />

                {preview ? (
                  <div className="overflow-hidden rounded-[4px] border border-border bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="معاينة الإثبات" className="aspect-[4/3] w-full object-cover" />
                    <div className="flex gap-1.5 border-t border-border/60 p-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} className="h-8 rounded-[4px] px-2 text-[10px]">
                        <ImagePlus className="size-3" />
                        غيّر
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          pickFile(null);
                          if (inputRef.current) inputRef.current.value = "";
                        }}
                        className="h-8 rounded-[4px] px-2 text-[10px] text-muted-foreground/70"
                      >
                        <X className="size-3" />
                        شيل
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed border-border bg-background transition-colors hover:bg-accent/10"
                  >
                    <span className="grid size-10 place-items-center rounded-[4px] border border-border bg-card">
                      <Camera className="size-5 text-primary/70" />
                    </span>
                    <span className="text-[12px] font-semibold">التقط صورة أو ارفعها</span>
                    <span className="text-[10px] text-muted-foreground/70">الصورة أفضل، بس تقدر توثّق من غيرها</span>
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-muted-foreground/70">تعليق قصير (اختياري)</p>
                  <span className="num text-[9px] text-muted-foreground/70">{caption.length}/160</span>
                </div>
                <Input
                  name="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={160}
                  placeholder="إيه اللي حصل النهاردة؟ 💪"
                  className="h-10 rounded-[4px] text-[12px]"
                />
              </div>

              <div className="flex items-center justify-between rounded-[4px] border border-border bg-background px-3 py-2">
                <span className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground/70">
                  <Sparkles className="size-3.5 text-primary/70" />
                  +{POINTS.proof} نقطة · +{POINTS.fullDay} بونص لو كمّلت الثلاثة
                </span>
                <span className="flex items-center gap-1 text-[10px] text-primary/70">
                  <Link2 className="size-3" />
                  هيتنشر في الفيد
                </span>
              </div>

              {state?.error && (
                <p role="alert" className="flex items-start gap-2 rounded-[4px] border border-border bg-accent/10 px-3 py-2 text-[11.5px] text-primary">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                  {state.error}
                </p>
              )}

              {allDone ? (
                <div className="rounded-[4px] border border-border bg-background px-3 py-2.5 text-center text-[11.5px] text-primary/70">
                  وثّقت كل عاداتك النهاردة — شغلك خلص يا وحش!
                </div>
              ) : (
                <Button type="submit" disabled={!habitId} className="h-9 w-full rounded-[4px] text-[13px] font-bold">
                  <Check className="size-4" />
                  {file ? "انشر الإثبات بالصورة" : "وثّق بدون صورة"}
                </Button>
              )}
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

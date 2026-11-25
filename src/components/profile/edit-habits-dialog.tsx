"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  Loader2,
  Plus,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateHabitsAction } from "@/actions/habits";
import { HABIT_SUGGESTIONS, MAX_HABITS, HABIT_HARD_LIMIT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/validation";
import { toast } from "sonner";

type HabitDraft = { id?: string; title: string; emoji: string };

const EMOJIS = ["🎯", "💪", "📚", "🏃", "💧", "🧘", "🍏", "😴", "📝", "🕌"];

export function EditHabitsDialog({
  habits,
}: {
  habits: { id: string; title: string; emoji: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateHabitsAction,
    null,
  );
  const [drafts, setDrafts] = useState<HabitDraft[]>(
    habits.map((h) => ({ id: h.id, title: h.title, emoji: h.emoji })),
  );
  const [customTitle, setCustomTitle] = useState("");
  const [customEmoji, setCustomEmoji] = useState("🎯");
  const [error, setError] = useState<string | null>(null);

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

  const resetDrafts = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setDrafts(habits.map((h) => ({ id: h.id, title: h.title, emoji: h.emoji })));
      setError(null);
    }
  };

  const add = (habit: { title: string; emoji: string }) => {
    setError(null);
    if (drafts.length >= HABIT_HARD_LIMIT) {
      setError(`الحد الأقصى ${HABIT_HARD_LIMIT} عادة`);
      return;
    }
    if (drafts.some((d) => d.title === habit.title)) return;
    setDrafts((prev) => [...prev, { title: habit.title, emoji: habit.emoji }]);
  };

  const addCustom = () => {
    const title = customTitle.trim();
    if (title.length < 2) {
      setError("اكتب اسم العادة الأول");
      return;
    }
    add({ title, emoji: customEmoji });
    setCustomTitle("");
  };

  const selected = new Set(drafts.map((d) => d.title));

  return (
    <Dialog open={open} onOpenChange={resetDrafts}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-[4px] border-border bg-transparent text-[12px] text-primary hover:bg-accent/10 hover:text-primary"
        >
          <Settings2 className="size-3.5" />
          تعديل العادات
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-[4px] border-border bg-card sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-base">عاداتك التلاتة</DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground/70">
            اختار عاداتك — ننصح بـ {MAX_HABITS} عادات للتركيز، ولو ضفت أكتر هيظهر تنبيه بس. أي عادة بتشيلها بتتحول لأرشيف ومش
            بتضيع نقاطها القديمة.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-1 space-y-3">
          <input type="hidden" name="habits" value={JSON.stringify(drafts)} />

          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold">عاداتك الحالية</p>
            <span className="num text-[11px] text-muted-foreground/70">
              {drafts.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {drafts.map((draft, index) => (
              <div
                key={`${draft.id ?? "new"}-${index}`}
                className="flex items-center gap-2 rounded-[4px] border border-border bg-background px-2.5 py-2"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-border/60 bg-card text-base">
                  {draft.emoji}
                </span>
                <Input
                  value={draft.title}
                  onChange={(e) =>
                    setDrafts((prev) =>
                      prev.map((d, i) =>
                        i === index ? { ...d, title: e.target.value } : d,
                      ),
                    )
                  }
                  maxLength={40}
                  className="h-8 flex-1 rounded-xl border-transparent bg-transparent px-1 text-[12px] font-semibold focus-visible:border-border"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDrafts((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="shrink-0 rounded-xl p-1 text-muted-foreground/70 hover:bg-accent/10 hover:text-primary"
                  aria-label="شيل العادة"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}

            {drafts.length < HABIT_HARD_LIMIT && (
              <button
                type="button"
                onClick={() => add({ title: "عادة جديدة", emoji: "🎯" })}
                className="flex w-full items-center justify-center gap-1 rounded-[4px] border border-dashed border-border py-2 text-[11px] text-muted-foreground/70 transition-colors hover:bg-accent/10 hover:text-foreground"
              >
                <Plus className="size-3.5" />
                أضف عادة
              </button>
            )}
          </div>

          {drafts.length < HABIT_HARD_LIMIT && (
            <>
              <p className="text-[11px] text-muted-foreground/70">اقتراحات سريعة</p>
              <div className="grid grid-cols-2 gap-1.5">
                {HABIT_SUGGESTIONS.filter((h) => !selected.has(h.title))
                  .slice(0, 6)
                  .map((habit) => (
                    <button
                      key={habit.title}
                      type="button"
                      onClick={() => add(habit)}
                      className="flex items-center gap-1.5 rounded-[4px] border border-border bg-background px-2 py-1.5 text-start text-[11px] transition-colors hover:bg-accent/10"
                    >
                      <span>{habit.emoji}</span>
                      <span className="truncate">{habit.title}</span>
                      <Plus className="ms-auto size-3 shrink-0 text-muted-foreground/70" />
                    </button>
                  ))}
              </div>

              <div className="rounded-[4px] border border-border bg-background p-2.5">
                <p className="mb-1.5 text-[11px] text-muted-foreground/70">
                  أو اكتب عادة خاصة بيك
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-1">
                    {EMOJIS.slice(0, 5).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setCustomEmoji(emoji)}
                        className={cn(
                          "grid size-7 place-items-center rounded-xl border text-sm transition-colors",
                          customEmoji === emoji
                            ? "border-border bg-accent/15"
                            : "border-transparent hover:bg-accent/10",
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="اسم العادة"
                    maxLength={40}
                    className="h-8 flex-1 rounded-[4px] border-border bg-card text-[11px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustom();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addCustom}
                    className="h-8 rounded-[4px] border-border bg-transparent px-2 text-[11px] text-primary hover:bg-accent/10 hover:text-primary"
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {(error || state?.error) && (
            <p className="flex items-start gap-1.5 rounded-[4px] border border-accent/40 bg-accent/10 px-2.5 py-2 text-[11px] text-foreground">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {error ?? state?.error}
            </p>
          )}

          {drafts.length > MAX_HABITS && drafts.length < HABIT_HARD_LIMIT && (
            <p className="flex items-center gap-1 rounded-[4px] border border-border bg-accent/10 px-2.5 py-1.5 text-[11px] text-primary/70">
              <AlertCircle className="size-3.5" />
              تعدّيت {MAX_HABITS} عادات — ده ممكن يشتتك، بس تقدر تكمل عادي.
            </p>
          )}

          <Button
            type="submit"
            disabled={pending || drafts.length === 0}
            className="h-10 w-full rounded-[4px] text-[12px] font-bold"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            احفظ العادات
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

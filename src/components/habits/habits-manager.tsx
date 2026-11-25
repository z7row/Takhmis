"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { updateHabitsAction } from "@/actions/habits";
import { HABIT_SUGGESTIONS, MAX_HABITS, HABIT_HARD_LIMIT } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/validation";
import { toast } from "sonner";

type HabitDraft = { id?: string; title: string; emoji: string };
const EMOJIS = ["🎯", "💪", "📚", "🏃", "💧", "🧘", "🍏", "😴", "📝", "🕌", "💻", "🧹"];

export function HabitsManager({
  initialHabits,
}: {
  initialHabits: HabitDraft[];
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<HabitDraft[]>(initialHabits);
  const [editing, setEditing] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [error, setError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateHabitsAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.success) { toast.success(state.success); setEditing(null); router.refresh(); }
    else if (state.error) { toast.error(state.error); }
  }, [state, router]);

  useEffect(() => { setDrafts(initialHabits); }, [initialHabits]);

  const startAdd = () => {
    if (drafts.length >= HABIT_HARD_LIMIT) { setError(`الحد الأقصى ${HABIT_HARD_LIMIT} عادة`); return; }
    setError(null); setTitle(""); setEmoji("🎯"); setEditing(-1);
  };

  const startEdit = (i: number) => { setError(null); setTitle(drafts[i].title); setEmoji(drafts[i].emoji); setEditing(i); };

  const commit = () => {
    const t = title.trim();
    if (t.length < 2) { setError("اسم العادة قصير أوي"); return; }
    if (editing === -1) {
      if (drafts.some((d) => d.title === t)) { setError("العادة دي موجودة"); return; }
      setDrafts((prev) => [...prev, { title: t, emoji }]);
    } else if (editing !== null) {
      setDrafts((prev) => prev.map((d, i) => (i === editing ? { ...d, title: t, emoji } : d)));
    }
    setEditing(null); setError(null);
  };

  const remove = (i: number) => { setDrafts((prev) => prev.filter((_, idx) => idx !== i)); setEditing(null); };

  const addSuggestion = (h: { title: string; emoji: string }) => {
    if (drafts.length >= HABIT_HARD_LIMIT) return;
    if (drafts.some((d) => d.title === h.title)) return;
    setDrafts((prev) => [...prev, { title: h.title, emoji: h.emoji }]);
  };

  const dirty = JSON.stringify(drafts) !== JSON.stringify(initialHabits);

  return (
    <div className="rounded-[6px] border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] text-primary">العادات</p>
          <h2 className="mt-1 text-[24px] font-bold">عاداتك اليومية</h2>
        </div>
        <Button type="button" variant="outline" onClick={startAdd} className="h-9 gap-1.5 rounded-[3px] px-3">
          <Plus className="size-4" /> أضف عادة
        </Button>
      </div>

      <div className="space-y-2">
        {drafts.map((d, i) => (
          <div key={`${d.id ?? "n"}-${i}`} className="flex items-center gap-3 rounded-[4px] border border-border bg-background/40 px-3 py-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-[4px] border border-border bg-card text-lg">{d.emoji}</span>
            <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{d.title}</span>
            <button type="button" onClick={() => startEdit(i)} className="rounded-full p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground" aria-label="تعديل"><Pencil className="size-4" /></button>
            <button type="button" onClick={() => remove(i)} className="rounded-full p-2 text-muted-foreground hover:bg-white/5 hover:text-[#ffb4ab]" aria-label="حذف"><Trash2 className="size-4" /></button>
          </div>
        ))}
        {drafts.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">لسه مفيش عادات — أضف أول عادة.</p>}
      </div>

      {editing !== null && (
        <div className="mt-3 space-y-3 rounded-[4px] border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} placeholder="اسم العادة" className="h-10 flex-1" />
            <Button type="button" onClick={commit} className="h-10 rounded-[3px] px-3"><Save className="size-4" /></Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)} className="h-10 rounded-[3px] px-3"><X className="size-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => setEmoji(e)} className={cn("grid size-8 place-items-center rounded-[4px] border text-base", emoji === e ? "border-primary bg-primary/10" : "border-border hover:bg-white/5")}>{e}</button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-3 flex items-center gap-1.5 text-[12px] text-[#ffb4ab]"><AlertCircle className="size-3.5" />{error}</p>}

      {drafts.length > MAX_HABITS && (
        <p className="mt-3 flex items-center gap-1.5 rounded-[4px] border border-border bg-accent/10 px-3 py-2 text-[12px] text-primary">
          <AlertCircle className="size-3.5" /> تعدّيت {MAX_HABITS} عادات — ينفع تكمل، بس التركيز على عدد أقل بيساعدك تلتزم.
        </p>
      )}

      <div className="mt-4 border-t border-border/60 pt-3">
        <p className="mb-2 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] text-muted-foreground">اقتراحات</p>
        <div className="flex flex-wrap gap-1.5">
          {HABIT_SUGGESTIONS.filter((h) => !drafts.some((d) => d.title === h.title)).slice(0, 8).map((h) => (
            <button key={h.title} type="button" onClick={() => addSuggestion(h)} className="rounded-full border border-border bg-background/40 px-2.5 py-1 text-[12px] text-muted-foreground hover:border-primary/40 hover:text-foreground">
              {h.emoji} {h.title}
            </button>
          ))}
        </div>
      </div>

      <form action={formAction} className="mt-4 flex justify-end border-t border-border/60 pt-4">
        <input type="hidden" name="habits" value={JSON.stringify(drafts)} />
        <Button type="submit" disabled={pending || !dirty || drafts.length === 0} className="h-10 gap-2 rounded-[3px] px-5">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          احفظ التغييرات
        </Button>
      </form>
    </div>
  );
}

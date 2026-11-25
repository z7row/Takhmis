"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  LockKeyhole,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { registerAction } from "@/actions/auth";
import { HABIT_SUGGESTIONS, MAX_HABITS, HABIT_HARD_LIMIT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ActionState, HabitInput } from "@/lib/validation";

const STEPS = [
  { title: "الحساب", hint: "مين أنت؟" },
  { title: "الصورة", hint: "شكلك في الشلة" },
  { title: "عاداتك", hint: "٣ على قد الإيد" },
];

const EMOJIS = ["🎯", "💪", "📚", "🏃", "💧", "🧘", "🍏", "😴", "📝", "🕌"];

export function RegisterFlow({
  defaultCode = "",
  lockCode = false,
  inviteNote,
  inviterName,
}: {
  defaultCode?: string;
  lockCode?: boolean;
  inviteNote?: string | null;
  inviterName?: string | null;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    registerAction,
    null,
  );
  const [step, setStep] = useState(0);
  const [code, setCode] = useState(defaultCode.toUpperCase());
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [habits, setHabits] = useState<HabitInput[]>([]);
  const [customTitle, setCustomTitle] = useState("");
  const [customEmoji, setCustomEmoji] = useState("🎯");
  const [errors, setErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const validateAccount = () => {
    const list: string[] = [];
    if (code.trim().length < 4) list.push("كود الدعوة لازم ٤ حروف على الأقل");
    if (nickname.trim().length < 2) list.push("اكتب اسمك أو لقبك (حرفين على الأقل)");
    if (password.length < 6) list.push("كلمة السر لازم ٦ حروف على الأقل");
    if (password !== confirm) list.push("كلمتين السر مش متطابقين");
    setErrors(list);
    if (!list.length) setStep(1);
  };

  const nextFromAvatar = () => {
    setErrors([]);
    setStep(2);
  };

  const addSuggestion = (habit: (typeof HABIT_SUGGESTIONS)[number]) => {
    setErrors([]);
    if (habits.length >= HABIT_HARD_LIMIT) {
      setErrors([`الحد الأقصى ${HABIT_HARD_LIMIT} عادة`]);
      return;
    }
    if (habits.some((h) => h.title === habit.title)) return;
    setHabits((prev) => [...prev, { title: habit.title, emoji: habit.emoji }]);
  };

  const addCustom = () => {
    const title = customTitle.trim();
    if (title.length < 2) {
      setErrors(["اكتب اسم العادة الأول"]);
      return;
    }
    if (habits.length >= HABIT_HARD_LIMIT) {
      setErrors([`الحد الأقصى ${HABIT_HARD_LIMIT} عادة`]);
      return;
    }
    if (habits.some((h) => h.title === title)) {
      setErrors(["العادة دي متضافة بالفعل"]);
      return;
    }
    setHabits((prev) => [...prev, { title, emoji: customEmoji }]);
    setCustomTitle("");
    setErrors([]);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    if (habits.length === 0) {
      event.preventDefault();
      setErrors(["اختار عادة واحدة على الأقل عشان نبدأ"]);
    }
  };

  const pickAvatar = (file: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    if (!file) {
      setAvatarName(null);
      setPreview(null);
      return;
    }
    setAvatarName(file.name);
    setPreview(URL.createObjectURL(file));
  };

  const selectedTitles = new Set(habits.map((h) => h.title));

  return (
    <div className="rounded-[10px] border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <p className="text-[11px] font-semibold text-primary/70">
            {lockCode ? "دعوة خاصة للشلة" : "دخول بالدعوة فقط"}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">ادخل الشلة</h1>
          <p className="mt-1 text-[12px] leading-5 text-muted-foreground/70">
            {inviterName
              ? `${inviterName} بعتلك دعوة. ٣ خطوات وتكون جوّه.`
              : "٣ خطوات صغيرة وتكون وسط الشلة."}
          </p>
        </div>
        <div className="text-end">
          <p className="text-[10px] text-muted-foreground/70">خطوة</p>
          <p className="num text-base font-bold">
            {step + 1}
            <span className="text-xs text-muted-foreground/70">/{STEPS.length}</span>
          </p>
        </div>
      </div>

      {inviteNote && (
        <div className="mt-4 rounded-[4px] border border-border bg-background px-3 py-2 text-[11px] text-muted-foreground/70">
          💬 {inviteNote}
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        {STEPS.map((s, index) => (
          <div key={s.title} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold",
                  index < step
                    ? "border-primary/40 bg-primary text-primary-foreground"
                    : index === step
                      ? "border-primary/40 bg-accent/20 text-primary"
                      : "border-border bg-background text-muted-foreground/70",
                )}
              >
                {index < step ? <Check className="size-3" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  index <= step ? "text-foreground" : "text-muted-foreground/70",
                )}
              >
                {s.title}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: index <= step ? "100%" : "0%",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <form ref={formRef} action={formAction} onSubmit={submit} className="relative mt-5">
        <input type="hidden" name="code" value={code} />
        <input type="hidden" name="nickname" value={nickname} />
        <input type="hidden" name="password" value={password} />
        <input type="hidden" name="confirm" value={confirm} />
        <input type="hidden" name="habits" value={JSON.stringify(habits)} />

        <div className="min-h-0 sm:min-h-[280px]">
          {step === 0 && (
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-[12px]">
                  كود الدعوة
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => !lockCode && setCode(e.target.value.toUpperCase())}
                  readOnly={lockCode}
                  placeholder="TKH-XXXXX"
                  dir="ltr"
                  autoCapitalize="characters"
                  className={cn(
                    "h-10 rounded-[4px] text-center font-display text-sm tracking-[0.2em]",
                    lockCode && "border-primary/30 bg-accent/10 text-primary",
                  )}
                  required
                />
                {lockCode && (
                  <p className="flex items-center gap-1 text-[10px] text-primary/70">
                    <Check className="size-3" />
                    الكود جاي من لينك الدعوة — جاهز
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nickname" className="text-[12px]">
                  الاسم / اللقب
                </Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="هيتكتب بيه في الفيد والترتيب"
                    maxLength={24}
                    className="h-10 rounded-[4px] ps-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[12px]">
                    كلمة السر
                  </Label>
                  <div className="relative isolate">
                    <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      placeholder="٦ حروف على الأقل"
                      autoComplete="new-password"
                      className="h-10 rounded-[4px] pe-12 ps-10 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute end-1 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-[4px] text-muted-foreground/70 transition-colors hover:bg-accent/10 hover:text-foreground touch-manipulation pointer-events-auto"
                      aria-label={showPassword ? "إخفاء كلمة السر" : "إظهار كلمة السر"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-[12px]">
                    تأكيد كلمة السر
                  </Label>
                  <Input
                    id="confirm"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="تاني مرة"
                    autoComplete="new-password"
                    className="h-10 rounded-[4px] text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative">
                <div className="grid size-28 place-items-center overflow-hidden rounded-full border border-dashed border-border bg-background">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="الصورة الشخصية" className="size-full object-cover" />
                  ) : (
                    <Camera className="size-9 text-primary/70" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -end-1 grid size-8 place-items-center rounded-full border border-border bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                  aria-label="اختار صورة"
                >
                  <ImagePlus className="size-4" />
                </button>
              </div>

              <input
                ref={fileRef}
                type="file"
                name="avatar"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => pickAvatar(e.target.files?.[0] ?? null)}
              />

              <p className="mt-4 text-sm font-bold">صورتك في الشلة</p>
              <p className="mt-1 max-w-[280px] text-center text-[11px] leading-5 text-muted-foreground/70">
                صورة واضحة لوشك أحسن — الشلة عايزة تعرف مين بيكسّل 😄
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="h-8 rounded-[4px] text-[11px]">
                  <ImagePlus className="size-3.5" />
                  {avatarName ? "تغيير الصورة" : "اختار صورة"}
                </Button>
                {preview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      pickAvatar(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="h-8 rounded-[4px] text-[11px] text-muted-foreground/70"
                  >
                    <X className="size-3.5" />
                    شيلها
                  </Button>
                )}
              </div>
              {avatarName && (
                <p className="mt-2 max-w-[280px] truncate text-[10px] text-muted-foreground/70">{avatarName}</p>
              )}
              <p className="mt-3 text-[10px] text-muted-foreground/70">اختياري — تقدر تكمّل من غير صورة</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold">اختار عاداتك (ننصح بـ 3 للتركيز)</p>
                <span className="num text-[11px] text-muted-foreground/70">
                  {habits.length}
                </span>
              </div>

              {habits.length > 0 && (
                <div className="space-y-2">
                  {habits.map((habit, index) => (
                    <div key={`${habit.title}-${index}`} className="flex items-center gap-2.5 rounded-[4px] border border-border bg-background px-3 py-2">
                      <span className="grid size-8 place-items-center rounded-xl border border-border bg-card text-base">{habit.emoji}</span>
                      <span className="flex-1 truncate text-[12.5px] font-semibold">{habit.title}</span>
                      <button
                        type="button"
                        onClick={() => setHabits((prev) => prev.filter((_, i) => i !== index))}
                        className="rounded-xl p-1 text-muted-foreground/70 hover:bg-accent/10 hover:text-primary"
                        aria-label="شيل العادة"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {habits.length < HABIT_HARD_LIMIT && (
                <>
                  <div className="max-h-[156px] overflow-y-auto pe-0.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      {HABIT_SUGGESTIONS.filter((h) => !selectedTitles.has(h.title)).map((habit) => (
                        <button
                          key={habit.title}
                          type="button"
                          onClick={() => addSuggestion(habit)}
                          className="flex items-center gap-2 rounded-[4px] border border-border bg-background px-2.5 py-2 text-start text-[11px] transition-colors hover:bg-accent/10"
                        >
                          <span className="text-base">{habit.emoji}</span>
                          <span className="truncate">{habit.title}</span>
                          <Plus className="ms-auto size-3 shrink-0 text-muted-foreground/70" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[4px] border border-border bg-background p-2.5">
                    <p className="mb-2 text-[10.5px] text-muted-foreground/70">أو اكتب عادة خاصة بيك</p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {EMOJIS.slice(0, 5).map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setCustomEmoji(emoji)}
                            className={cn(
                              "grid size-7 place-items-center rounded-xl text-sm transition-colors",
                              customEmoji === emoji ? "bg-accent/20 ring-1 ring-primary/30" : "hover:bg-accent/10",
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
                        className="h-8 flex-1 rounded-[4px] text-[11px]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustom();
                          }
                        }}
                      />
                      <Button type="button" size="sm" variant="secondary" onClick={addCustom} className="h-8 rounded-[4px] px-2 text-[10px]">
                        <Plus className="size-3" />
                        ضيف
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {habits.length > MAX_HABITS && (
                <p className="rounded-[4px] border border-border bg-background px-3 py-2 text-[10.5px] text-primary/70">
                  ٣ عادات كفاية جداً — الهدف الالتزام مش العبء 💜
                </p>
              )}
            </div>
          )}
        </div>

        {(errors.length > 0 || state?.error) && (
          <div role="alert" className="mt-3 space-y-1 rounded-[4px] border border-border bg-accent/10 px-3 py-2.5 text-[11.5px] text-primary">
            {state?.error ? (
              <p className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                {state.error}
              </p>
            ) : (
              errors.map((error) => (
                <p key={error} className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                  {error}
                </p>
              ))
            )}
          </div>
        )}

        <div className="relative z-20 mt-5 flex items-center gap-2">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setErrors([]);
                setStep((s) => s - 1);
              }}
              className="h-10 rounded-[4px] px-4 text-[12px] touch-manipulation"
            >
              <ArrowRight className="size-4" />
              رجوع
            </Button>
          )}
          {step === 0 && (
            <Button type="button" onClick={validateAccount} className="relative z-20 h-11 flex-1 rounded-[4px] text-[12.5px] font-bold touch-manipulation pointer-events-auto">
              التالي
              <ArrowLeft className="size-4" />
            </Button>
          )}
          {step === 1 && (
            <Button type="button" onClick={nextFromAvatar} className="relative z-20 h-11 flex-1 rounded-[4px] text-[12.5px] font-bold touch-manipulation pointer-events-auto">
              {preview ? "تمام، كمّل" : "كمّل من غير صورة"}
              <ArrowLeft className="size-4" />
            </Button>
          )}
          {step === 2 && (
            <SubmitButton className="relative z-20 h-11 flex-1 rounded-[4px] text-[12.5px] font-bold touch-manipulation pointer-events-auto" pendingLabel="بنعمل حسابك...">
              يلا نبدأ الالتزام!
              <Sparkles className="size-4" />
            </SubmitButton>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-3 text-[10.5px] text-muted-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <span>بالدخول أنت موافق على قواعد الشلة 💜</span>
          <Link href="/login" className="font-semibold text-primary/70 hover:text-primary">
            عندي حساب بالفعل
          </Link>
        </div>
      </form>
    </div>
  );
}

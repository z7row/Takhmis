"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { loginAction } from "@/actions/auth";
import type { ActionState } from "@/lib/validation";

export function LoginForm({ initialNickname }: { initialNickname?: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    loginAction,
    null,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="rounded-[10px] border border-border bg-card p-6 sm:p-7">
      <p className="text-[11px] font-semibold text-primary/70">دخول بالدعوة فقط</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight">
        نورت تاني يا صاحبي 👋
      </h1>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground/70">
        ادخل وشوف الشلة وثّقت إيه النهاردة.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nickname" className="text-[12px]">
            الاسم / اللقب
          </Label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              id="nickname"
              name="nickname"
              defaultValue={initialNickname}
              placeholder="زياد"
              autoComplete="username"
              required
              className="h-10 rounded-[4px] ps-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[12px]">
            كلمة السر
          </Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="h-10 rounded-[4px] px-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute end-1 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-[4px] text-muted-foreground/70 transition-colors hover:bg-accent/10 hover:text-foreground touch-manipulation"
              aria-label={showPassword ? "إخفاء كلمة السر" : "إظهار كلمة السر"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {state?.error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-[4px] border border-border bg-accent/10 px-3 py-2.5 text-[12px] text-primary"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {state.error}
          </div>
        )}

        <SubmitButton className="h-9 w-full rounded-[4px] text-sm font-bold" pendingLabel="بندخل...">
          يلا ندخل
        </SubmitButton>
      </form>

      <div className="mt-5 border-t border-border/60 pt-4 text-center">
        <p className="mb-2 text-[11px] text-muted-foreground/70">معندكش حساب؟</p>
        <Link
          href="/register"
          className="inline-flex h-9 w-full items-center justify-center rounded-[4px] border border-border bg-background text-[12.5px] font-semibold text-foreground transition-colors hover:bg-accent/10"
        >
          عندي كود دعوة — ادخل الشلة
        </Link>
      </div>

      <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground/70">
        مش عارف كود الدعوة؟ كلّم الأدمن أو أي حد من الشلة.
      </p>
    </div>
  );
}

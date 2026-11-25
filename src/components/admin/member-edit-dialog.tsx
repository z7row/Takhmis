"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  Pencil,
  Save,
  ShieldCheck,
} from "lucide-react";
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
import { updateMemberAction } from "@/actions/admin";
import type { ActionState } from "@/lib/validation";
import { toast } from "sonner";

export type AdminMember = {
  id: string;
  nickname: string;
  role: "admin" | "member";
  points: number;
  streak: number;
  jokers: number;
  wins: number;
  title: string;
  titleEmoji: string;
  titleLocked: boolean;
  disabled: boolean;
};

export function MemberEditDialog({ member }: { member: AdminMember }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateMemberAction,
    null,
  );

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
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 rounded-[4px] text-muted-foreground/70 hover:bg-accent/10 hover:text-primary"
          aria-label={`تعديل ${member.nickname}`}
        >
          <Pencil className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-[4px] border-border bg-card sm:max-w-[470px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-primary" />
            تعديل {member.nickname}
          </DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground/70">
            تعديل النقاط والستريك والألقاب — التغييرات بتتزامن مع كل الصفحات.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-1 space-y-3">
          <input type="hidden" name="id" value={member.id} />

          <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2.5">
            <div className="space-y-1.5">
              <Label className="text-[12px]">الاسم</Label>
              <Input
                name="nickname"
                defaultValue={member.nickname}
                maxLength={24}
                required
                className="h-10 rounded-[4px] border-border bg-card text-[12px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">الصلاحية</Label>
              <select
                name="role"
                defaultValue={member.role}
                className="h-10 w-full rounded-[4px] border border-border bg-card px-2 text-[12px] outline-none focus:border-primary/40"
              >
                <option value="member">عضو</option>
                <option value="admin">أدمن</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { name: "points", label: "نقاط الأسبوع", value: member.points },
              { name: "streak", label: "الستريك", value: member.streak },
              { name: "jokers", label: "جوكر", value: member.jokers },
              { name: "wins", label: "فوز", value: member.wins },
            ].map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label className="text-[11px]">{field.label}</Label>
                <Input
                  name={field.name}
                  type="number"
                  min={0}
                  defaultValue={field.value}
                  className="h-9 rounded-[4px] border-border bg-card text-[12px]"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_70px] gap-2.5">
            <div className="space-y-1.5">
              <Label className="text-[12px]">لقب مخصص</Label>
              <Input
                name="title"
                defaultValue={member.title}
                maxLength={40}
                className="h-10 rounded-[4px] border-border bg-card text-[12px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">الإيموجي</Label>
              <Input
                name="titleEmoji"
                defaultValue={member.titleEmoji}
                maxLength={12}
                className="h-10 rounded-[4px] border-border bg-card text-center text-[14px]"
              />
            </div>
          </div>

          <div className="space-y-2 rounded-[4px] border border-border bg-background p-3">
            <label className="flex items-start gap-2 text-[11px]">
              <input
                type="checkbox"
                name="titleLocked"
                defaultChecked={member.titleLocked}
                className="mt-0.5 size-3.5 accent-[var(--primary)]"
              />
              <span>
                <span className="font-semibold">اقفل اللقب</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
                  منع الحساب التلقائي من تغيير اللقب.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-[11px]">
              <input
                type="checkbox"
                name="disabled"
                defaultChecked={member.disabled}
                className="mt-0.5 size-3.5 accent-[var(--primary)]"
              />
              <span>
                <span className="font-semibold">إيقاف الحساب</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
                  العضو مش هيقدر يدخل، وهيتشال من الترتيب والرادار.
                </span>
              </span>
            </label>
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
              <Save className="size-4" />
            )}
            احفظ التعديلات
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

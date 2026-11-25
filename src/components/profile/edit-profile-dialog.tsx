"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, ImagePlus, Loader2, Pencil, Save } from "lucide-react";
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
import { updateProfileAction } from "@/actions/habits";
import type { ActionState } from "@/lib/validation";
import type { PublicUser } from "@/lib/user";
import { toast } from "sonner";

export function EditProfileDialog({ user }: { user: PublicUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateProfileAction,
    null,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && preview) {
          URL.revokeObjectURL(preview);
          setPreview(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-[4px] border-border bg-transparent text-[12px] text-primary hover:bg-accent/10 hover:text-primary"
        >
          <Pencil className="size-3.5" />
          تعديل البروفايل
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[4px] border-border bg-card sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-base">تعديل البروفايل</DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground/70">
            غيّر اسمك أو صورتك — الشلة هتشوف التغيير على طول.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-1 space-y-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-dashed border-border bg-card"
            >
              {preview || user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview ?? user.avatarUrl ?? ""}
                  alt="الصورة الشخصية"
                  className="size-full object-cover"
                />
              ) : (
                <Camera className="size-5 text-primary/70" />
              )}
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 bg-background/90 py-0.5 text-[9px] font-medium text-primary">
                <ImagePlus className="size-2.5" />
                غيّر
              </span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold">الصورة الشخصية</p>
              <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground/70">
                صورة واضحة أحسن — اختيارية.
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              name="avatar"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (preview) URL.revokeObjectURL(preview);
                setPreview(file ? URL.createObjectURL(file) : null);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px]">الاسم / اللقب</Label>
            <Input
              name="nickname"
              defaultValue={user.nickname}
              maxLength={24}
              required
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
              <Save className="size-4" />
            )}
            حفظ التعديلات
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteInviteAction, toggleInviteAction } from "@/actions/admin";
import { toast } from "sonner";

export function InviteRowActions({
  invite,
}: {
  invite: { id: string; code: string; active: boolean };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const copy = async () => {
    const link = `${window.location.origin}/join/${invite.code}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("لينك الدعوة اتنسخ ✅", { description: link });
    } catch {
      toast.error("مقدرناش ننسخ — انسخه يدوي", { description: link });
    }
  };

  const toggle = () => {
    startTransition(async () => {
      const result = await toggleInviteAction(invite.id);
      if (result?.error) toast.error(result.error);
      else toast.success(result?.success ?? "تم");
      router.refresh();
    });
  };

  const remove = () => {
    startTransition(async () => {
      const result = await deleteInviteAction(invite.id);
      if (result?.error) toast.error(result.error);
      else toast.success(result?.success ?? "الكود اتمسح");
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={copy}
        className="size-8 rounded-[4px] text-muted-foreground/70 hover:bg-accent/10 hover:text-primary"
        aria-label="انسخ لينك الدعوة"
      >
        <Copy className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggle}
        disabled={pending}
        className="size-8 rounded-[4px] text-muted-foreground/70 hover:bg-accent/10 hover:text-primary"
        aria-label={invite.active ? "أوقف الكود" : "فعّل الكود"}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Power className="size-3.5" />
        )}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8 rounded-[4px] text-muted-foreground/70 hover:bg-accent/10 hover:text-primary"
            aria-label="امسح الكود"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-[4px] border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>تمسح الكود {invite.code}؟</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground/70">
              اللينك هيتوقف على طول. الأعضاء اللي دخلوا بيه مش هيتأثروا.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[4px] border-border bg-transparent">سيبها</AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              className="rounded-[4px] bg-primary text-primary-foreground hover:bg-primary/90"
            >
              امسحه
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

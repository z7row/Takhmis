"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
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
import { deleteMemberAction } from "@/actions/admin";
import { toast } from "sonner";

export function MemberDeleteButton({
  memberId,
  nickname,
}: {
  memberId: string;
  nickname: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const remove = () => {
    startTransition(async () => {
      const result = await deleteMemberAction(memberId);
      if (result?.error) toast.error(result.error);
      else toast.success(result?.success ?? "العضو اتمسح");
      router.refresh();
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 rounded-[4px] text-muted-foreground/70 hover:bg-accent/10 hover:text-primary"
          aria-label={`حذف ${nickname}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[4px] border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>تحذير: حذف {nickname}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground/70">
            حساب العضو وكل بياناته (إثباتات، عادات، تفاعلات) هتتشال نهائيًا. مفيش
            رجوع.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-[4px] border-border bg-transparent">خلاص لا</AlertDialogCancel>
          <AlertDialogAction
            onClick={remove}
            disabled={pending}
            className="rounded-[4px] bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            امسح العضو
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

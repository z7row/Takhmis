"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deleteHangoutAction } from "@/actions/radar";
import { HangoutDialog, type HangoutDraft } from "./hangout-dialog";
import { toast } from "sonner";

export function HangoutAdminActions({ hangout }: { hangout: HangoutDraft }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const remove = () => {
    startTransition(async () => {
      const result = await deleteHangoutAction(hangout.id);
      if (result?.error) toast.error(result.error);
      else toast.success(result?.success ?? "الخروجة اتلغت");
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 shrink-0 rounded-full text-muted-foreground/60 hover:text-foreground"
          aria-label="خيارات الخروجة"
        >
          <MoreVertical className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-40 rounded-[4px] border-border bg-card p-1"
      >
        <HangoutDialog
          hangout={hangout}
          trigger={
            <DropdownMenuItem
              onSelect={(event) => event.preventDefault()}
              className="rounded-[4px] text-[11.5px]"
            >
              <Pencil className="size-3.5" />
              عدّل الخروجة
            </DropdownMenuItem>
          }
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(event) => event.preventDefault()}
              className="rounded-[4px] text-[11.5px] text-destructive focus:text-destructive"
            >
              <Trash2 className="size-3.5" />
              الغِ الخروجة
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[10px] border-border bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>تلغي الخروجة؟</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground/70">
                الخروجة هتختفي من الرادار وردود الشلة عليها.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-[4px] border-border bg-background">لا، سيبها</AlertDialogCancel>
              <AlertDialogAction
                onClick={remove}
                disabled={pending}
                className="rounded-[4px] bg-primary text-primary-foreground hover:bg-primary/90"
              >
                الغِها
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

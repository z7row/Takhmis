"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCommentAction } from "@/actions/social";
import { deleteProofPostAction } from "@/actions/proofs";
import { toast } from "sonner";

export function AdminDeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await deleteProofPostAction(postId);
          if (result?.error) toast.error(result.error);
          else toast.success(result?.success ?? "المنشور اتشال");
          router.refresh();
        })
      }
      className="size-8 shrink-0 rounded-[4px] text-muted-foreground/70 hover:bg-accent/10 hover:text-primary"
      aria-label="امسح المنشور"
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5" />
      )}
    </Button>
  );
}

export function AdminDeleteCommentButton({ commentId }: { commentId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await deleteCommentAction(commentId);
          if (result?.error) toast.error(result.error);
          else toast.success("التعليق اتشال");
          router.refresh();
        })
      }
      className="size-8 shrink-0 rounded-[4px] text-muted-foreground/70 hover:bg-accent/10 hover:text-primary"
      aria-label="امسح التعليق"
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5" />
      )}
    </Button>
  );
}

"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, SendHorizontal } from "lucide-react";
import { createPostAction } from "@/actions/social";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import type { PublicUser } from "@/lib/user";
import type { ActionState } from "@/lib/validation";
import { toast } from "sonner";

export function CreatePost({ viewer }: { viewer: PublicUser }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createPostAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.success);
      formRef.current?.reset();
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="rounded-[6px] border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <UserAvatar user={viewer} className="mt-1 size-10 rounded-full" />
        <div className="min-w-0 flex-1 space-y-3">
          <Textarea
            name="body"
            maxLength={1000}
            placeholder="اكتب منشور للشلة..."
            className="min-h-[96px] resize-y rounded-[4px] border-border bg-[var(--code-bg)]/20 px-3 py-2 text-[15px] leading-7"
          />
          <div className="flex items-center justify-end">
            <Button type="submit" disabled={pending} className="h-9 gap-2 rounded-[3px] px-4">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
              انشر
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

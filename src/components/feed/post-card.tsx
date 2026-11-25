"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import {
  BellRing,
  Camera,
  Clapperboard,
  Flame,
  HandMetal,
  Heart,
  Laugh,
  MessageCircle,
  Moon,
  Send,
  Sparkles,
  ThumbsUp,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { TitleBadge } from "@/components/title-badge";
import { TimeAgo } from "@/components/time-ago";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  addCommentAction,
  deleteCommentAction,
  pingPostAuthorAction,
  toggleReactionAction,
} from "@/actions/social";
import { deleteProofPostAction } from "@/actions/proofs";
import { REACTION_EMOJIS } from "@/lib/constants";
import { dayLabel } from "@/lib/dates";
import type { FeedPost } from "@/lib/queries/feed";
import type { PublicUser } from "@/lib/user";
import type { ActionState } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const REACTION_ICONS: Record<string, React.ElementType> = {
  "🔥": Flame,
  "💪": HandMetal,
  "😂": Laugh,
  "❤️": Heart,
  "👏": ThumbsUp,
  "🫡": Clapperboard,
};

function ReactionBar({ post }: { post: FeedPost }) {
  const router = useRouter();
  const [summary, setSummary] = useState(post.reactions);
  const [mine, setMine] = useState(post.myReaction);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setSummary(post.reactions);
    setMine(post.myReaction);
  }, [post.reactions, post.myReaction]);

  const react = (emoji: string) => {
    if (pending) return;
    const next = new Map(summary.map((r) => [r.emoji, r.count]));
    if (mine) {
      const left = (next.get(mine) ?? 1) - 1;
      if (left <= 0) next.delete(mine);
      else next.set(mine, left);
    }
    if (mine !== emoji) next.set(emoji, (next.get(emoji) ?? 0) + 1);

    setSummary(
      [...next.entries()]
        .map(([e, count]) => ({ emoji: e, count }))
        .sort((a, b) => b.count - a.count),
    );
    setMine(mine === emoji ? null : emoji);

    startTransition(async () => {
      const result = await toggleReactionAction(post.id, emoji);
      if (result?.error) {
        toast.error(result.error);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {REACTION_EMOJIS.map((emoji) => {
        const count = summary.find((r) => r.emoji === emoji)?.count ?? 0;
        const active = mine === emoji;
        const Icon = REACTION_ICONS[emoji] ?? Flame;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => react(emoji)}
            className={cn(
              "flex h-9 items-center gap-1 rounded-full border px-2.5 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] transition-colors",
              active
                ? "border-primary/50 bg-accent/20 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-accent/10 hover:text-foreground",
            )}
            aria-label={`ريأكشن ${emoji}`}
            aria-pressed={active}
          >
            <Icon className="size-3.5" />
            {count > 0 && <span className="num text-[10px] font-semibold">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

function CommentSection({ post, viewer }: { post: FeedPost; viewer: PublicUser }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addCommentAction,
    null,
  );
  const [deleting, startDelete] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [comments, setComments] = useState(post.comments);
  const lastSubmittedRef = useRef("");

  useEffect(() => {
    setComments(post.comments);
  }, [post.comments]);

  useEffect(() => {
    if (state?.success) {
      const body = lastSubmittedRef.current.trim();
      if (body) {
        setComments((prev) => [
          ...prev,
          {
            id: `tmp-${Date.now()}`,
            body,
            createdAt: Date.now(),
            author: {
              id: viewer.id,
              nickname: viewer.nickname,
              avatarUrl: viewer.avatarUrl,
              title: viewer.title,
              titleEmoji: viewer.titleEmoji,
              titleTone: viewer.titleTone,
            },
          },
        ]);
      }
      if (inputRef.current) inputRef.current.value = "";
      lastSubmittedRef.current = "";
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router, viewer]);

  const removeComment = (id: string) => {
    startDelete(async () => {
      const result = await deleteCommentAction(id);
      if (result?.error) toast.error(result.error);
      else {
        setComments((prev) => prev.filter((c) => c.id !== id));
        toast.success("التعليق اتشال");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3 border-t border-border/60 px-4 py-3">
      <div className="flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] text-muted-foreground">
        <MessageCircle className="size-3.5" />
        {comments.length > 0 ? `${comments.length} تعليق` : "أول تعليق؟"}
      </div>

      {comments.length > 0 && (
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="group flex items-start gap-2">
              <UserAvatar user={comment.author} className="mt-0.5 size-7 rounded-full" />
              <div className="min-w-0 flex-1 border-b border-border/60 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-semibold">{comment.author.nickname}</span>
                  <TitleBadge
                    title={comment.author.title}
                    emoji={comment.author.titleEmoji}
                    tone={comment.author.titleTone}
                    size="xs"
                  />
                  <TimeAgo date={comment.createdAt} className="ms-auto text-[10px] text-muted-foreground/70" />
                  {(viewer.role === "admin" || viewer.id === comment.author.id) && (
                    <button
                      onClick={() => removeComment(comment.id)}
                      disabled={deleting}
                      className="rounded-full p-1 text-muted-foreground/70 opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                      aria-label="امسح التعليق"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
                <p className="mt-0.5 whitespace-pre-line text-[13px] leading-6 text-foreground/90">
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        action={formAction}
        onSubmit={(e) => {
          const form = e.currentTarget;
          const body = String(new FormData(form).get("body") ?? "");
          lastSubmittedRef.current = body;
        }}
        className="flex items-center gap-2"
      >
        <input type="hidden" name="postId" value={post.id} />
        <UserAvatar user={viewer} className="size-7 shrink-0 rounded-full" />
        <Input
          ref={inputRef}
          name="body"
          placeholder="اكتب تعليق قصير..."
          maxLength={280}
          className="h-9 flex-1 rounded-[4px] px-3 text-[13px]"
        />
        <Button type="submit" size="icon-sm" disabled={pending} className="size-9 shrink-0 rounded-full" aria-label="ابعث التعليق">
          <Send className="size-3.5" />
        </Button>
      </form>
    </div>
  );
}

export function PostCard({
  post,
  viewer,
  onDeleted,
}: {
  post: FeedPost;
  viewer: PublicUser;
  onDeleted?: (id: string) => void;
}) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [adminPending, startAdmin] = useTransition();
  const isSlack = post.type === "slack";
  const isWeekly = post.type === "weekly";
  const isSystem = post.type === "system";
  const isPost = post.type === "post";
  const imageSrc = post.imageUrl ?? post.author?.avatarUrl ?? "/brand/logo-mark.png";

  const removePost = () => {
    startAdmin(async () => {
      const result = await deleteProofPostAction(post.id);
      if (result?.error) toast.error(result.error);
      else {
        toast.success(result?.success ?? "المنشور اتشال");
        onDeleted?.(post.id);
        router.refresh();
      }
    });
  };

  const ping = () => {
    startAdmin(async () => {
      const result = await pingPostAuthorAction(post.id);
      if (result?.error) toast.error(result.error);
      else toast.success(result?.success ?? "تم التحفيل 🔔");
    });
  };

  if (isSystem) {
    return (
      <article className="flex items-center gap-3 rounded-[6px] border border-border bg-card px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background">
          <Sparkles className="size-4 text-primary" />
        </span>
        <p className="min-w-0 flex-1 text-[12px] leading-5 text-foreground/90">{post.body}</p>
        <TimeAgo date={post.createdAt} className="shrink-0 text-[10px] text-muted-foreground" />
      </article>
    );
  }

  const actionBar = (
    <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
      <ReactionBar post={post} />
      <div className="ms-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments((v) => !v)}
          className={cn("h-9 gap-1 rounded-full px-3 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] text-muted-foreground hover:text-foreground", showComments && "bg-accent/10 text-foreground")}
        >
          <MessageCircle className="size-3.5" />
          {post.comments.length > 0 ? post.comments.length : "علّق"}
        </Button>
        {isSlack && (
          <Button variant="ghost" size="sm" onClick={ping} disabled={adminPending} className="h-9 gap-1 rounded-full px-3 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] text-primary">
            <BellRing className="size-3.5" />
            حفّله
          </Button>
        )}
        {viewer.role === "admin" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="size-9 rounded-full text-muted-foreground hover:text-primary" aria-label="امسح المنشور">
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[4px] border-border bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle>متأكد من مسح المنشور؟</AlertDialogTitle>
                <AlertDialogDescription>المنشور هيتشال من الفيد نهائياً. لو كان إثبات، النقاط المرتبطة بيه هتتشال كمان.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-[3px]">خلاص لا</AlertDialogCancel>
                <AlertDialogAction onClick={removePost} className="rounded-[3px]">امسحه</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );

  const comments = showComments ? <CommentSection post={post} viewer={viewer} /> : null;

  const meta = isWeekly
    ? { icon: Trophy, label: "نتيجة الأسبوع" }
    : isSlack
      ? { icon: Moon, label: "منشور تقصير" }
      : isPost
        ? { icon: MessageCircle, label: "منشور" }
        : { icon: Camera, label: post.habit ? `وثّق ${post.habit.title}` : "إثبات عادة" };
  const MetaIcon = meta.icon;

  return (
    <article className="overflow-hidden rounded-[6px] border border-border bg-card">
      <div className="flex items-center gap-3 px-4 pt-4">
        <UserAvatar user={post.author ?? { nickname: "?" }} className="size-10 rounded-full" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-[family-name:var(--font-display)] text-[20px] font-bold leading-tight">{post.author?.nickname ?? "الشلة"}</span>
            {post.author && <TitleBadge title={post.author.title} emoji={post.author.titleEmoji} tone={post.author.titleTone} size="xs" />}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MetaIcon className="size-3.5" />
            <span className="truncate">{meta.label}</span>
            <span>·</span>
            <TimeAgo date={post.createdAt} />
          </div>
        </div>
        {post.proofPoints ? (
          <span className="flex items-center gap-1 rounded-[3px] border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-primary">
            <Flame className="size-3.5" />+{post.proofPoints}
          </span>
        ) : null}
      </div>

      <p className={cn("px-4 pt-3 font-[family-name:var(--font-sans)] text-[16px] leading-[1.7] text-foreground/90 [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden", isPost ? "pb-4 [-webkit-line-clamp:6]" : "pb-3 [-webkit-line-clamp:3]")}>
        {post.body || (isSlack ? "مفيش إثبات النهاردة." : "تحديث جديد من الشلة.")}
      </p>

      {(!isPost || post.imageUrl) && (
        <Dialog open={lightbox} onOpenChange={setLightbox}>
          <DialogTrigger asChild>
            <button type="button" className="block w-full border-y border-border bg-background" aria-label="افتح الصورة">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={post.body ?? "صورة المنشور"}
                loading="lazy"
                className="max-h-[320px] w-full object-cover"
              />
            </button>
          </DialogTrigger>
          <DialogContent showCloseButton={false} className="max-w-[min(94vw,720px)] border-none bg-transparent p-0">
            <DialogTitle className="sr-only">صورة المنشور</DialogTitle>
            <div className="overflow-hidden rounded-[6px] border border-border bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc} alt={post.body ?? "صورة المنشور"} className="max-h-[82dvh] w-full object-contain bg-background" />
              <div className="flex items-center justify-between gap-3 border-t border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold">{post.author?.nickname ?? "الشلة"}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{meta.label} · <TimeAgo date={post.createdAt} /></p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => setLightbox(false)} className="rounded-full" aria-label="اقفل">
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {actionBar}
      {comments}
    </article>
  );
}

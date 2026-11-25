import { cn } from "@/lib/utils";
import { initials } from "@/lib/dates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type AvatarUser = {
  nickname: string;
  avatarUrl?: string | null;
};

export function UserAvatar({
  user,
  className,
  fallbackClassName,
  ring = false,
}: {
  user: AvatarUser;
  className?: string;
  fallbackClassName?: string;
  ring?: boolean;
}) {
  return (
    <Avatar
      className={cn(
        "size-10 rounded-full border border-border",
        ring && "ring-1 ring-primary/40",
        className,
      )}
    >
      {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.nickname} /> : null}
      <AvatarFallback
        className={cn(
          "bg-accent/20 text-sm font-bold text-foreground",
          fallbackClassName,
        )}
      >
        {initials(user.nickname)}
      </AvatarFallback>
    </Avatar>
  );
}

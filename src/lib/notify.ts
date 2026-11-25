import "server-only";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";

type NotifyInput = {
  type: string;
  title: string;
  body?: string;
  href?: string;
};

export function notifyUsers(userIds: string[], input: NotifyInput) {
  const unique = [...new Set(userIds)];
  if (!unique.length) return;
  db.insert(notifications)
    .values(
      unique.map((userId) => ({
        userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        href: input.href ?? null,
      })),
    )
    .run();
}

export function notifyEveryoneExcept(input: NotifyInput, exceptUserId: string) {
  const recipients = db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.disabled, false), ne(users.id, exceptUserId)))
    .all()
    .map((u) => u.id);
  notifyUsers(recipients, input);
}

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { eq, lt, or, isNull, and } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

const COOKIE_NAME = "takhmis_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ??
    "takhmis-dev-secret-change-me-please-32-chars-min",
);

export type SessionUser = typeof users.$inferSelect;

export async function createSession(userId: string) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE_NAME);
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const uid = payload.uid;
    if (typeof uid !== "string") return null;

    const user = await db.query.users.findFirst({
      where: eq(users.id, uid),
    });

    if (!user || user.disabled) return null;

    // تحديث خفيف لآخر ظهور (مرة كل ٣ دقايق)
    const stale =
      !user.lastSeenAt ||
      Date.now() - new Date(user.lastSeenAt).getTime() > 3 * 60 * 1000;
    if (stale) {
      await db
        .update(users)
        .set({ lastSeenAt: new Date() })
        .where(eq(users.id, user.id));
    }

    return user;
  } catch {
    return null;
  }
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/feed");
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

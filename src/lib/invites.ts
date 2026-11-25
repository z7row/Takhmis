import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { invites, users } from "@/db/schema";

export type InviteCheck =
  | {
      valid: true;
      code: string;
      note: string | null;
      inviterName: string | null;
      remaining: number;
    }
  | { valid: false; reason: string; code: string };

export function checkInvite(codeInput: string): InviteCheck {
  const code = codeInput.trim().toUpperCase();
  const row = db
    .select({
      invite: invites,
      creatorName: users.nickname,
    })
    .from(invites)
    .leftJoin(users, eq(users.id, invites.createdBy))
    .where(eq(invites.code, code))
    .get();

  if (!row) {
    return { valid: false, reason: "الكود ده مش موجود — اتأكد من الحروف", code };
  }
  if (!row.invite.active) {
    return {
      valid: false,
      reason: "الدعوة دي اتقفلت أو استُخدمت قبل كده",
      code,
    };
  }
  if (row.invite.expiresAt && new Date(row.invite.expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: "الدعوة دي انتهت صلاحيتها", code };
  }
  if (row.invite.uses >= row.invite.maxUses) {
    return { valid: false, reason: "الدعوة دي وصلت للحد الأقصى", code };
  }

  return {
    valid: true,
    code,
    note: row.invite.note,
    inviterName: row.creatorName,
    remaining: row.invite.maxUses - row.invite.uses,
  };
}

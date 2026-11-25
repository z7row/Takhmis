import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function normalizeNickname(nickname: string): string {
  return nickname.trim().replace(/\s+/g, " ").toLocaleLowerCase("ar");
}

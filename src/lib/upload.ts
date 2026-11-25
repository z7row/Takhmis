import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import sharp, { type Metadata } from "sharp";
import { randomUUID } from "node:crypto";
import { dayKey } from "./dates";

const ALLOWED = new Set(["jpeg", "png", "webp", "avif"]);

export async function saveImage(
  file: File,
  kind: "proof" | "avatar",
): Promise<string> {
  if (!file || typeof file === "string" || file.size === 0) {
    throw new Error("اختار صورة الأول");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("الصورة كبيرة أوي — ١٢ ميجا كحد أقصى");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let meta: Metadata;
  try {
    meta = await sharp(buffer).metadata();
  } catch {
    throw new Error("الملف ده مش صورة صحيحة");
  }

  if (!meta.format || !ALLOWED.has(meta.format)) {
    throw new Error("الصيغة دي مش مدعومة — استخدم JPG أو PNG أو WebP");
  }

  const now = new Date();
  const subdir =
    kind === "avatar"
      ? "uploads/avatars"
      : `uploads/${dayKey(now).slice(0, 7)}`;
  const dir = path.join(process.cwd(), "public", subdir);
  await fs.mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.webp`;
  const fullPath = path.join(dir, filename);

  if (kind === "avatar") {
    await sharp(buffer)
      .rotate()
      .resize(512, 512, { fit: "cover", position: "attention" })
      .webp({ quality: 86 })
      .toFile(fullPath);
  } else {
    await sharp(buffer)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(fullPath);
  }

  return `/${subdir}/${filename}`;
}

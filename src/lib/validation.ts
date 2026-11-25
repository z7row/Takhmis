import { z } from "zod";

export const nicknameSchema = z
  .string()
  .trim()
  .min(2, "الاسم لازم يكون حرفين على الأقل")
  .max(24, "الاسم طويل أوي — ٢٤ حرف كحد أقصى")
  .regex(
    /^[\p{L}\p{N} _\-\.]+$/u,
    "الاسم ينفع يكون حروف أو أرقام أو مسافات أو _ - .",
  );

export const passwordSchema = z
  .string()
  .min(6, "كلمة السر لازم ٦ حروف على الأقل")
  .max(72, "كلمة السر طويلة أوي");

export const inviteCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{4,32}$/, "كود الدعوة مش صحيح");

export const habitInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "اسم العادة قصير أوي")
    .max(40, "اسم العادة طويل أوي — ٤٠ حرف كحد أقصى"),
  emoji: z.string().trim().min(1).max(12).default("🎯"),
});

export const habitsPayloadSchema = z
  .array(habitInputSchema)
  .min(1, "اختار عادة واحدة على الأقل")
  .max(20, "٢٠ عادة كحد أقصى");

export const loginSchema = z.object({
  nickname: z.string().trim().min(1, "اكتب اسمك"),
  password: z.string().min(1, "اكتب كلمة السر"),
});

export const registerSchema = z
  .object({
    code: inviteCodeSchema,
    nickname: nicknameSchema,
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "كلمتين السر مش متطابقين",
    path: ["confirm"],
  });

export const captionSchema = z
  .string()
  .trim()
  .max(160, "التعليق طويل أوي — ١٦٠ حرف كحد أقصى")
  .optional()
  .transform((v) => v ?? "");

export const postBodySchema = z
  .string()
  .trim()
  .min(1, "اكتب حاجة الأول")
  .max(1000, "المنشور طويل أوي — ١٠٠٠ حرف كحد أقصى");

export const commentSchema = z
  .string()
  .trim()
  .min(1, "اكتب تعليق الأول")
  .max(280, "التعليق طويل أوي");

export const statusSchema = z.object({
  kind: z.enum(["free", "busy", "need_company", "custom"]),
  message: z
    .string()
    .trim()
    .max(120, "الرسالة طويلة أوي — ١٢٠ حرف كحد أقصى")
    .optional(),
  place: z
    .string()
    .trim()
    .max(80, "اسم المكان طويل أوي")
    .optional(),
  hours: z.coerce.number().min(0.5).max(24).default(1),
});

export const hangoutSchema = z.object({
  title: z.string().trim().min(2, "اكتب اسم الخروجة").max(80),
  place: z.string().trim().max(100).optional(),
  startsAt: z.string().min(1, "اختار الميعاد"),
  notes: z.string().trim().max(300).optional(),
});

export const rewardSchema = z
  .string()
  .trim()
  .min(2, "اكتب مكافأة الأسبوع")
  .max(160, "النص طويل أوي");

export const inviteSchema = z.object({
  maxUses: z.coerce.number().int().min(1).max(100).default(1),
  note: z.string().trim().max(80).optional(),
  expiresInDays: z.coerce.number().int().min(0).max(365).default(14),
});

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "البيانات مش مظبوطة";
}

export type HabitInput = z.infer<typeof habitInputSchema>;
export type ActionState = { error?: string; success?: string } | null;

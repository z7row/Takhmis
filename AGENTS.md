# AGENTS.md — تعليمات الشغل على Takhmis

## قبل أي حاجة
**اقرأ `PROJECT_CONTEXT.md` بالكامل.** فيه حالة المشروع، القرارات المعمارية، اللي خلص، اللي ناقص، والخطوة التالية. لو السياق اتقطع أو بدأت جلسة جديدة، الملف ده هو نقطة البداية.

## قواعد سريعة
- المشروع **عربي RTL** و**dark-only** — التزم بمنطق `start/end` و`ps/pe/ms/me`.
- الستاك: Next.js 16 (App Router + Server Actions) · React 19 · Tailwind v4 · shadcn/ui · framer-motion · Drizzle + SQLite (better-sqlite3) · jose auth · sharp uploads.
- **ممنوع** تغيير الباليت أو الخطوط من غير طلب. التوكنز في `src/app/globals.css`.
- استخدم `@/lib/utils` للـ `cn` (مش باكدج `cn`).
- أي صفحة/إجراء جديد لازم يتأكد من الجلسة (`requireUser`) أو الأدمن (`requireAdmin`).
- أي تعديل على النقاط/الستريك/الألقاب لازم يمر على `syncTitles()` والـ revalidation المناسب.
- uploads محلية في `public/uploads` — متحاولش ترفع الملفات على خدمة خارجية من غير طلب.
- التزم بأسلوب الكود الحالي: server actions في `src/actions`، queries في `src/lib/queries`، DTOs صريحة، ورسائل عربية مصرية ودودة.
- بعد أي شغل: `npx tsc --noEmit`، وبعد كده اختبار المتصفح محليًا قبل التسليم.

## أوامر أساسية
```bash
npm run dev
npm run typecheck
npm run db:migrate
npm run db:seed
npm run build
```

## بيانات الدخول المحلية
- أدمن: `الأدمن` / `takhmis123`
- ديمو: `يوسف` / `123456` (وكذلك عمر، زياد، كريم، نور، مروان)
- كود الدعوة: `TAKHMIS`

## مراجع
- حالة المشروع وخطة العمل: **`PROJECT_CONTEXT.md`**
- التصميم (لازم يتعمل): `design.md` (لسه ناقص — مطلوب من صاحب المشروع)
- تشغيل ونشر: `README.md` (لسه ناقص)

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

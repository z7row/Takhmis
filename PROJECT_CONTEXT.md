# PROJECT_CONTEXT — Takhmis (تخميس)

> **اقرأ الملف ده بالكامل قبل أي شغل جديد على المشروع.**
> آخر تحديث: 2026-11-25 (إعادة تصميم UI لنظام Raycast المسطّح بالباليت البنفسجي + بناء الصفحات الأساسية).

---

## 1) المشروع في سطر

**تخميس** منصة اجتماعية مصغرة (PWA) لشلة أصحاب، بتجمع بين:
تتبّع ٣ عادات يومية بالصور، ستريك + كروت جوكر، فيد اجتماعي، رهان أسبوعي بمكافأة، رادار "مين فاضي دلوقتي"، تنظيم خروجات، ولوحة أدمن كاملة.
الواجهة **عربية RTL** بالكامل، **dark-only**، بهوية بصرية بنفسجية مبنية على اللوجو (الأوركا).

- الاسم: تخميس / Takhmis
- الشعار: أوركا بنفسجي (الملفات موجودة في `public/brand/`)
- التاجلاين: «شلتك، عاداتك، وخروجاتك — في مكان واحد.»
- فلسفة المنتج: «مفيش زر تم. لازم صورة إثبات من نفس اليوم.»

---

## 2) قرارات معمارية مهمة — متغيّرهاش من غير سبب

| البند | القرار |
|---|---|
| Framework | **Next.js 16.4.6** (App Router + Server Actions + Turbopack) |
| React | 19.3.1 |
| Styling | **Tailwind CSS v4.3.5** (CSS-first، مفيش `tailwind.config`) + `tw-animate-css` |
| UI | **shadcn/ui** (style: new-york) + lucide-react + sonner + framer-motion 14 |
| DB | **SQLite** عبر **better-sqlite3 13.2** + **Drizzle ORM 0.45.4** |
| DB file | `data/takhmis.db` (يتعمل أوتوماتيك، ومش بيتعمله commit) |
| Auth | **جلسة JWT مخصصة** عبر `jose` في cookie httpOnly اسمها `takhmis_session` (مش NextAuth) |
| Passwords | `bcryptjs` (10 rounds) |
| Validation | `zod` v4 |
| Uploads | **Local filesystem** في `public/uploads/...` + معالجة بـ `sharp` → WebP |
| Timezone | `Africa/Cairo` (اليوم بيتحسب بـ `Intl`، مش UTC) |
| PWA | manifest من `src/app/manifest.ts` + `public/sw.js` + `public/offline.html` |
| Fonts | `@fontsource-variable/cairo` (كل النصوص) + `@fontsource-variable/space-grotesk` (الأرقام/Latin) |
| Icons | lucide-react |
| Animations | framer-motion + CSS keyframes |
| Language | عربي مصري ودود، RTL (`html dir="rtl"`)، أرقام لاتينية عبر locale `ar-EG-u-nu-latn` |

> ملاحظة: shadcn CLI الحديث بيولّد imports من باكدج `cn`، لكننا استبدلناها كلها بـ `@/lib/utils`. لو ضفت مكون shadcn جديد، بدّل `from "cn"` إلى `from "@/lib/utils"`.

### إعدادات مهمة
- `next.config.ts`: `serverExternalPackages: ["better-sqlite3"]` + `bodySizeLimit: "12mb"`.
- `npm` الجديد هنا بيمنع install scripts افتراضيًا؛ تمت الموافقة على `better-sqlite3` و`esbuild` عبر `allowScripts` في `package.json`.
- المشروع بيستخدم `process.loadEnvFile()` في seed + Next بيقرأ `.env` عادي.
- `.env` موجود محليًا (مش هيترفع). `.env.example` فيه القيم المطلوبة.

---

## 3) التشغيل والبيانات

```bash
npm install
npm run db:migrate     # يطبّق drizzle/
npm run db:seed        # ينشئ الأدمن + كود الدعوة + ديمو الشلة
npm run dev            # http://localhost:3000
npm run typecheck      # tsc --noEmit (شغال حاليًا بدون أخطاء)
npm run build
npm run start
```

### بيانات الدخول الحالية (بعد seed)
- **الأدمن:** الاسم `الأدمن` / كلمة السر `takhmis123`
- **أعضاء الديمو:** `يوسف`، `عمر`، `زياد`، `كريم`، `نور`، `مروان` / كلمة السر `123456`
- **كود الدعوة:** `TAKHMIS` (maxUses=100)
- **رابط دعوة:** `/join/TAKHMIS`
- `SESSION_SECRET` متولّد في `.env` المحلي.
- الديمو فيه: 6 أعضاء + 22 إثبات + بوستات تقصير + رياكشنز + تعليقات + ستاتوسات + خروجة + أسبوع مغلق سابق + أسبوع نشط.

> **مهم:** آخر تعديل على خوارزمية الألقاب (`computeTitles`) حصل **بعد** تشغيل seed. لازم تشغّل `npm run db:seed` مرة تانية (آمن/idempotent) عشان الألقاب تتزامن، وساعتها `مروان` المفروض يبقى «البطاطس 🥔» لأنه آخر مشارك حقيقي، والأدمن «المبتدئ 🌱».

---

## 4) الهوية البصرية / الـ Design System

### الباليت المعتمد (المستخدم الفعلي)
| Hex | الاستخدام | Token |
|---|---|---|
| `#190019` | خلفية أساسية + كروت + سايدبار | `--background`, `--card`, `--sidebar` |
| `#522B5B` | حدود / عناصر ثانوية / أسطح مرتفعة | `--border`, `--input`, `--muted` |
| `#854F6C` | Accent / تمييز | `--accent` |
| `#DFB6B2` | Primary / نصوص ثانوية | `--primary` |
| `#FBE4D8` | نصوص وعناوين | `--foreground` |

- القيم محوّلة إلى **OKLCH** وموجودة في `src/app/globals.css` (شامل `.dark` + `@theme inline` + sidebar tokens).
- الـ design الأصلي مأخوذ من `npx getdesign@latest add raycast` (تم تطبيق روحه: dark glass, command-palette vibes, rounded, subtle glows) وتم استبدال ألوانه الخضراء بالباليت البنفسجي المطلوب.
- خط عربي: **Cairo Variable**، وأرقام/Latin: **Space Grotesk Variable**.
- `--radius: 0.875rem`. مكوّنات ناعمة/كبيرة (rounded-2xl/3xl).
- كلاسات مساعدة في `globals.css`: `.glass`, `.glass-strong`, `.surface`, `.surface-hover`, `.text-gradient`, `.noise-overlay`, `.num`, `.card-sheen`, `.stripe-bg`.
- خلفية الجسم: radial gradients بنفسجية + طبقة noise خفيفة.
- الشعار: `public/brand/logo.png` (transparent)، `logo-mark.png` (مقصوص وأفقي)، `logo-full.png`، `og.png`.
- أيقونات PWA: `public/icons/icon-{64,192,512}.png`, `maskable-512.png`, `apple-touch-icon.png` + `src/app/icon.png` + `src/app/apple-icon.png`.
- الأيقونات اتولدت بـ `node scripts/make-icons.mjs`، وصور الديمو بـ `node scripts/make-demo-assets.mjs`.

### قواعد UI
- RTL دايمًا. استخدم logical properties (`start/end`, `ps/pe`, `ms/me`) مش left/right.
- الموبايل: topbar بسيط + bottom nav عائم + FAB. الديسكتوب: sidebar 288px على اليمين + topbar + محتوى.
- الحوارات: خلفية `bg-popover/95` + `backdrop-blur-xl` + border بنفسجي شفاف.
- الأزرار الأساسية: خلفية كريمي `--primary` ونص غامق.
- استخدام الإيموجي مسموح وبيركب مع الشخصية المرحة، بس من غير مبالغة.

---

## 5) خريطة الملفات الحالية

```
.
├── AGENTS.md                     ← تعليمات الشغل (بيشاور على الملف ده)
├── PROJECT_CONTEXT.md            ← الملف ده
├── .env / .env.example
├── package.json
├── next.config.ts
├── tsconfig.json                 ← paths: @/* → src/*
├── postcss.config.mjs
├── components.json               ← shadcn
├── drizzle.config.ts
├── drizzle/                      ← migration مولّدة (0000_...)
├── data/takhmis.db               ← SQLite (محلي)
├── scripts/
│   ├── migrate.ts
│   ├── seed.ts                   ← async main() بسبب CJS
│   ├── make-icons.mjs
│   └── make-demo-assets.mjs
├── public/
│   ├── brand/                    ← اللوجو + OG
│   ├── icons/                    ← PWA icons
│   ├── demo/                     ← 8 proof SVGs + 8 avatars
│   ├── sw.js
│   └── offline.html
└── src/
    ├── app/
    │   ├── layout.tsx            ← RTL, fonts, Toaster, TooltipProvider, PWA
    │   ├── globals.css
    │   ├── page.tsx              ← redirect حسب الجلسة
    │   ├── manifest.ts
    │   ├── icon.png / apple-icon.png
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   └── join/[code]/page.tsx
    │   └── (app)/
    │       └── layout.tsx        ← requireUser + shell + notifications
    ├── actions/
    │   ├── auth.ts               ← register/login/logout/presence
    │   ├── proofs.ts             ← submitProof + admin delete
    │   ├── social.ts             ← reactions/comments/ping/notifications read
    │   ├── habits.ts             ← edit habits/profile/password
    │   ├── radar.ts              ← statuses/RSVP/hangouts
    │   └── admin.ts              ← invites/members/week close/broadcast/rollover
    ├── components/
    │   ├── ui/                   ← shadcn المولّد
    │   ├── auth/                 ← auth-hero, login-form, register-flow (3 خطوات)
    │   ├── brand/logo.tsx
    │   ├── feed/post-card.tsx    ← ✅ معمول
    │   ├── feed/quick-proof-dialog.tsx ← ✅ معمول
    │   ├── layout/               ← app-shell, sidebar, topbar, mobile-nav, notification-bell, nav-items
    │   ├── pwa/                  ← register + install-pwa
    │   ├── page-transition.tsx
    │   ├── user-avatar.tsx
    │   ├── title-badge.tsx
    │   ├── time-ago.tsx
    │   ├── submit-button.tsx
    │   └── empty-state.tsx
    ├── db/
    │   ├── schema.ts             ← 16 جدول
    │   └── index.ts              ← singleton + WAL + FK
    └── lib/
        ├── auth.ts, password.ts, validation.ts
        ├── constants.ts, dates.ts, streak.ts, titles.ts
        ├── rollover.ts, week.ts, notify.ts
        ├── upload.ts, invites.ts, user.ts, utils.ts
        └── queries/
            ├── feed.ts, habits.ts, radar.ts, profile.ts, admin.ts, notifications.ts
```

---

## 6) الداتا موديل (Drizzle / SQLite)

الملف: `src/db/schema.ts` — **16 جدول**:

1. **users**: `nickname/nicknameKey` (unique), `passwordHash`, `avatarUrl`, `role` (admin/member), `points` (نقاط الأسبوع), `lifetimePoints`, `streak`, `longestStreak`, `lastStreakDay`, `jokers`, `wins`, `proofsCount`, `title/titleEmoji/titleTone`, **`titleLocked`**, `disabled`, `joinDay`, `lastSeenAt`, `createdAt`.
2. **invites**: كود فريد + `maxUses/uses/active/expiresAt/note/createdBy`.
3. **habits**: ملك العضو، `title/emoji/position/archived`.
4. **proofs**: `(userId, habitId, day)` **unique**، `imageUrl`, `caption`, `points`, `fullDay`, `createdAt`.
5. **posts**: types: `proof | slack | weekly | system`، `body/imageUrl/proofId/habitId/day/deleted`.
6. **reactions**: unique `(postId,userId)` — رياكشن واحد لكل عضو لكل بوست.
7. **comments**: soft delete.
8. **statuses**: kind `free|busy|need_company|custom`, `active`, `expiresAt`.
9. **hangouts**: title/place/startsAt/notes/active/createdBy.
10. **hangout_rsvps**: PK `(hangoutId,userId)` + status `going|faks`.
11. **notifications**: type/title/body/href/read.
12. **weeks**: startDay/endDay/reward/status active|closed/winnerId/closedAt.
13. **week_results**: snapshot points/rank/title لكل عضو في أسبوع مقفول.
14. **rollovers**: يوم واحد فقط يتعالج مرة (idempotent).
15. **bonuses**: unique `(userId, day, kind)` — بونص اليوم الكامل.
16. **settings**: key/value (`default_week_reward`, `demo_seeded`).

---

## 7) منطق البيزنس المطبّق (مهم جدًا)

### التسجيل والدعوات
- لا يوجد تسجيل عام. كود دعوة + nickname + password + صورة (اختياري) + ١..٣ عادات.
- `registerAction` بيتحقق من صلاحية الكود، ينشئ user + habits + system post + إشعار للأدمن، ويزود `uses` ويوقف الكود لو وصل max.
- `/join/[code]` بيتحقق من الكود ويعرض form مقفول عليه.
- أول أدمن + كود `TAKHMIS` بيتعملوا في seed.

### النقاط
- كل إثبات: **+10**.
- لو كمّل كل عاداته في نفس اليوم: **+10 بونص يوم كامل** (مرة واحدة/يوم عبر جدول `bonuses`).
- كل 5 أيام ستريك: **+1 كارت جوكر** (مش نقاط).
- `points` أسبوعية بتتصفّر عند إغلاق الأسبوع، `lifetimePoints` بتفضل.

### الستريك والجوكر
- `nextStreakValue()` في `lib/streak.ts`: لو آخر يوم = امبارح → +1، لو فجوة → 1، لو نفس اليوم → لا تغيير.
- عند تسجيل إثبات، بيتحدّث `streak`, `longestStreak`, `lastStreakDay`.
- `ensureDailyRollover()` في `lib/rollover.ts` بيعالج الأيام اللي فاتت (بحد أقصى 30 يوم/تشغيل، throttle دقيقة):
  - لو اليوم فيه إثبات: يضمن احتساب الستريك.
  - لو مفيش إثبات ولسه فيه ستريك: يصرف **جوكر** تلقائيًا + notification.
  - لو مفيش جوكر: `streak = 0`.
  - ينشئ **بوست تقصير تلقائي** `type=slack` بجملة عشوائية من `SLACK_LINES` (مرة واحدة لكل عضو/يوم).
- Rollover بيتنادى من `ensureDailyRollover()` في app layout و`getFeedPosts` وsubmit proof. فيه زر يدوي للأدمن.

### الفيد
- كل إثبات بينشئ proof + post تلقائيًا في نفس الترنزاكشن.
- البوستات مرتبة `createdAt desc`، pagination offset.
- رياكشن واحد لكل عضو لكل بوست (6 إيموجي: 🔥💪😂❤️👏🫡)، وتعليقات + حذف للتعليق (صاحبه أو أدمن).
- بوستات `slack` ليها ستايل مختلف + زر «حفّله» يبعت notification لصاحب البوست.
- `weekly` ليه ستايل تروفّي، `system` كومباكت.

### الألقاب الديناميكية
`lib/titles.ts`:
- المشاركون فقط (`proofsCount > 0`) يدخلوا الترتيب.
- الترتيب: points desc → streak desc → lifetime desc → proofsCount desc.
- المركز 1: **الوحش 🐋** / 2: **القدوة ✨** / 3: **الصاروخ 🚀**
- آخر مشارك (لو ≥4): **البطاطس 🥔**
- الباقي: **نجم الشلة ⭐**
- صاحب 0 إثبات: **المبتدئ 🌱**
- `syncTitles()` بيتنادى بعد تغيير النقاط/إغلاق الأسبوع/تعديلات الأدمن. **`titleLocked`** بيحمي لقب يدوي من التغيير.

### الأسبوع والرهان
- `ensureActiveWeek()` بينشئ أسبوع السبت→الجمعة لو مفيش active.
- الأدمن بيقدر يغيّر `reward` الحالي.
- `closeWeekAction`:
  - snapshot لكل الأعضاء في `week_results`.
  - يحدد الفائز (أعلى نقاط، لو فيه أي نقاط).
  - يزوّد `wins` للفائز.
  - يصقّر `points` للكل.
  - ينشئ أسبوع جديد بالمكافأة الجديدة.
  - بوست `weekly` + إشعارات للجميع.
  - `syncTitles()`.
- ملاحظة: لا يوجد cron خارجي؛ الـ rollover lazy عند فتح التطبيق. إغلاق الأسبوع يدوي من الأدمن.

### الرادار والحالات
- 3 أزرار سريعة: فاضي / محتاج شركة / مشغول + حالة custom مع رسالة ومكان ومدة (default 3h).
- الحالة القديمة تتعلم inactive، الجديدة `expiresAt` بعد المدة.
- إشعار لكل الشلة (ما عدا صاحب الحالة).
- Board مرتب: need_company → free → custom → busy → بدون حالة.
- RSVP للخروجات (جاي/فكس) + عدّادات.

### الأدمن
- invites: إنشاء/تفعيل/إيقاف/حذف (كود `TKH-XXXXX`).
- members: تعديل nickname/role/points/streak/jokers/wins/title/titleLocked/disabled + حذف (حماية الأدمن الأخير ونفسه).
- week: تغيير المكافأة، إغلاق الأسبوع، تصفير نقاط، تشغيل rollover.
- hangouts: إنشاء/تعديل/إلغاء.
- moderation: حذف بوست/إثبات (بيخصم النقاط) وتعليقات.
- broadcast: إشعار جماعي.

### PWA
- manifest عربي RTL + أيقونات + shortcuts.
- service worker: network-first للصفحات مع offline fallback، cache-first للأصول الثابتة، **لا يخدم API**.
- التسجيل في production بس (`PwaRegister`).
- `InstallPwa` component جاهز (لسه محتاج يتحط في البروفايل).

---

## 8) حالة الشغل — DONE / TODO

### ✅ خلص
- [x] مشروع Next 16 + TS + Tailwind v4 + shadcn مثبت ومظبوط.
- [x] ثيم كامل (OKLCH) + fonts + RTL + noise + brand assets + PWA icons.
- [x] DB schema (16 جدول) + migration + seed كامل بالديمو.
- [x] Auth كامل: register/login/logout/session/invite checks.
- [x] كل الـ server actions الأساسية (proofs/social/habits/radar/admin).
- [x] كل الـ queries (feed/habits/radar/profile/admin/notifications).
- [x] App shell: sidebar ديسكتوب + topbar + mobile bottom nav + notification bell + page transitions.
- [x] صفحات auth: login + register (3 خطوات أنيميشن) + join/[code] + invalid invite.
- [x] `PostCard` كامل (proof/slack/weekly/system + reactions + comments + lightbox + admin delete + ping).
- [x] `QuickProofDialog` (اختيار عادة + كاميرا/رفع + preview + caption + confetti + toast).
- [x] `npm run typecheck` بيعدي بدون أخطاء (آخر تشغيل).

### 🚧 ناقص (الترتيب المقترح للتنفيذ)
1. **الفيد:**
   - `src/components/feed/feed-list.tsx` (فلاتر + load more + empty state).
   - `src/components/feed/feed-rail.tsx` (ترتيب الشلة المصغر + عادات النهاردة + لايف + خروجة).
   - `src/app/(app)/feed/page.tsx` (hero + composer + feed + rail + FAB موبايل).
   - `src/app/api/feed/route.ts` (GET pagination محمي بالجلسة).
2. **الأسبوع/العادات:**
   - `src/app/(app)/habits/page.tsx`
   - مكوّنات: week reward banner، habit cards مع ProofDialog، 7-day strip، leaderboard كامل، gap-to-top.
3. **الرادار:**
   - `src/app/(app)/radar/page.tsx`
   - مكوّنات: status panel (أزرار سريعة + custom dialog + clear)، status board، hangout cards مع RSVP، أدمن add/edit hangout.
4. **البروفايل:**
   - `src/app/(app)/profile/page.tsx`
   - مكوّنات: edit profile (nickname/avatar)، edit habits (نفس منطق register)، change password، achievements، 14-day activity، gallery، week history، `InstallPwa`، logout.
5. **الأدمن:**
   - `src/app/(app)/admin/page.tsx` + tabs/components لكل الأقسام (overview/members/invites/week/hangouts/content).
6. **ملفات مطلوبة من اليوزر:**
   - **`design.md`** في جذر المشروع (شرح الهوية، الباليت، tokens، قواعد UI، النماذج، الـ motion) — **مطلوب صريح**.
   - **`README.md`** (تشغيل، env، بيانات الدخول، الميزات، ملاحظات النشر).
7. **صفحات نظام:** `loading.tsx`, `error.tsx`, `not-found.tsx` بشكل متسق.
8. **الاختبار النهائي:** build + dev server + متصفح (تسجيل/دخول/إثبات/ريأكشن/ستاتوس/RSVP/أدمن) + موبايل + PWA production.
9. **تنظيف:** إزالة `Toaster` المكرر من `(app)/layout.tsx` (موجود في root layout)، unused imports، تشغيل `npm run db:seed` بعد تعديل الألقاب.

---

## 9) مشاكل/ملاحظات معروفة لازم تتظبط

- **Toaster مكرر:** موجود في `src/app/layout.tsx` وفي `src/app/(app)/layout.tsx` → احذف اللي في app layout.
- **الألقاب في الداتابيز قديمة:** شغّل `npm run db:seed` تاني. المتوقع بعدها: مروان = البطاطس، الأدمن = المبتدئ.
- `register-flow.tsx` فيه `formRef` غير مستخدم + imports مش مستخدمة (مش بتكسر الـ typecheck).
- `register/page.tsx` فيه imports مش مستخدمة (`AlertCircle`, `ArrowLeft`, `LogIn`) — تنضيف.
- `sidebar.tsx`: أيقونة `ChevronUp` عليها `group-data-[state=open]` لكن الـ group مش مضبوط ١٠٠٪ — تحسين بصري اختياري.
- `profile.ts` query فيه imports مش مستخدمة (`gte` مستخدم، لكن `and`/`count` مستخدمين — راجعها وقت التنضيف).
- `deleteProofPostAction` مستخدمة لحذف أي بوست؛ للبوستات غير proof بتعمل soft delete فقط.
- الصور المرفوعة محلية → النشر على Vercel مش هينفع للـ uploads (محتاج تخزين خارجي لو حصل). اكتب ده في README.
- مفيش rate limiting (تطبيق شلة مقفول، مقبول). لو هتنشر عام، ضيفه.
- مفيش realtime؛ التحديث عبر revalidatePath + router.refresh. لو مطلوب live، ضيف polling/SSE لاحقًا.
- `server-only` اتشال من `titles.ts` عشان seed يقدر يستوردها. متحطهاش فيه تاني إلا لو هتفصل دالة الـ seed.

---

## 10) أوامر واختبارات مرجعية

```bash
# health
npx tsc --noEmit
npm run build

# DB inspect
sqlite3 data/takhmis.db "select nickname, points, streak, jokers, title, title_emoji from users;"

# dev + test
npm run dev
# افتح http://localhost:3000/login
# الأدمن: الأدمن / takhmis123
# عضو: يوسف / 123456
```

### سيناريو اختبار يدوي مقترح (بعد اكتمال الصفحات)
1. دخول `يوسف` → الفيد فيه بوستات + رياكشنز + تعليقات.
2. إضافة رياكشن + تعليق → يظهر فورًا.
3. إثبات عادة جديدة بصورة → toast + confetti + +10 + ظهور بوست + زيادة الستريك.
4. دخول `مروان` (0 إثباتات اليوم) → التأكد من بوست التقصير بعد rollover (أو زر الأدمن).
5. تغيير حالة الرادار → إشعار لباقي الشلة.
6. RSVP لخروجة → العدادات تتغير.
7. بروفايل: تعديل عادات (max 3) + تغيير صورة/باسورد.
8. أدمن: إنشاء كود دعوة + فتح `/join/CODE` في incognito + تسجيل عضو جديد.
9. أدمن: تعديل نقاط عضو / قفل لقب / إغلاق الأسبوع → بوست weekly + reset points + أسبوع جديد.
10. موبايل: bottom nav + FAB + dialogs + RTL سليم.

---

## 11) أفكار لسه ممكنة (اختياري، متعملش قبل الأساسيات)
- إشعارات push حقيقية (Web Push + VAPID) بدل in-app فقط.
- تصدير/إحصائيات أسبوعية بالرسوم (recharts).
- صفحة "قصص" 24 ساعة.
- أرشيف أسابيع كامل + قاعة مشاهير.
- تصويت على مكافأة الأسبوع.
- Reactions متعددة بدل واحدة.
- Cron فعلي (Vercel Cron / node-cron) بدل lazy rollover.

---

## 12) سجل الجلسة (يساعد الـ AI الجاي)

**2026-11-25 — Session 1**
- تم بناء الأساس كامل: إعداد، ثيم، أصول، DB، seed، auth، actions، queries، shell، صفحات auth، PostCard، QuickProofDialog.
- اتبنى logo/icons/demo assets برمجيًا بـ sharp.
- `typecheck` نضيف.
- **متوقف حاليًا عند:** بداية صفحة الفيد (لسه محتاج FeedList + Rail + Page + API route).
- **الخطوة التالية مباشرة:** حذف Toaster المكرر + `npm run db:seed` + إنشاء `src/app/(app)/feed/page.tsx` و`feed-list.tsx` و`feed-rail.tsx` و`api/feed/route.ts`، ثم اختبار الفيد في المتصفح.

> لو الملف ده قديم شوية، اعتمد على `git`/الملفات الفعلية، بس **متشيلش أي قرار معماري أو ميزة** من غير ما تتأكد إنها مطلوبة.

# Takhmis Design — Raycast, recolored

> المصدر: `npx getdesign@latest add raycast` — اتاخد منه **النظام اللي يقلّل الزحمة**: dark canvas واحد، أسطح مسطّحة، حدود شعرية، أنيميشن قليل، CTA واحد واضح. اللون الأصلي (أبيض/أخضر/أحمر/أصفر) اتبدّل بالكامل بالباليت البنفسجي المطلوب.
> هذا الملف هو المرجع قبل أي تعديل UI. لا تضيف ألوان جديدة.

## 1) الباليت (الوحيدة)

| الاسم | Hex | الاستخدام |
|---|---|---|
| canvas / background | `#190019` | خلفية التطبيق والصفحة والكروت |
| hairline / border | `#522B5B` | كل الحدود والفواصل والـ muted والأسطح المرتفعة |
| accent / secondary | `#854F6C` | التمييز، الشارات، الحالات الثانوية |
| primary / CTA | `#DFB6B2` | الزر الأساسي والنصوص الفرعية |
| ink / foreground | `#FBE4D8` | العناوين والنصوص الأساسية |

- مفيش أخضر، ذهبي، أحمر، أو أزرق. النجاح/التحذير/الخسارة كلها بنفس الباليت: نجاح = primary، تحذير = accent، خطر = accent + أيقونة تحذير.
- التدرّج في العمق بيجي من `canvas → border/hairline` مش من shadows أو gradients. الكروت نفس لون الخلفية بحدود واضحة.
- النص الثانوي = primary بشفافية ٧٠٪، والمعطّل = primary بشفافية ٤٠٪.

## 2) القواعد البصرية

- **Dark-only**، RTL، لا يوجد light mode.
- **مفيش gradients، noise، blur، glow، ولا drop shadows على الكروت.** (الـ helper classes القديمة اتعطّلت في `globals.css`).
- الحدود: `1px solid var(--border)` دايمًا. الفواصل `border-t/border-b` بنفس اللون.
- الأنصاف: `6px` للشارات والعناصر الصغيرة، `8px` للأزرار والحقول، `10px` للكروت، `9999px` للـ pills والأفاتار فقط.
- المسافات: ٨/١٢/١٦ داخل الكرت، ١٦–٢٤ بين الكروت. كرت واحد في كل شاشة هو الأهم، والباقي مسطّح ومتقارب.
- خط النص: **Cairo Variable**، والأرقام/Latin: **Space Grotesk Variable** مع `tabular-nums`.
- حجم النص الأساسي ١٤px، العناوين ٢٠–٢٤px، Metadata ١١–١٢px. مفيش نصوص أقل من ١٠px إلا الشارات.
- CTA واحد صلب لكل شاشة (`bg-primary text-background`)، والباقي `outline` أو `ghost`.
- الأيقونات lucide بحجم ١٦–١٨px. الإيموجي يظهر كنقطة دالة (حالة/عادة) مش كزخرفة في كل سطر.
- الحركة: fade/scale خفيف ١٥٠–٢٠٠ms للdialogs والصفحات فقط. مفيش float/orbit/pulse/shimmer على الكروت.

## 3) الخريطة التي طبّقناها

```text
canvas  #190019  ── page background / card / sidebar / dialog
hairline#522B5B  ── border / divider / muted fill / elevated surface
accent  #854F6C  ── secondary button / badge / hover
primary #DFB6B2  ── primary CTA / secondary text
ink     #FBE4D8  ── headings / body
```

## 4) المكوّنات

| المكوّن | الشكل |
|---|---|
| زر أساسي | `#DFB6B2`، نص `#190019`، ارتفاع ٣٦px، `rounded-lg`، بدون shadow |
| زر ثانوي | شفاف + حد `#522B5B`، نص `#DFB6B2`، عند الhover خلفية `#854F6C/20` |
| حقل إدخال | خلفية `#190019`، حد `#522B5B`، ارتفاع ٣٦–٤٠px، `rounded-lg` |
| كرت | خلفية `#190019`، حد `#522B5B`، `rounded-[10px]`، padding ١٦px |
| صف/قائمة | فاصل `border-b border-border/60`، hover خفيف `bg-accent/10` |
| شارة | `bg-accent/15 text-primary`، `rounded-md`، ١٠px |
|.dialog / popover | `#190019`، حد `#522B5B`، `rounded-lg`، مفيش backdrop-blur |
| تنقّل (sidebar) | ٢٤٠px، `#190019`، حد عمودي `#522B5B`، عنصر نشط = خلفية `#854F6C/20` + حد `#DFB6B2/30` |
| topbar | ارتفاع ٦٠px، `#190019`، حد سفلي `#522B5B` |

## 5) كثافة المحتوى (مهم)

- الفيد: سطر حالة واحد (اليوم/النقاط/الستريك/المكافأة) + الفيد. أي تفاصيل إضافية في الـ rail أو صفحة العادات.
- العادات: كروت العادات + لوحة الترتيب، من غير هيرو متعدد الطبقات.
- الرادار: حالة المستخدم + لوحة الأشخاص + الخروجات، من غير خلفيات متدرّجة.
- البروفايل: بطاقة تعريف بسيطة + إحصائيات في صف واحد + سجل/إنجازات بسيط.
- الأدمن: تبويبات + جداول/قوائم مسطّحة. الإحصائيات شريط واحد مش كروت كبيرة.
- كل زخرفة "pointer-events-none absolute ..." اتشالت. لو حاجة مش وظيفية، تتشال.

## 6) RTL وأرقام

- استخدم `start/end`, `ps/pe`, `ms/me` مش `left/right`.
- الأرقام دايمًا `num` (Space Grotesk + tabular).
- التاريخ/الوقت من `@/lib/dates`، واليوم الحسابي من `Africa/Cairo`.

import path from "node:path";
import fs from "node:fs";

try {
  if (fs.existsSync(path.join(process.cwd(), ".env"))) {
    process.loadEnvFile(path.join(process.cwd(), ".env"));
  }
} catch {
  // ignore
}

async function main() {
const { db } = await import("../src/db/index");
const {
  bonuses,
  habits,
  hangouts,
  hangoutRsvps,
  invites,
  notifications,
  posts,
  proofs,
  reactions,
  comments,
  rollovers,
  settings,
  statuses,
  users,
  weekResults,
  weeks,
} = await import("../src/db/schema");
const { eq } = await import("drizzle-orm");
const { hashPassword } = await import("../src/lib/password");
const { addDays, today, startOfWeek } = await import("../src/lib/dates");
const { syncTitles } = await import("../src/lib/titles");
const { DEFAULT_WEEK_REWARD } = await import("../src/lib/constants");

const now = Date.now();
const day0 = today();

const existingAdmin = db
  .select()
  .from(users)
  .where(eq(users.role, "admin"))
  .get();

const adminPassword = process.env.ADMIN_PASSWORD ?? "takhmis123";
const adminNickname = process.env.ADMIN_NICKNAME ?? "الأدمن";

let adminId = existingAdmin?.id;

if (!existingAdmin) {
  const admin = db
    .insert(users)
    .values({
      nickname: adminNickname,
      nicknameKey: adminNickname.trim().toLowerCase(),
      passwordHash: await hashPassword(adminPassword),
      role: "admin",
      joinDay: day0,
      jokers: 3,
      lastSeenAt: new Date(),
    })
    .returning()
    .get();
  adminId = admin.id;
  console.log(`✓ Admin created — ${adminNickname} / ${adminPassword}`);
} else {
  console.log(`• Admin already exists — ${existingAdmin.nickname}`);
}

const defaultInviteCode = (process.env.DEFAULT_INVITE ?? "TAKHMIS")
  .trim()
  .toUpperCase();
const existingInvite = db
  .select()
  .from(invites)
  .where(eq(invites.code, defaultInviteCode))
  .get();

if (!existingInvite) {
  db.insert(invites)
    .values({
      code: defaultInviteCode,
      createdBy: adminId,
      maxUses: 100,
      note: "كود الشلة الأساسي",
    })
    .run();
  console.log(`✓ Default invite created — ${defaultInviteCode}`);
} else {
  console.log(`• Default invite already exists — ${defaultInviteCode}`);
}

const demoSeeded = db
  .select()
  .from(settings)
  .where(eq(settings.key, "demo_seeded"))
  .get();

const demoPasswordHash = await hashPassword("123456");

const demoSpecs = [
  {
    key: "y",
    nickname: "يوسف",
    points: 120,
    lifetimePoints: 840,
    streak: 12,
    longestStreak: 18,
    jokers: 2,
    wins: 2,
    proofsCount: 31,
    habits: [
      { title: "الجيم", emoji: "🏋️", image: "proof-gym" },
      { title: "قراءة ٢٠ صفحة", emoji: "📚", image: "proof-book" },
      { title: "٨ كوبايات مياه", emoji: "💧", image: "proof-water" },
    ],
    today: [0, 2],
    yesterday: [0, 1, 2],
    before: [0],
    caption: {
      0: "تمرين النهاردة كان وحشي 💪",
      1: "خلصت ٢٠ صفحة قبل ما أنام 📚",
      2: "المية خلصت قبل المغرب 💧",
    },
  },
  {
    key: "o",
    nickname: "عمر",
    points: 95,
    lifetimePoints: 610,
    streak: 7,
    longestStreak: 11,
    jokers: 1,
    wins: 1,
    proofsCount: 22,
    habits: [
      { title: "مذاكرة ساعة", emoji: "📝", image: "proof-study" },
      { title: "مشي ٣٠ دقيقة", emoji: "🚶", image: "proof-walk" },
      { title: "٨ كوبايات مياه", emoji: "💧", image: "proof-water" },
    ],
    today: [0],
    yesterday: [0, 1],
    before: [0],
    caption: {
      0: "ساعة مذاكرة من غير موبايل 📵",
      1: "مشيت الصبح والجو كان تحفة",
    },
  },
  {
    key: "z",
    nickname: "زياد",
    points: 80,
    lifetimePoints: 520,
    streak: 5,
    longestStreak: 9,
    jokers: 2,
    wins: 1,
    proofsCount: 18,
    habits: [
      { title: "الجيم", emoji: "🏋️", image: "proof-gym" },
      { title: "مفيش سكريات", emoji: "🍏", image: "proof-sugar" },
      { title: "نوم قبل ١٢", emoji: "😴", image: "proof-meditate" },
    ],
    today: [0, 1],
    yesterday: [0, 1, 2],
    before: [0, 1],
    caption: {
      0: "الرجل الحديدي رجع تاني 🦾",
      1: "اليوم التالت من غير سكريات 🍏",
    },
  },
  {
    key: "k",
    nickname: "كريم",
    points: 55,
    lifetimePoints: 330,
    streak: 3,
    longestStreak: 8,
    jokers: 0,
    wins: 0,
    proofsCount: 12,
    habits: [
      { title: "صلاة الفجر", emoji: "🕌", image: "proof-fajr" },
      { title: "قراءة ٢٠ صفحة", emoji: "📚", image: "proof-book" },
      { title: "تأمل ١٠ دقايق", emoji: "🧘", image: "proof-meditate" },
    ],
    today: [],
    yesterday: [0],
    before: [1],
    caption: {
      0: "الفجر في وقتها والحمد لله 🕌",
      1: "صفحتين قبل النوم",
    },
  },
  {
    key: "n",
    nickname: "نور",
    points: 40,
    lifetimePoints: 390,
    streak: 2,
    longestStreak: 6,
    jokers: 1,
    wins: 0,
    proofsCount: 14,
    habits: [
      { title: "مذاكرة ساعة", emoji: "📝", image: "proof-study" },
      { title: "تأمل ١٠ دقايق", emoji: "🧘", image: "proof-meditate" },
      { title: "نوم قبل ١٢", emoji: "😴", image: "proof-meditate" },
    ],
    today: [0],
    yesterday: [0],
    before: [],
    caption: {
      0: "خلصت شابتر كامل 📝",
    },
  },
  {
    key: "m",
    nickname: "مروان",
    points: 10,
    lifetimePoints: 140,
    streak: 0,
    longestStreak: 4,
    jokers: 1,
    wins: 0,
    proofsCount: 5,
    habits: [
      { title: "الجيم", emoji: "🏋️", image: "proof-gym" },
      { title: "٨ كوبايات مياه", emoji: "💧", image: "proof-water" },
      { title: "مشي ٣٠ دقيقة", emoji: "🚶", image: "proof-walk" },
    ],
    today: [],
    yesterday: [],
    before: [0],
    caption: {
      0: "رجعت للجيم بعد غيبة 😅",
    },
  },
];

if (!demoSeeded) {
  console.log("▸ Seeding demo crew...");

  const todayStart = startOfWeek(day0);
  const lastWeekStart = addDays(todayStart, -7);
  const lastWeekEnd = addDays(lastWeekStart, 6);

  db.transaction((tx) => {
    const createdUsers = demoSpecs.map((spec) => {
      const user = tx
        .insert(users)
        .values({
          nickname: spec.nickname,
          nicknameKey: spec.nickname.trim().toLowerCase(),
          passwordHash: demoPasswordHash,
          avatarUrl: `/demo/avatar-${spec.key}.svg`,
          role: "member",
          points: spec.points,
          lifetimePoints: spec.lifetimePoints,
          streak: spec.streak,
          longestStreak: spec.longestStreak,
          jokers: spec.jokers,
          wins: spec.wins,
          proofsCount: spec.proofsCount,
          joinDay: addDays(day0, -40),
          lastStreakDay: spec.today.length ? day0 : addDays(day0, -1),
          lastSeenAt: new Date(now - 1000 * 60 * (5 + Math.floor(Math.random() * 200))),
        })
        .returning()
        .get();
      return { spec, user };
    });

    const habitIdByUser = new Map<string, Record<number, string>>();

    for (const { spec, user } of createdUsers) {
      const ids: Record<number, string> = {};
      spec.habits.forEach((habit, index) => {
        const row = tx
          .insert(habits)
          .values({
            userId: user.id,
            title: habit.title,
            emoji: habit.emoji,
            position: index,
          })
          .returning()
          .get();
        ids[index] = row.id;
      });
      habitIdByUser.set(user.id, ids);
    }

    const allPostIds: { id: string; userId: string }[] = [];

    const createProof = (
      userId: string,
      habitIndex: number,
      day: string,
      dayOffset: number,
      hour: number,
      fullDay = false,
    ) => {
      const { spec, user } = createdUsers.find((u) => u.user.id === userId)!;
      const habit = spec.habits[habitIndex];
      const image = `/demo/${habit.image}.svg`;
      const caption =
        spec.caption[habitIndex as keyof typeof spec.caption] ?? null;
      const habitId = habitIdByUser.get(userId)![habitIndex];
      const at = new Date(now - dayOffset * 86400000);
      at.setHours(hour, Math.floor(Math.random() * 50), 0, 0);
      const createdAt =
        at.getTime() > now
          ? new Date(now - (habitIndex + 1) * 45 * 60000 - Math.random() * 60000)
          : at;

      const proof = tx
        .insert(proofs)
        .values({
          userId,
          habitId,
          day,
          imageUrl: image,
          caption,
          points: fullDay ? 20 : 10,
          fullDay,
          createdAt,
        })
        .returning()
        .get();

      const post = tx
        .insert(posts)
        .values({
          userId,
          type: "proof",
          body: caption,
          imageUrl: image,
          proofId: proof.id,
          habitId,
          day,
          createdAt,
        })
        .returning()
        .get();

      allPostIds.push({ id: post.id, userId });
      return post;
    };

    for (const { spec, user } of createdUsers) {
      spec.today.forEach((h, i) =>
        createProof(user.id, h, day0, 0, 22 - i * 2),
      );
      spec.yesterday.forEach((h) =>
        createProof(
          user.id,
          h,
          addDays(day0, -1),
          1,
          19 + h,
          spec.yesterday.length === spec.habits.length && h === spec.yesterday.at(-1),
        ),
      );
      spec.before.forEach((h) =>
        createProof(user.id, h, addDays(day0, -2), 2, 20 + h),
      );
    }

    // Full-day bonus for يوسف أمس
    const youssef = createdUsers.find((u) => u.spec.key === "y")!;
    tx.insert(bonuses)
      .values({
        userId: youssef.user.id,
        day: addDays(day0, -1),
        kind: "full_day",
        points: 10,
      })
      .run();

    // Reactions + comments على أحدث البوستات
    const reactionPool = ["🔥", "💪", "😂", "❤️", "👏", "🫡"];
    const commentPool = [
      "وحش فشخ 🔥",
      "كمل كده يا بطل 💪",
      "أنا هحاول أعمل زيك النهاردة",
      "برافو عليك 👏",
      "إيه الجمدان ده 😂",
      "ثبات يا راجل 🫡",
    ];

    allPostIds.forEach((post, index) => {
      const others = createdUsers.filter((u) => u.user.id !== post.userId);
      const reactorCount = Math.min(
        others.length,
        2 + (index % Math.max(others.length - 1, 1)),
      );
      for (let i = 0; i < reactorCount; i++) {
        tx.insert(reactions)
          .values({
            postId: post.id,
            userId: others[i].user.id,
            emoji: reactionPool[(index + i) % reactionPool.length],
          })
          .run();
      }
      if (index % 2 === 0) {
        tx.insert(comments)
          .values({
            postId: post.id,
            userId: others[index % others.length].user.id,
            body: commentPool[index % commentPool.length],
          })
          .run();
      }
    });

    // بوستات تقصير
    const marwan = createdUsers.find((u) => u.spec.key === "m")!;
    const nour = createdUsers.find((u) => u.spec.key === "n")!;
    tx.insert(posts)
      .values({
        userId: marwan.user.id,
        type: "slack",
        body: "مروان فكس النهاردة ونايم في العسل 😴",
        day: addDays(day0, -1),
        createdAt: new Date(now - 14 * 3600000),
      })
      .run();
    tx.insert(posts)
      .values({
        userId: nour.user.id,
        type: "slack",
        body: "نور اختفى من الرادار... مفيش ولا إثبات 💤",
        day: addDays(day0, -2),
        createdAt: new Date(now - 38 * 3600000),
      })
      .run();

    // ستاتوسات لايف
    tx.insert(statuses)
      .values([
        {
          userId: youssef.user.id,
          kind: "free" as const,
          message: "فاضي بعد التمرين لو حد عايز قهوة",
          place: "وسط البلد",
          expiresAt: new Date(now + 2 * 3600000),
          createdAt: new Date(now - 20 * 60000),
        },
        {
          userId: createdUsers.find((u) => u.spec.key === "o")!.user.id,
          kind: "need_company" as const,
          message: "محتاج حد ينزل النادي معايا",
          place: "جولدز جيم",
          expiresAt: new Date(now + 4 * 3600000),
          createdAt: new Date(now - 35 * 60000),
        },
        {
          userId: marwan.user.id,
          kind: "busy" as const,
          message: "مشغول بالمذاكرة لحد بليل",
          expiresAt: new Date(now + 5 * 3600000),
          createdAt: new Date(now - 55 * 60000),
        },
      ])
      .run();

    // خروجة قادمة
    const hangoutAt = new Date(now + 2 * 86400000);
    hangoutAt.setHours(20, 0, 0, 0);
    const hangout = tx
      .insert(hangouts)
      .values({
        title: "لمة الجمعة — كشري وقهوة",
        place: "بيت الكشري، المعادي",
        startsAt: hangoutAt,
        notes: "اللي جاي يكتب جاي عشان نحجز ترابيزة كبيرة",
        createdBy: adminId,
      })
      .returning()
      .get();

    tx.insert(hangoutRsvps)
      .values([
        { hangoutId: hangout.id, userId: youssef.user.id, status: "going" },
        {
          hangoutId: hangout.id,
          userId: createdUsers.find((u) => u.spec.key === "o")!.user.id,
          status: "going",
        },
        {
          hangoutId: hangout.id,
          userId: createdUsers.find((u) => u.spec.key === "z")!.user.id,
          status: "faks",
        },
        { hangoutId: hangout.id, userId: nour.user.id, status: "going" },
      ])
      .run();

    // أسبوع فات (مغلق) + نتائجه
    const lastWeek = tx
      .insert(weeks)
      .values({
        startDay: lastWeekStart,
        endDay: lastWeekEnd,
        reward: "سناك على حساب الباقي 🍟",
        status: "closed",
        winnerId: youssef.user.id,
        closedAt: new Date(now - 3 * 86400000),
        createdAt: new Date(now - 10 * 86400000),
      })
      .returning()
      .get();

    createdUsers
      .map((u) => u.user)
      .sort((a, b) => b.lifetimePoints - a.lifetimePoints)
      .forEach((user, index) => {
        tx.insert(weekResults)
          .values({
            weekId: lastWeek.id,
            userId: user.id,
            points: Math.max(230 - index * 28, 15),
            rank: index + 1,
            title: index === 0 ? "🐋 الوحش" : null,
            createdAt: new Date(now - 3 * 86400000),
          })
          .run();
      });

    tx.insert(posts)
      .values({
        userId: youssef.user.id,
        type: "weekly",
        body: "🏆 يوسف كسب رهان الأسبوع اللي فات بـ ٢٣٠ نقطة!\nالمكافأة كانت: سناك على حساب الباقي 🍟\n\nأسبوع جديد بدأ — يلا نشوف مين هيكسب المرة دي 👀",
        day: addDays(day0, -3),
        createdAt: new Date(now - 3 * 86400000),
      })
      .run();

    // الأسبوع الحالي
    tx.insert(weeks)
      .values({
        startDay: todayStart,
        endDay: addDays(todayStart, 6),
        reward: DEFAULT_WEEK_REWARD,
        status: "active",
        createdAt: new Date(now - 86400000),
      })
      .run();

    tx.insert(settings)
      .values({
        key: "default_week_reward",
        value: DEFAULT_WEEK_REWARD,
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: DEFAULT_WEEK_REWARD },
      })
      .run();

    // إشعارات
    if (adminId) {
      tx.insert(notifications)
        .values([
          {
            userId: adminId,
            type: "hangout",
            title: "خروجة جديدة اتضافت 🎉",
            body: "لمة الجمعة — كشري وقهوة · المعادي",
            href: "/radar",
            read: false,
            createdAt: new Date(now - 20 * 60000),
          },
          {
            userId: adminId,
            type: "member",
            title: "عضو جديد في الشلة 🎉",
            body: "نور انضمت عن طريق كود TAKHMIS",
            href: "/admin?tab=members",
            read: false,
            createdAt: new Date(now - 4 * 3600000),
          },
          {
            userId: adminId,
            type: "week",
            title: "🏆 يوسف كسب الأسبوع اللي فات",
            body: "المكافأة: سناك على حساب الباقي 🍟",
            href: "/habits",
            read: true,
            createdAt: new Date(now - 3 * 86400000),
          },
        ])
        .run();
    }

    tx.insert(notifications)
      .values([
        {
          userId: youssef.user.id,
          type: "reaction",
          title: "عمر عمل 🔥 على منشورك",
          href: "/feed",
          read: false,
          createdAt: new Date(now - 25 * 60000),
        },
        {
          userId: youssef.user.id,
          type: "joker",
          title: "كارت جوكر جديد 🃏",
          body: "وصلت ١٠ أيام ورا بعض — خدت جوكر إضافي.",
          href: "/profile",
          read: true,
          createdAt: new Date(now - 2 * 86400000),
        },
      ])
      .run();

    // علّمنا الأيام اللي فاتت كمعالَجة عشان ميعملش بوستات تقصير تلقائية للديمو
    tx.insert(rollovers)
      .values([{ day: addDays(day0, -1) }, { day: addDays(day0, -2) }])
      .onConflictDoNothing()
      .run();

    tx.insert(settings)
      .values({ key: "demo_seeded", value: "1" })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: "1" },
      })
      .run();
  });

  syncTitles();
  console.log("✓ Demo crew seeded (login password: 123456)");
} else {
  console.log("• Demo data already seeded — skipping");
}

syncTitles();
console.log("\n✅ Seed complete");
console.log("   Admin:", `${adminNickname} / ${adminPassword}`);
console.log("   Members: يوسف، عمر، زياد، كريم، نور، مروان / 123456");
console.log("   Invite:", defaultInviteCode);
console.log("   DB:", process.env.DATABASE_URL ?? "data/takhmis.db");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

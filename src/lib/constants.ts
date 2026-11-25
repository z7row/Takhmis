export const APP_NAME = "تخميس";
export const APP_NAME_LATIN = "Takhmis";
export const APP_TAGLINE = "شلتك، عاداتك، وخروجاتك — في مكان واحد.";
export const APP_DESCRIPTION =
  "تخميس: منصة الشلة اللي بتخلي الالتزام لعبة. وثّق عاداتك بصورة، نافس أصحابك، واعرف مين فاضي دلوقتي.";

export const MAX_HABITS = 3; // soft recommendation, not hard limit
export const HABIT_HARD_LIMIT = 20;

export const POINTS = {
  proof: 10,
  fullDay: 10,
} as const;

export const JOKER_EVERY = 5;

export const DEFAULT_WEEK_REWARD = "مكان الخروجة الجاية على الباقي 🎉";

export const REACTION_EMOJIS = ["🔥", "💪", "😂", "❤️", "👏", "🫡"] as const;

export const HABIT_SUGGESTIONS = [
  { title: "الجيم", emoji: "🏋️" },
  { title: "قراءة ٢٠ صفحة", emoji: "📚" },
  { title: "٨ كوبايات مياه", emoji: "💧" },
  { title: "مشي ٣٠ دقيقة", emoji: "🚶" },
  { title: "مذاكرة ساعة", emoji: "📝" },
  { title: "نوم قبل ١٢", emoji: "😴" },
  { title: "صلاة الفجر في وقتها", emoji: "🕌" },
  { title: "مفيش سكريات", emoji: "🍏" },
  { title: "تمرين تأمل ١٠ دقايق", emoji: "🧘" },
  { title: "مراجعة كود", emoji: "💻" },
  { title: "مكالمة مع الأهل", emoji: "📞" },
  { title: "ترتيب الأوضة", emoji: "🧹" },
] as const;

export const STATUS_PRESETS = [
  {
    kind: "free",
    label: "فاضي دلوقتي",
    emoji: "🟢",
    message: "فاضي دلوقتي ولو حد عايز ينزل يلقاني",
  },
  {
    kind: "need_company",
    label: "محتاج حد ينزل معايا",
    emoji: "🙋",
    message: "محتاج حد ينزل معايا دلوقتي",
  },
  {
    kind: "busy",
    label: "مشغول",
    emoji: "🔴",
    message: "مشغول دلوقتي، هبقى فاضي بعدين",
  },
] as const;

export const STATUS_KIND_META: Record<
  string,
  { label: string; emoji: string; tone: "success" | "warning" | "danger" | "neutral" }
> = {
  free: { label: "فاضي دلوقتي", emoji: "🟢", tone: "success" },
  need_company: { label: "محتاج شركة", emoji: "🙋", tone: "warning" },
  busy: { label: "مشغول", emoji: "🔴", tone: "danger" },
  custom: { label: "حالة", emoji: "💬", tone: "neutral" },
};

export const SLACK_LINES = [
  "{name} فكس النهاردة ونايم في العسل 😴",
  "{name} اختفى من الرادار... مفيش ولا إثبات 💤",
  "صفر إثباتات وصفر أعذار. {name} في خبر كان 🤡",
  "{name} قال بكرة... وبكرة مجاش 🥱",
  "الشلة بتتمرن و{name} بيتفرج على السقف 🛋️",
  "{name} نسي إنه في تحدي أصلاً 🫠",
  "النهاردة {name} كان نجم... في النوم بس 🥔",
  "{name} فتح التطبيق، شاف التحدي، وقفل 😂",
  "الجوكر مش هينفعك يا {name}... مفيش إثبات 🃏",
  "{name} واخد راحة من الالتزام، والستريك زعلان 🥲",
] as const;

export const TITLE_RANKS = [
  { title: "الوحش", emoji: "🐋", tone: "positive" as const },
  { title: "القدوة", emoji: "✨", tone: "positive" as const },
  { title: "الصاروخ", emoji: "🚀", tone: "positive" as const },
];

export const TITLE_DEFAULT = {
  title: "نجم الشلة",
  emoji: "⭐",
  tone: "neutral" as const,
};

export const TITLE_NEWBIE = {
  title: "المبتدئ",
  emoji: "🌱",
  tone: "neutral" as const,
};

export const TITLE_LAST = {
  title: "البطاطس",
  emoji: "🥔",
  tone: "negative" as const,
};

export const ACHIEVEMENTS = [
  { key: "first", label: "أول إثبات", emoji: "🎬", check: (s: Stats) => s.proofsCount >= 1 },
  { key: "ten", label: "١٠ إثباتات", emoji: "🔟", check: (s: Stats) => s.proofsCount >= 10 },
  { key: "fifty", label: "٥٠ إثبات", emoji: "🏅", check: (s: Stats) => s.proofsCount >= 50 },
  { key: "streak3", label: "٣ أيام ورا بعض", emoji: "🔥", check: (s: Stats) => s.longestStreak >= 3 },
  { key: "streak7", label: "أسبوع كامل", emoji: "⚡", check: (s: Stats) => s.longestStreak >= 7 },
  { key: "streak30", label: "شهر ولاء", emoji: "👑", check: (s: Stats) => s.longestStreak >= 30 },
  { key: "winner", label: "بطل أسبوع", emoji: "🏆", check: (s: Stats) => s.wins >= 1 },
  { key: "winner3", label: "٣ مرات بطل", emoji: "🥇", check: (s: Stats) => s.wins >= 3 },
] as const;

export type Stats = {
  proofsCount: number;
  longestStreak: number;
  wins: number;
};

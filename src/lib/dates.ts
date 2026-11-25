const TZ = process.env.APP_TIMEZONE || "Africa/Cairo";

/** YYYY-MM-DD في توقيت التطبيق */
export function dayKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function today(): string {
  return dayKey();
}

export function addDays(day: string, amount: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + amount);
  return d.toISOString().slice(0, 10);
}

/** 0 = الأحد ... 6 = السبت */
export function weekday(day: string): number {
  return new Date(`${day}T12:00:00Z`).getUTCDay();
}

/** الأسبوع يبدأ السبت (توقيت مصر) */
export function startOfWeek(day: string = today()): string {
  const offset = (weekday(day) + 1) % 7;
  return addDays(day, -offset);
}

export function endOfWeek(day: string = today()): string {
  return addDays(startOfWeek(day), 6);
}

export function diffDays(a: string, b: string): number {
  return Math.round(
    (new Date(`${a}T12:00:00Z`).getTime() - new Date(`${b}T12:00:00Z`).getTime()) /
      86400000,
  );
}

export function weekLabel(startDay: string, endDay: string): string {
  return `${formatShortDay(startDay)} — ${formatShortDay(endDay)}`;
}

const AR_LOCALE = "ar-EG-u-nu-latn";

export function formatShortDay(day: string): string {
  return new Intl.DateTimeFormat(AR_LOCALE, {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(new Date(`${day}T12:00:00Z`));
}

export function formatFullDate(input: Date | number): string {
  return new Intl.DateTimeFormat(AR_LOCALE, {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(input);
}

export function formatDateTime(input: Date | number): string {
  return new Intl.DateTimeFormat(AR_LOCALE, {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(input);
}

export function formatTime(input: Date | number): string {
  return new Intl.DateTimeFormat(AR_LOCALE, {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(input);
}

export function formatDayWithTime(day: string): string {
  return new Intl.DateTimeFormat(AR_LOCALE, {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${day}T12:00:00Z`));
}

export function dayLabel(day: string): string {
  const t = today();
  if (day === t) return "النهاردة";
  if (day === addDays(t, -1)) return "إمبارح";
  return formatShortDay(day);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat(AR_LOCALE).format(n);
}

/** موعد مناسب لحقول datetime-local بتوقيت التطبيق */
export function toLocalInputValue(input: Date | number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(input);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** تحويل قيمة datetime-local (بتوقيت القاهرة) إلى تاريخ حقيقي */
export function fromLocalInputValue(value: string): Date | null {
  if (!value) return null;
  // نحدد الإزاحة الفعلية لتوقيت التطبيق في هذا التاريخ
  const asUtc = new Date(`${value}:00Z`);
  if (Number.isNaN(asUtc.getTime())) return null;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(asUtc);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const represented = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  const offset = represented - asUtc.getTime();
  return new Date(asUtc.getTime() - offset);
}

export function relativeTime(input: Date | number): string {
  const rtf = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });
  const diff = (new Date(input).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "دلوقتي";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(diff / 86400), "day");
  return rtf.format(Math.round(diff / (86400 * 7)), "week");
}

export function countdown(target: Date | number): string {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return "بدأ";
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `بعد ${days} يوم${hours % 24 ? ` و${hours % 24} ساعة` : ""}`;
  if (hours > 0) return `بعد ${hours} ساعة${minutes % 60 ? ` و${minutes % 60} دقيقة` : ""}`;
  return `بعد ${Math.max(minutes, 1)} دقيقة`;
}

export function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hour: "2-digit",
      hour12: false,
    }).format(new Date()),
  );
  if (hour < 12) return "صباح الخير";
  if (hour < 17) return "نهارك سعيد";
  return "مساء الخير";
}

export function isOnline(lastSeenAt: Date | number | null | undefined): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000;
}

export function daysBack(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(today(), -i));
  return out;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

export { TZ };

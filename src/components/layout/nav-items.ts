import {
  CalendarDays,
  Flame,
  Radar as RadarIcon,
  ShieldCheck,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/feed", label: "الفيد", short: "الفيد", icon: Sparkles },
  { href: "/habits", label: "العادات", short: "العادات", icon: Flame },
  { href: "/radar", label: "الرادار", short: "الرادار", icon: RadarIcon },
  { href: "/hangouts", label: "الخروجات", short: "الخروجات", icon: CalendarDays },
  { href: "/profile", label: "البروفايل", short: "بروفايل", icon: UserRound },
  {
    href: "/admin",
    label: "لوحة الأدمن",
    short: "الأدمن",
    icon: ShieldCheck,
    adminOnly: true,
  },
];

export function navFor(role: "admin" | "member") {
  return NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin");
}

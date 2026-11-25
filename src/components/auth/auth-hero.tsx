import { Camera, Flame, Radar, Trophy } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const features = [
  {
    icon: Camera,
    title: "إثبات بالصورة",
    body: "مفيش «تم» من غير صورة من نفس اليوم",
  },
  {
    icon: Flame,
    title: "ستريك وجوكر",
    body: "كل ٥ أيام جوكر بيحميك من التصفير",
  },
  {
    icon: Trophy,
    title: "رهان أسبوعي",
    body: "اللي يكسب يختار خروجة الأسبوع",
  },
  {
    icon: Radar,
    title: "رادار الشلة",
    body: "اعرف مين فاضي ومين محتاج شركة",
  },
];

export function AuthHero() {
  return (
    <div className="hidden lg:flex lg:items-center lg:justify-center">
      <div className="w-full max-w-[480px] rounded-[10px] border border-border bg-card p-6">
        <Logo size="lg" href="/" className="mb-5" />
        <p className="text-[11px] font-semibold text-primary/70">
          شلتك · عاداتك · وخروجاتك
        </p>
        <h2 className="mt-2 text-2xl font-extrabold leading-snug tracking-tight">
          الالتزام لوحده صعب. مع الشلة… بقى لعبة.
        </h2>
        <p className="mt-3 max-w-[420px] text-sm leading-6 text-muted-foreground/70">
          تخميس مش تطبيق عادات تقليدي. صوّر إثباتك، نافس أصحابك، احمي
          الستريك بالجوكر، واللي يكسّل… الشلة هتعرف 😄
        </p>

        <div className="mt-5 divide-y divide-border/60 border-y border-border/60">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex items-start gap-3 py-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[4px] border border-border bg-background text-primary/70">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{feature.title}</p>
                  <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground/70">
                    {feature.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground/70">
          دخول بالدعوة بس — جو خاص
        </p>
      </div>
    </div>
  );
}

export function AuthLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1120px] items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,460px)_1fr] lg:px-8">
        <div className="mx-auto w-full max-w-[460px]">
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo size="lg" href="/" />
          </div>
          {children}
        </div>
        <AuthHero />
      </div>
    </div>
  );
}

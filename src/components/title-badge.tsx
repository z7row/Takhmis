import { cn } from "@/lib/utils";

const tones = {
  positive: "border-border bg-accent/15 text-primary",
  neutral: "border-border bg-background text-primary/70",
  negative: "border-border bg-accent/20 text-primary",
} as const;

export function TitleBadge({
  title,
  emoji,
  tone = "neutral",
  className,
  size = "sm",
}: {
  title: string;
  emoji?: string;
  tone?: "positive" | "neutral" | "negative";
  className?: string;
  size?: "sm" | "xs";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-[family-name:var(--font-mono)] tracking-[0.04em] whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-1.5 py-0.5 text-[10px]",
        tones[tone],
        className,
      )}
    >
      {title}
    </span>
  );
}

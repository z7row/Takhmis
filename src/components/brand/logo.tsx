import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/feed",
  showText = true,
  size = "md",
}: {
  className?: string;
  href?: string | null;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: { img: "h-7", text: "text-lg", latin: "text-[8px]" },
    md: { img: "h-9", text: "text-xl", latin: "text-[9px]" },
    lg: { img: "h-12", text: "text-2xl", latin: "text-[10px]" },
    xl: { img: "h-20", text: "text-4xl", latin: "text-xs" },
  }[size];

  const content = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo-mark.png"
        alt="شعار تخميس"
        width={240}
        height={116}
        priority
        className={cn("w-auto drop-shadow-[0_6px_24px_rgba(223,182,178,0.18)]", sizes.img)}
      />
      {showText && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-extrabold tracking-tight", sizes.text)}>
            تخميس
          </span>
          <span
            className={cn(
              "mt-1 font-display font-medium uppercase tracking-[0.34em] text-muted-foreground",
              sizes.latin,
            )}
          >
            Takhmis
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="focus-ring rounded-xl" aria-label="تخميس">
      {content}
    </Link>
  );
}

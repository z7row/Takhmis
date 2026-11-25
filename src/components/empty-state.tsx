import { cn } from "@/lib/utils";

export function EmptyState({
  emoji = "🐋",
  title,
  description,
  action,
  className,
}: {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[10px] border border-dashed border-border bg-card px-6 py-10 text-center",
        className,
      )}
    >
      <div className="mb-3 grid size-12 place-items-center rounded-[4px] border border-border bg-background text-2xl">
        <span aria-hidden>{emoji}</span>
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground/70">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

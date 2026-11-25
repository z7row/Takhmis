"use client";

import { useEffect, useState } from "react";
import { formatDateTime, relativeTime } from "@/lib/dates";

export function TimeAgo({
  date,
  className,
  absolute = false,
}: {
  date: number | string | Date;
  className?: string;
  absolute?: boolean;
}) {
  const timestamp =
    typeof date === "number"
      ? date
      : date instanceof Date
        ? date.getTime()
        : new Date(date).getTime();

  const [label, setLabel] = useState(() =>
    absolute ? formatDateTime(timestamp) : relativeTime(timestamp),
  );

  useEffect(() => {
    if (absolute) return;
    const update = () => setLabel(relativeTime(timestamp));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [timestamp, absolute]);

  return (
    <time
      dateTime={new Date(timestamp).toISOString()}
      className={className}
      title={formatDateTime(timestamp)}
      suppressHydrationWarning
    >
      {label}
    </time>
  );
}

import { requireUser } from "@/lib/auth";
import { ensureDailyRollover } from "@/lib/rollover";
import { getLeaderboard } from "@/lib/queries/habits";
import { getNotifications } from "@/lib/queries/notifications";
import { toPublicUser } from "@/lib/user";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  ensureDailyRollover();

  const [notifications, leaderboard] = await Promise.all([
    Promise.resolve(getNotifications(user.id)),
    Promise.resolve(getLeaderboard(user.id)),
  ]);

  const rank = leaderboard.find((row) => row.isViewer)?.rank ?? null;

  return (
    <AppShell
      user={toPublicUser(user)}
      notifications={notifications.items}
      unread={notifications.unread}
      rank={rank}
    >
      {children}
    </AppShell>
  );
}

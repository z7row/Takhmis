import { requireUser } from "@/lib/auth";
import { getFeedPosts } from "@/lib/queries/feed";
import { getLeaderboard } from "@/lib/queries/habits";
import { toPublicUser } from "@/lib/user";
import { FeedList } from "@/components/feed/feed-list";
import { FeedRail } from "@/components/feed/feed-rail";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الفيد",
};

export default async function FeedPage() {
  const user = await requireUser();
  const viewer = toPublicUser(user);

  const [feed, leaderboard] = await Promise.all([
    Promise.resolve(getFeedPosts(user.id, 0)),
    Promise.resolve(getLeaderboard(user.id)),
  ]);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
      <div className="min-w-0">
        <FeedList
          initialPosts={feed.posts}
          initialHasMore={feed.hasMore}
          initialPage={feed.nextPage}
          viewer={viewer}
        />
      </div>

      <aside className="hidden xl:block">
        <FeedRail leaderboard={leaderboard} />
      </aside>
    </div>
  );
}

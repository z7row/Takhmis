"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PostCard } from "./post-card";
import { CreatePost } from "./create-post";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import type { FeedPost } from "@/lib/queries/feed";
import type { PublicUser } from "@/lib/user";
import { toast } from "sonner";

export function FeedList({
  initialPosts,
  initialHasMore,
  initialPage,
  viewer,
}: {
  initialPosts: FeedPost[];
  initialHasMore: boolean;
  initialPage: number;
  viewer: PublicUser;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/feed?page=${page}`, { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as {
        posts: FeedPost[];
        hasMore: boolean;
        nextPage: number;
      };
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...data.posts.filter((p) => !seen.has(p.id))];
      });
      setHasMore(data.hasMore);
      setPage(data.nextPage);
    } catch {
      toast.error("مقدرناش نجيب المنشورات — جرّب تاني");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <CreatePost viewer={viewer} />
      {posts.length === 0 ? (
        <EmptyState
          title="الفيد فاضي"
          description="أول ما حد يوثّق عادة أو يحصل تحديث، هتلاقيه هنا."
        />
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            viewer={viewer}
            onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
          />
        ))
      )}

      {hasMore && (
        <Button
          variant="outline"
          onClick={loadMore}
          disabled={loading}
          className="h-10 w-full rounded-[3px] text-[12px]"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "حمّل أكتر"}
        </Button>
      )}
    </div>
  );
}

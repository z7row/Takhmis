import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFeedPosts } from "@/lib/queries/feed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "مش مسجل دخول" }, { status: 401 });
  }

  const url = new URL(request.url);
  const pageParam = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  const data = getFeedPosts(user.id, page);

  return NextResponse.json({
    posts: data.posts,
    hasMore: data.hasMore,
    nextPage: data.nextPage,
  });
}

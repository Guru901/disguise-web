"use client";

import { Loader } from "@/components/loader";
import { PostCard } from "@/components/post-card";
import { FetchOptions } from "./fetch-options";
import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "@/components/navbar";
import useGetUser from "@/lib/use-get-user";
import { api } from "@/trpc/react";
import Masonry from "react-masonry-css";
import { Loader2 } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

const breakpointColumnsObj = {
  default: 2,
  1100: 2,
  700: 1,
};

type Post = NonNullable<
  inferRouterOutputs<AppRouter>["postRouter"]["getFeed"][number]
>;

export default function Feed() {
  const { user } = useGetUser();
  const [selectedOption, setSelectedOption] = useState("general");
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver>(null);
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  const { data: posts, isLoading: isPostsLoading } =
    api.postRouter.getFeed.useQuery({
      page,
      limit: 10,
    });

  const lastPostRef = useCallback(
    (node: HTMLDivElement) => {
      if (isPostsLoading || posts?.length === 0 || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]!.isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
      return () => {
        if (observer.current) {
          observer.current.disconnect();
        }
      };
    },
    [isPostsLoading, posts?.length, hasMore],
  );

  useEffect(() => {
    if (posts && posts.length === 0) {
      setHasMore(false);
    } else if (posts) {
      setAllPosts((prevPosts) => [...prevPosts, ...posts]);
    }
  }, [posts]);

  if (isPostsLoading && page === 1) return <Loader />;

  return (
    <div className="relative flex h-screen w-screen flex-col gap-3 overflow-x-hidden px-2 py-2">
      <Navbar />
      <div className="mt-2 flex w-screen items-center md:justify-start">
        <FetchOptions
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
      </div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {allPosts?.map((post) => (
          <PostCard
            avatar={post.createdBy?.avatar ?? ""}
            username={post.createdBy?.username ?? "User"}
            title={post.title}
            image={post.image}
            createdAt={post.createdAt}
            content={post.content}
            id={post.id}
            likes={post.likes ?? []}
            disLikes={post.disLikes ?? []}
            userId={user.id}
            key={post.id}
            ref={lastPostRef}
          />
        ))}
      </Masonry>
      {hasMore && page !== 1 && (
        <div className="flex w-screen items-center justify-center py-8">
          <div className="animate-fade-in flex w-full flex-col items-center gap-3 rounded-xl border px-8 py-6 shadow-md">
            <Loader2 className="text-primary mb-2 h-8 w-8 animate-spin" />
            <span className="text-muted-foreground text-base font-medium">
              Loading more posts...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

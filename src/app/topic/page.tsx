"use client";

import { Loader } from "@/components/loader";
import { PostCard } from "@/components/post-card";
import Navbar from "@/components/navbar";
import useGetUser from "@/lib/use-get-user";
import { api } from "@/trpc/react";
import Masonry from "react-masonry-css";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const breakpointColumnsObj = {
  default: 2,
  1100: 2,
  700: 1,
};

function TopicFeedContent() {
  const { user } = useGetUser();
  const params = useSearchParams();
  const topicName = params.get("name");

  const { data: posts, isLoading: isPostsLoading } =
    api.postRouter.getTopicSpecificFeed.useQuery({
      topicName: topicName!,
    });

  if (isPostsLoading) return <Loader />;

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {posts?.map((post) => (
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
          loggedInUser={user.username}
        />
      ))}
    </Masonry>
  );
}

export default function TopicSpecificFeed() {
  return (
    <div className="relative flex h-screen w-full flex-col gap-3 overflow-x-hidden px-2 py-2">
      <Navbar />
      <Suspense fallback={<Loader />}>
        <TopicFeedContent />
      </Suspense>
    </div>
  );
}

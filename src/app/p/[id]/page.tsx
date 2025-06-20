"use client";

import Navbar from "@/components/navbar";
import { PostDetails } from "@/components/post-details";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Feed() {
  const pathName = usePathname();

  const id = pathName.split("/")[2];

  const { data: post, isLoading: isPostLoading } =
    api.postRouter.getPostById.useQuery({
      postId: id ?? "",
    });

  return (
    <div className="relative h-screen w-full overflow-x-hidden">
      <Navbar />
      <div className="w-[calc(100vw - 2rem)] mx-1 mt-3 flex items-start justify-center pb-12">
        {isPostLoading ? (
          <div className="flex h-screen w-screen items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : post ? (
          <PostDetails
            author={{
              avatar: post.createdBy?.avatar ?? "",
              username: post.createdBy?.username ?? "User",
              id: post.createdBy?.id ?? "",
            }}
            commentsCount={post.commentsCount ?? 0}
            title={post.title}
            content={post.content ?? ""}
            image={post.image ?? ""}
            createdAt={post.createdAt}
            likes={post.likes ?? []}
            disLikes={post.disLikes ?? []}
            topic={post.topic}
            postID={post.id}
            key={post.id}
          />
        ) : null}
      </div>
    </div>
  );
}

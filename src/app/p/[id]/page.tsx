"use client";

import Navbar from "@/components/navbar";
import { PostDetails } from "@/components/post-details";
import { api } from "@/trpc/react";
import { useState } from "react";

export default function Feed() {
  const [selectedOption, setSelectedOption] = useState("general");
  const { data: post } = api.postRouter.getPostById.useQuery({
    postId: "48a34aa3-d4b6-47d7-b0ea-16cbe3c95522",
  });

  return (
    <div className="relative h-screen w-full overflow-x-hidden">
      <Navbar />
      <div className="flex w-screen items-start justify-center pb-12">
        {post && (
          <PostDetails
            author={{
              avatar: post.createdBy?.avatar ?? "",
              username: post.createdBy?.username ?? "User",
              id: post.createdBy?.id ?? "",
            }}
            title={post.title}
            content={post.content}
            image={post.image ?? ""}
            createdAt={post.createdAt}
            likes={post.likes ?? []}
            disLikes={post.disLikes ?? []}
            topic={post.topic}
            postID={post.id}
            key={post.id}
          />
        )}
      </div>
    </div>
  );
}

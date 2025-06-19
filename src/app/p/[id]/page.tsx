"use client";

import { PostDetails } from "@/components/post-details";
import { api } from "@/trpc/react";
import { useState } from "react";

export default function Feed() {
  //   const { user } = useGetUser();
  const [selectedOption, setSelectedOption] = useState("general");

  const { data: posts } = api.postRouter.getUserPosts.useQuery();

  return (
    <div className="relative flex h-screen w-screen flex-col gap-3 overflow-x-hidden px-2 py-2">
      {/* <Navbar />
      <div className="mt-2 flex w-screen items-center md:justify-start">
        <FetchOptions
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
      </div> */}
      {posts?.map((post) => (
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
      ))}
    </div>
  );
}

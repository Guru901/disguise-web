"use client";

import { Loader } from "@/components/loader";
import { PostCard } from "@/components/post-card";
import { FetchOptions } from "./fetch-options";
import { useState } from "react";
import Navbar from "@/components/navbar";
import useGetUser from "@/lib/use-get-user";
import { api } from "@/trpc/react";

export default function Feed() {
  const { user } = useGetUser();
  const [selectedOption, setSelectedOption] = useState("general");

  const { data: posts, isLoading: isPostsLoading } =
    api.postRouter.getFeed.useQuery();

  if (isPostsLoading) return <Loader />;

  return (
    <div className="relative flex h-screen w-screen flex-col gap-3 overflow-x-hidden px-2 py-2">
      <Navbar />
      <div className="mt-2 flex w-screen items-center md:justify-start">
        <FetchOptions
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
      </div>
      {posts?.map((post) => (
        <PostCard
          avatar={post.createdBy?.avatar ?? ""}
          username={post.createdBy?.username ?? "User"}
          title={post.title}
          image={post.image}
          createdAt={post.createdAt}
          content={post.content}
          id={post.id}
          key={post.id}
          likes={post.likes ?? []}
          disLikes={post.disLikes ?? []}
          userId={""}
        />
      ))}
    </div>
  );
}

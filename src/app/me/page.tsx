"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useUserStore } from "@/lib/userStore";
import Navbar from "@/components/navbar";
import { formatTimeAgo } from "@/lib/format-time-ago";
import MediaPlayer from "@/components/media-player";
import Masonry from "react-masonry-css";
import UserCard from "@/components/user-card";

const breakpointColumnsObjComments = {
  default: 3,
  1100: 2,
  700: 1,
};

const breakpointColumnsObj = {
  default: 3,
  1600: 2,
  1200: 1,
  1000: 2,
  600: 1,
};

export default function Me() {
  const [selectedOption, setSelectedOption] = useState("public");

  const { data, isLoading, isError } = api.userRouter.getUserData.useQuery();

  const { data: userPosts, isLoading: isPostsLoading } =
    api.postRouter.getLoggedInUserPublicPosts.useQuery();

  const { data: userLikedPosts, isLoading: isLikedPostsLoading } =
    api.postRouter.getLoggedInUserLikedPosts.useQuery();

  const { data: userPrivatePosts, isLoading: isPrivatePostsLoading } =
    api.postRouter.getLoggedInUserPrivatePosts.useQuery();

  const { data: userComments, isLoading: isCommentsLoading } =
    api.postRouter.getLoggedInUserComments.useQuery();

  const { data: userDisLikedPosts, isLoading: isDisLikedPostsLoading } =
    api.postRouter.getLoggedInUserDisLikedPosts.useQuery();

  const { data: userFriends, isLoading: isFriendsLoading } =
    api.postRouter.getLoggedInUserFriend.useQuery();

  const user = data?.user;
  const username = user?.username ?? "User";
  const avatar = user?.avatar ?? undefined;
  const posts = data?.user?.posts ?? [];
  const friends = user?.friends ?? [];
  const createdAt = user?.createdAt;
  const id = user?.id ?? "";

  const { setUser } = useUserStore();

  useEffect(() => {
    setUser({
      avatar: avatar,
      username: username,
      posts: posts,
      friends: friends,
      createdAt: createdAt?.toLocaleDateString() ?? "",
      id: id,
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Failed to load profile.</p>
      </div>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[430px_1fr]">
        <div className="bg-muted/40 border-r p-6 lg:p-8">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-44 w-44">
              <AvatarImage src={avatar} alt={username} />
              <AvatarFallback className="text-xl font-bold">
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-semibold">{username}</h2>
              <div className="flex flex-col items-center text-sm">
                <span className="text-primary text-sm">
                  Joined {formatTimeAgo(createdAt!)}
                </span>
              </div>
            </div>
            <div className="bg-background flex w-full items-center justify-around rounded-lg p-4 text-sm font-medium">
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">{posts.length}</span>
                <span className="text-muted-foreground">Posts</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">{friends.length}</span>
                <span className="text-muted-foreground">Friends</span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2">
              <div className="mt-2 flex w-full flex-wrap gap-2 lg:mt-0">
                <Tabs
                  defaultValue="public"
                  value={selectedOption}
                  className="w-full"
                  onValueChange={(e) => setSelectedOption(e)}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value={"public"} className={"w-1/3"}>
                      Public Posts ({userPosts?.length ?? 0})
                    </TabsTrigger>
                    <TabsTrigger value={"liked"} className={"w-1/3"}>
                      Liked Posts ({userLikedPosts?.length ?? 0})
                    </TabsTrigger>
                    <TabsTrigger value={"private"} className="w-1/3">
                      Private Posts ({userPrivatePosts?.length ?? 0})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex w-full flex-wrap gap-2 lg:mt-0">
                <Tabs
                  defaultValue="public"
                  value={selectedOption}
                  className="w-full"
                  onValueChange={(e) => setSelectedOption(e)}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value={"disLiked"} className={"w-1/3"}>
                      Disliked Posts ({userDisLikedPosts?.length ?? 0})
                    </TabsTrigger>
                    <TabsTrigger value={"comments"} className={"w-1/3"}>
                      Comments ({userComments?.length ?? 0})
                    </TabsTrigger>
                    <TabsTrigger value={"friends"} className={"w-1/3"}>
                      Friends ({friends.length ?? 0})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 lg:p-8">
          {selectedOption === "comments" ? (
            isCommentsLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="animate-spin" size={20} />
              </div>
            ) : (
              <Masonry
                breakpointCols={breakpointColumnsObjComments}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
              >
                {userComments?.map((comment) => (
                  <div key={comment.id}>
                    <Card className="overflow-hidden">
                      <Link
                        href={`/p/${comment.post}?comment=${comment.id}`}
                        className="h-full"
                      >
                        <CardContent className="h-full p-2">
                          <h1>{comment.content}</h1>
                        </CardContent>
                      </Link>
                    </Card>
                  </div>
                ))}
              </Masonry>
            )
          ) : selectedOption === "public" ? (
            isPostsLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="animate-spin" size={20} />
              </div>
            ) : (
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
              >
                {userPosts?.slice().map((post) => (
                  <div key={post.id}>
                    <Card className="overflow-hidden">
                      <Link href={`/p/${post.id}`} className="h-full">
                        <CardContent className="h-full p-0">
                          {post.image ? (
                            <div className="relative h-full">
                              <div className="absolute top-0 right-0 bottom-0 left-0 rounded-xl bg-black/40">
                                <div className="flex h-full w-full items-center justify-center rounded-xl text-xl text-white opacity-100">
                                  <h1>{post.title}</h1>
                                </div>
                              </div>
                              <MediaPlayer
                                url={post.image}
                                imageProps={{
                                  alt: "Post",
                                  width: 500,
                                  height: 300,
                                  className:
                                    "h-full w-full rounded-xl object-cover",
                                }}
                                videoProps={{
                                  className:
                                    "h-full w-full rounded-xl object-cover",
                                }}
                              />
                            </div>
                          ) : (
                            <div className="bg-secondary flex h-[500px] w-full items-center justify-center rounded-lg text-xl text-white">
                              <h1>{post.title}</h1>
                            </div>
                          )}
                        </CardContent>
                      </Link>
                    </Card>
                  </div>
                ))}
              </Masonry>
            )
          ) : selectedOption === "liked" ? (
            isLikedPostsLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="animate-spin" size={20} />
              </div>
            ) : (
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
              >
                {userLikedPosts?.slice().map((post) => (
                  <div key={post.id}>
                    <Card className="overflow-hidden">
                      <Link href={`/p/${post.id}`} className="h-full">
                        <CardContent className="h-full p-0">
                          {post.image ? (
                            <div className="relative h-full">
                              <div className="absolute top-0 right-0 bottom-0 left-0 rounded-xl bg-black/40">
                                <div className="flex h-full w-full items-center justify-center rounded-xl text-xl text-white opacity-100">
                                  <h1>{post.title}</h1>
                                </div>
                              </div>
                              <MediaPlayer
                                url={post.image}
                                imageProps={{
                                  alt: "Post",
                                  width: 500,
                                  height: 300,
                                  className:
                                    "h-full w-full rounded-xl object-cover",
                                }}
                                videoProps={{
                                  className:
                                    "h-full w-full rounded-xl object-cover",
                                }}
                              />
                            </div>
                          ) : (
                            <div className="bg-secondary flex h-[500px] w-full items-center justify-center rounded-lg text-xl text-white">
                              <h1>{post.title}</h1>
                            </div>
                          )}
                        </CardContent>
                      </Link>
                    </Card>
                  </div>
                ))}
              </Masonry>
            )
          ) : selectedOption === "private" ? (
            isPrivatePostsLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="animate-spin" size={20} />
              </div>
            ) : (
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
              >
                {userPrivatePosts?.slice().map((post) => (
                  <div key={post.id}>
                    <Card className="overflow-hidden">
                      <Link href={`/p/${post.id}`} className="h-full">
                        <CardContent className="h-full p-0">
                          {post.image ? (
                            <div className="relative h-full">
                              <div className="absolute top-0 right-0 bottom-0 left-0 rounded-xl bg-black/40">
                                <div className="flex h-full w-full items-center justify-center rounded-xl text-xl text-white opacity-100">
                                  <h1>{post.title}</h1>
                                </div>
                              </div>
                              <MediaPlayer
                                url={post.image}
                                imageProps={{
                                  alt: "Post",
                                  width: 500,
                                  height: 300,
                                  className:
                                    "h-full w-full rounded-xl object-cover",
                                }}
                                videoProps={{
                                  className:
                                    "h-full w-full rounded-xl object-cover",
                                }}
                              />
                            </div>
                          ) : (
                            <div className="bg-secondary flex h-[500px] w-full items-center justify-center rounded-lg text-xl text-white">
                              <h1>{post.title}</h1>
                            </div>
                          )}
                        </CardContent>
                      </Link>
                    </Card>
                  </div>
                ))}
              </Masonry>
            )
          ) : selectedOption === "disLiked" ? (
            isDisLikedPostsLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="animate-spin" size={20} />
              </div>
            ) : (
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
              >
                {userDisLikedPosts?.map((post) => (
                  <div key={post.id}>
                    <Card className="overflow-hidden">
                      <Link href={`/p/${post.id}`} className="h-full">
                        <CardContent className="h-full p-0">
                          {post.image ? (
                            <div className="relative h-full">
                              <div className="absolute top-0 right-0 bottom-0 left-0 rounded-xl bg-black/40">
                                <div className="flex h-full w-full items-center justify-center rounded-xl text-xl text-white opacity-100">
                                  <h1>{post.title}</h1>
                                </div>
                              </div>
                              <MediaPlayer
                                url={post.image}
                                imageProps={{
                                  alt: "Post",
                                  width: 500,
                                  height: 300,
                                  className:
                                    "h-full w-full rounded-xl object-cover",
                                }}
                                videoProps={{
                                  className:
                                    "h-full w-full rounded-xl object-cover",
                                }}
                              />
                            </div>
                          ) : (
                            <div className="bg-secondary flex h-[500px] w-full items-center justify-center rounded-lg text-xl text-white">
                              <h1>{post.title}</h1>
                            </div>
                          )}
                        </CardContent>
                      </Link>
                    </Card>
                  </div>
                ))}
              </Masonry>
            )
          ) : selectedOption === "friends" ? (
            isFriendsLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="animate-spin" size={20} />
              </div>
            ) : (
              <div>
                {userFriends &&
                  userFriends.friends.map((friend) => (
                    <UserCard user={friend} />
                  ))}
              </div>
            )
          ) : null}
        </div>
      </div>
    </main>
  );
}

"use client";

import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";
import { api } from "@/trpc/react";
import { useUserStore } from "@/lib/userStore";
import { formatTimeAgo } from "@/lib/format-time-ago";
import CommentGrid from "@/components/grids/comment-grid";
import PostGrid from "@/components/grids/post-grid";
import FriendsGrid from "@/components/grids/friends-grid";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Profile() {
  const selectedOption = useSearchParams().get("option") ?? "public";

  const { data, isLoading } = api.userRouter.getUserData.useQuery();

  // for caching the feed

  api.postRouter.getFeed.useQuery({
    page: 1,
    limit: 10,
  });

  const { data: userPosts, isLoading: isPostsLoading } =
    api.postRouter.getLoggedInUserPublicPosts.useQuery();

  const { data: userLikedPosts, isLoading: isLikedPostsLoading } =
    api.postRouter.getLoggedInUserLikedPosts.useQuery();

  const { data: userPrivatePosts, isLoading: isPrivatePostsLoading } =
    api.postRouter.getLoggedInUserPrivatePosts.useQuery();

  const { data: userComments, isLoading: isCommentsLoading } =
    api.postRouter.getLoggedInUserComments.useQuery();

  const { data: userSavedPosts, isLoading: isSavedPostsLoading } =
    api.postRouter.getLoggedInUserSavedPosts.useQuery();

  const { data: userFriends, isLoading: isFriendsLoading } =
    api.postRouter.getLoggedInUserFriend.useQuery();

  const user = data?.user;
  const username = user?.username ?? "User";
  const avatar = user?.avatar ?? undefined;
  const posts = data?.user?.posts ?? [];
  const friends = user?.friends ?? [];
  const createdAt = user?.createdAt;
  const lastOnline = user?.lastOnline;
  const blockedUsers = user?.blockedUsers ?? [];
  const savedPosts = user?.savedPosts ?? [];
  const joinedCommunities = user?.joinedCommunities ?? [];
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
      blockedUsers: blockedUsers,
      savedPosts: savedPosts,
      joinedCommunities: joinedCommunities,
    });
  }, []);
  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[430px_1fr]">
      <div className="bg-muted/40 border-r p-6 lg:p-8">
        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <div className="flex h-[308px] w-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <>
              <Avatar className="h-36 w-36 md:h-44 md:w-44">
                <AvatarImage src={avatar} alt={username} />
                <AvatarFallback className="text-xl font-bold">
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center">
                <h2 className="text-lg font-semibold md:text-xl">{username}</h2>
                <div className="flex flex-col items-center text-sm">
                  <p className="text-primary text-xs md:text-sm">
                    Joined {formatTimeAgo(createdAt!)}
                  </p>
                  <p className="text-primary text-xs md:text-sm">
                    Last Online {formatTimeAgo(lastOnline!)}
                  </p>
                </div>
              </div>
              <div className="bg-background flex w-full items-center justify-around rounded-lg py-2 text-sm font-medium md:p-4">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold md:text-xl">
                    {posts.length}
                  </span>
                  <span className="text-md text-muted-foreground md:text-lg">
                    Posts
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold md:text-xl">
                    {friends.length}
                  </span>
                  <span className="text-md text-muted-foreground md:text-lg">
                    Friends
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="flex w-full flex-col gap-2">
            <div className="mt-2 flex w-full flex-wrap gap-2 lg:mt-0">
              <Tabs
                defaultValue="public"
                value={selectedOption}
                className="w-full"
              >
                <TabsList className="w-full">
                  <Link className="w-1/3" href="?option=public">
                    <TabsTrigger
                      value={"public"}
                      className={"w-full cursor-pointer"}
                    >
                      Public Posts ({userPosts?.length ?? 0})
                    </TabsTrigger>
                  </Link>
                  <Link className="w-1/3" href="?option=liked">
                    <TabsTrigger
                      value={"liked"}
                      className={"w-full cursor-pointer"}
                    >
                      Liked Posts ({userLikedPosts?.length ?? 0})
                    </TabsTrigger>
                  </Link>
                  <Link className="w-1/3" href="?option=private">
                    <TabsTrigger
                      value={"private"}
                      className={"w-full cursor-pointer"}
                    >
                      Private Posts ({userPrivatePosts?.length ?? 0})
                    </TabsTrigger>
                  </Link>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex w-full flex-wrap gap-2 lg:mt-0">
              <Tabs
                defaultValue="public"
                value={selectedOption}
                className="w-full"
              >
                <TabsList className="w-full">
                  <Link className="w-1/3" href="?option=saved">
                    <TabsTrigger
                      value={"saved"}
                      className={"w-full cursor-pointer"}
                    >
                      Saved Posts ({userSavedPosts?.length ?? 0})
                    </TabsTrigger>
                  </Link>
                  <Link className="w-1/3" href="?option=comments">
                    <TabsTrigger
                      value={"comments"}
                      className={"w-full cursor-pointer"}
                    >
                      Comments ({userComments?.length ?? 0})
                    </TabsTrigger>
                  </Link>
                  <Link className="w-1/3" href="?option=friends">
                    <TabsTrigger
                      value={"friends"}
                      className={"w-full cursor-pointer"}
                    >
                      Friends ({friends.length ?? 0})
                    </TabsTrigger>
                  </Link>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <div className="px-2 py-6 lg:p-8">
        {selectedOption === "comments" ? (
          <CommentGrid comments={userComments} isLoading={isCommentsLoading} />
        ) : selectedOption === "public" ? (
          <PostGrid
            isLoading={isPostsLoading}
            posts={userPosts}
            option={selectedOption}
          />
        ) : selectedOption === "liked" ? (
          <PostGrid
            isLoading={isLikedPostsLoading}
            posts={userLikedPosts}
            option={selectedOption}
          />
        ) : selectedOption === "private" ? (
          <PostGrid
            isLoading={isPrivatePostsLoading}
            posts={userPrivatePosts}
            option={selectedOption}
          />
        ) : selectedOption === "saved" ? (
          <PostGrid
            isLoading={isSavedPostsLoading}
            posts={userSavedPosts}
            option={selectedOption}
          />
        ) : selectedOption === "friends" ? (
          <FriendsGrid
            friends={userFriends?.friends}
            isLoading={isFriendsLoading}
          />
        ) : null}
      </div>
    </div>
  );
}

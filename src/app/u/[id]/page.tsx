"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import Navbar from "@/components/navbar";
import { usePathname, useRouter } from "next/navigation";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { useUserStore } from "@/lib/userStore";
import {
  DialogTrigger,
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import Masonry from "react-masonry-css";
import UserPostLoader from "@/components/loaders/profile-loading";
import MediaPlayer from "@/components/media-player";
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

export default function UserProfile() {
  const [selectedOption, setSelectedOption] = useState("public");
  const [isFriend, setIsFriend] = useState(false);

  const { user: loggedInUser } = useUserStore();

  const pathName = usePathname();
  const id = pathName.split("/")[2];

  const router = useRouter();

  const { data, isLoading, isError } = api.userRouter.getUserDataById.useQuery({
    id: id!,
  });

  const { data: userPosts, isLoading: isPostsLoading } =
    api.postRouter.getUserPublicPostsByUserId.useQuery(
      {
        userId: data?.user?.id ?? "",
      },
      {
        enabled: isFriend ?? false,
      },
    );

  const { data: userLikedPosts, isLoading: isLikedPostsLoading } =
    api.postRouter.getUserlikedPostsByUserId.useQuery(
      {
        userId: data?.user?.id ?? "",
      },
      {
        enabled: isFriend ?? false,
      },
    );

  const { data: userPrivatePosts, isLoading: isPrivatePostsLoading } =
    api.postRouter.getUserPrivatePostsByUserId.useQuery(
      {
        userId: data?.user?.id ?? "",
      },
      {
        enabled: isFriend ?? false,
      },
    );

  const { data: userDisLikedPosts, isLoading: isDisLikedPostsLoading } =
    api.postRouter.getDislikedPostByUserId.useQuery(data?.user?.id ?? "", {
      enabled: isFriend ?? false,
    });

  const { data: userComments, isLoading: isCommentsLoading } =
    api.postRouter.getCommentsByUserId.useQuery(data?.user?.id ?? "", {
      enabled: isFriend ?? false,
    });

  const { data: userFriends, isLoading: isFriendsLoading } =
    api.postRouter.getFriendsByUserId.useQuery(data?.user?.id ?? "", {
      enabled: isFriend ?? false,
    });

  const removeFriendByIdMutation =
    api.userRouter.removeFriendById.useMutation();

  const addFriendByIdMutation = api.userRouter.sendFriendRequest.useMutation();

  const user = data?.user;
  const username = user?.username ?? "User";
  const avatar = user?.avatar ?? undefined;
  const posts = data?.user?.posts ?? [];
  const friends = user?.friends ?? [];
  const createdAt = user?.createdAt;
  const lastOnline = user?.lastOnline;

  const { data: isNotificationSent } =
    api.userRouter.isFriendNotificationSent.useQuery({
      id: user?.id ?? "",
    });

  useEffect(() => {
    setIsFriend(friends.includes(loggedInUser.id));
  }, [isNotificationSent, loggedInUser.id]);

  useEffect(() => {
    if (loggedInUser.id === id) {
      router.replace("/me");
    }
  }, [user, id]);

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
    <main className="flex flex-col gap-3 px-2 py-2">
      <Navbar />
      <div
        className={`grid min-h-screen w-full grid-cols-1 ${isFriend ? "lg:grid-cols-[430px_1fr]" : "lg:grid-cols-[300px_1fr]"}`}
      >
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
              <p className="text-primary text-sm">
                Joined {formatTimeAgo(createdAt!)}
              </p>
              <p className="text-primary text-sm">
                Last online {formatTimeAgo(lastOnline!)}
              </p>
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
            <div className="w-full">
              <div className="flex w-full gap-2">
                {isFriend ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-1/2" variant={"outline"}>
                        Remove Friend
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader className="text-center sm:text-left">
                        <DialogTitle className="text-lg font-semibold">
                          Remove Friend
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                          Are you sure you want to remove{" "}
                          <span className="text-foreground font-semibold">
                            {username}
                          </span>{" "}
                          from your friends list? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex flex-row space-x-2">
                        <DialogClose asChild>
                          <Button variant="outline" className="flex-1">
                            Cancel
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={async () => {
                              try {
                                await removeFriendByIdMutation.mutateAsync({
                                  id: id!,
                                });
                                setIsFriend(false);
                              } catch (error) {
                                console.error(
                                  "Failed to remove friend:",
                                  error,
                                );
                              }
                            }}
                          >
                            Remove Friend
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button
                    className="w-1/2"
                    variant={"outline"}
                    disabled={
                      addFriendByIdMutation.isPending ||
                      addFriendByIdMutation.isSuccess ||
                      isNotificationSent?.success
                    }
                    onClick={async () => {
                      void (await addFriendByIdMutation.mutateAsync({
                        id: id!,
                      }));
                    }}
                  >
                    {addFriendByIdMutation.isSuccess ||
                    isNotificationSent?.success ? (
                      "Request Sent"
                    ) : addFriendByIdMutation.isPending ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Add Friend"
                    )}
                  </Button>
                )}
                <Button disabled className="w-1/2" variant={"outline"}>
                  Message
                </Button>
              </div>
            </div>
            {isFriend && (
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
            )}
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
                {userComments?.reverse().map((comment) => (
                  <div key={comment.id}>
                    <Card className="overflow-hidden">
                      <Link href={`/p/${comment.post}`} className="h-full">
                        <CardContent className="h-full p-3">
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
              <UserPostLoader />
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
              <UserPostLoader />
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
              <UserPostLoader />
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
              <UserPostLoader />
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
              <div className="flex flex-col gap-2">
                {userFriends?.friends.map((friend) => (
                  <UserCard user={friend} key={friend.id} />
                ))}
              </div>
            )
          ) : null}
        </div>
      </div>
    </main>
  );
}

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
import { usePathname } from "next/navigation";
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
import { toast } from "sonner";

export default function Me() {
  const [selectedOption, setSelectedOption] = useState("public");

  const { user: loggedInUser } = useUserStore();

  const pathName = usePathname();
  const id = pathName.split("/")[2];

  const { data, isLoading, isError } = api.userRouter.getUserDataById.useQuery({
    id: id!,
  });

  const { data: userPosts, isLoading: isPostsLoading } =
    api.postRouter.getUserPublicPostsByUserId.useQuery(
      {
        userId: data?.user?.id ?? "",
      },
      {
        enabled: !!data?.user?.id,
      },
    );

  const { data: userLikedPosts, isLoading: isLikedPostsLoading } =
    api.postRouter.getUserlikedPostsByUserId.useQuery(
      {
        userId: data?.user?.id ?? "",
      },
      {
        enabled: !!data?.user?.id,
      },
    );

  const { data: userPrivatePosts, isLoading: isPrivatePostsLoading } =
    api.postRouter.getUserPrivatePostsByUserId.useQuery(
      {
        userId: data?.user?.id ?? "",
      },
      {
        enabled: !!data?.user?.id,
      },
    );

  const removeFriendByIdMutation =
    api.userRouter.removeFriendById.useMutation();

  const addFriendByIdMutation = api.userRouter.sendFriendRequest.useMutation();

  const [isFriend, setIsFriend] = useState(false);

  const user = data?.user;
  const username = user?.username ?? "User";
  const avatar = user?.avatar ?? undefined;
  const posts = data?.user?.posts ?? [];
  const friends = user?.friends ?? [];
  const createdAt = user?.createdAt;

  const isProfile = false;
  const { data: isNotificationSent } =
    api.userRouter.isFriendNotificationSent.useQuery({
      id: user?.id ?? "",
    });

  useEffect(() => {
    setIsFriend(friends.includes(loggedInUser.id));
  }, [isNotificationSent]);

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
              <span className="text-primary text-sm">
                Joined {formatTimeAgo(createdAt!)}
              </span>
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
              {!isProfile && (
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
                            from your friends list? This action cannot be
                            undone.
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
                      onClick={() => {
                        addFriendByIdMutation.mutateAsync({
                          id: id!,
                        });
                      }}
                    >
                      {addFriendByIdMutation.isSuccess ||
                      isNotificationSent?.success ? (
                        "Request Sent"
                      ) : addFriendByIdMutation.isPaused ? (
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
              )}
            </div>

            {isProfile ||
              (isFriend && (
                <div className="mt-2 flex w-full flex-wrap gap-2 lg:mt-0">
                  <Tabs
                    defaultValue="public"
                    value={selectedOption}
                    className="w-full"
                    onValueChange={(e) => setSelectedOption(e)}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger
                        value={"public"}
                        className={`${!isFriend ? "w-1/2" : "w-1/3"}`}
                      >
                        Public Posts ({userPosts?.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value={"liked"}
                        className={`${!isFriend ? "w-1/2" : "w-1/3"}`}
                      >
                        Liked Posts ({userLikedPosts?.length})
                      </TabsTrigger>
                      <TabsTrigger value={"private"} className="w-1/3">
                        Private Posts ({userPrivatePosts?.length})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              ))}
          </div>
        </div>
        <div className="p-6 lg:p-8">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {selectedOption === "public" ? (
              isPostsLoading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              ) : (
                userPosts?.slice().map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <Link href={`/p/${post.id}`} className="h-full">
                      <CardContent className="h-full p-0">
                        {post.image ? (
                          <div className="relative h-full">
                            <div className="absolute top-0 right-0 bottom-0 left-0 rounded-xl bg-black/40">
                              <div className="flex h-full w-full items-center justify-center rounded-xl text-xl text-white opacity-100">
                                <h1>{post.title}</h1>
                              </div>
                            </div>
                            <Image
                              src={post.image}
                              alt="Post"
                              width={500}
                              height={300}
                              className="h-full w-full rounded-xl object-cover"
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
                ))
              )
            ) : selectedOption === "liked" ? (
              isLikedPostsLoading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              ) : (
                userLikedPosts?.slice().map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <Link href={`/p/${post.id}`} className="h-full">
                      <CardContent className="h-full p-0">
                        {post.image ? (
                          <div className="relative h-full">
                            <div className="absolute top-0 right-0 bottom-0 left-0 rounded-xl bg-black/40">
                              <div className="flex h-full w-full items-center justify-center rounded-xl text-xl text-white opacity-100">
                                <h1>{post.title}</h1>
                              </div>
                            </div>
                            <Image
                              src={post.image}
                              alt="Post"
                              width={500}
                              height={300}
                              className="h-full w-full rounded-xl object-cover"
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
                ))
              )
            ) : selectedOption === "private" ? (
              isPrivatePostsLoading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              ) : (
                userPrivatePosts?.slice().map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <Link href={`/p/${post.id}`} className="h-full">
                      <CardContent className="h-full p-0">
                        {post.image ? (
                          <div className="relative h-full">
                            <div className="absolute top-0 right-0 bottom-0 left-0 rounded-xl bg-black/40">
                              <div className="flex h-full w-full items-center justify-center rounded-xl text-xl text-white opacity-100">
                                <h1>{post.title}</h1>
                              </div>
                            </div>
                            <Image
                              src={post.image}
                              alt="Post"
                              width={500}
                              height={300}
                              className="h-full w-full rounded-xl object-cover"
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
                ))
              )
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

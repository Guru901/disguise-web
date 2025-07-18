"use client";

import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import Navbar from "@/components/navbar";
import { usePathname, useRouter } from "next/navigation";
import { formatTimeAgo } from "@/lib/format-time-ago";
import {
  DialogTrigger,
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import useGetUser from "@/lib/use-get-user";
import { toast } from "sonner";
import PostGrid from "@/components/grids/post-grid";
import CommentGrid from "@/components/grids/comment-grid";
import FriendsGrid from "@/components/grids/friends-grid";

export default function UserProfile() {
  const [selectedOption, setSelectedOption] = useState("public");
  const [isFriend, setIsFriend] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isRemoveFriendDialogOpen, setIsRemoveFriendDialogOpen] =
    useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);

  const { user: loggedInUser, refetchUser } = useGetUser();

  const pathName = usePathname();
  const id = pathName.split("/")[2];

  const router = useRouter();

  const { data, isLoading, isError } = api.userRouter.getUserDataById.useQuery({
    id: id!,
  });

  const { data: userPosts, isLoading: isPostsLoading } =
    api.postRouter.getUserPublicPostsByUserId.useQuery({
      userId: id ?? "",
    });

  const { data: userLikedPosts, isLoading: isLikedPostsLoading } =
    api.postRouter.getUserlikedPostsByUserId.useQuery(
      {
        userId: id ?? "",
      },
      {
        enabled: isFriend ?? false,
      },
    );

  const { data: userPrivatePosts, isLoading: isPrivatePostsLoading } =
    api.postRouter.getUserPrivatePostsByUserId.useQuery(
      {
        userId: id ?? "",
      },
      {
        enabled: isFriend ?? false,
      },
    );

  const { data: userDisLikedPosts, isLoading: isDisLikedPostsLoading } =
    api.postRouter.getDislikedPostByUserId.useQuery(id ?? "", {
      enabled: isFriend ?? false,
    });

  const { data: userComments, isLoading: isCommentsLoading } =
    api.postRouter.getCommentsByUserId.useQuery(id ?? "", {
      enabled: isFriend ?? false,
    });

  const { data: userFriends, isLoading: isFriendsLoading } =
    api.postRouter.getFriendsByUserId.useQuery(id ?? "", {
      enabled: isFriend ?? false,
    });

  const removeFriendByIdMutation = api.userRouter.removeFriendById.useMutation({
    onSuccess: () => {
      setIsFriend(false);
      setIsRemoveFriendDialogOpen(false);
      toast("Friend removed successfully");
    },
    onError: (error) => {
      console.error("Failed to remove friend:", error);
      toast("Failed to remove friend");
    },
  });

  const unblockUserMutation = api.userRouter.unblockUser.useMutation({
    onSuccess: async () => {
      void (await refetchUser());
      toast("User successfully unblocked");
      setIsBlocked(false);
      setIsUnblockDialogOpen(false);
    },
    onError: (error) => {
      console.error("Failed to unblock user:", error);
      toast("Failed to unblock user");
    },
  });

  const blockUserMutation = api.userRouter.blockUser.useMutation({
    onSuccess: async () => {
      void (await refetchUser());
      toast("User successfully blocked");
      setIsBlocked(true);
      setIsFriend(false);
      setIsBlockDialogOpen(false);
    },
    onError: (error) => {
      console.error("Failed to block user:", error);
      toast("Failed to block user");
    },
  });

  const addFriendByIdMutation = api.userRouter.sendFriendRequest.useMutation();

  const user = data?.user;
  const username = user?.username ?? "User";
  const avatar = user?.avatar ?? undefined;
  const posts = data?.user?.posts ?? [];
  const friends = user?.friends ?? [];
  const createdAt = user?.createdAt;
  const lastOnline = user?.lastOnline;

  const { data: isNotificationSent } =
    api.userRouter.isFriendNotificationSent.useQuery(
      {
        id: id ?? "",
      },
      {
        enabled: !isBlocked && !isFriend,
      },
    );

  useEffect(() => {
    setIsFriend(friends.includes(loggedInUser.id));
  }, [friends, isNotificationSent, loggedInUser.id]);

  useEffect(() => {
    if (loggedInUser.id === id) {
      router.replace("/me");
    }
  }, [user, id, loggedInUser.id, router]);

  useEffect(() => {
    if (loggedInUser.blockedUsers?.includes(id!)) {
      setIsBlocked(true);
    }
  }, [id, loggedInUser.blockedUsers]);

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
                  <Dialog
                    open={isRemoveFriendDialogOpen}
                    onOpenChange={setIsRemoveFriendDialogOpen}
                  >
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
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setIsRemoveFriendDialogOpen(false)}
                          disabled={removeFriendByIdMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          disabled={removeFriendByIdMutation.isPending}
                          onClick={async () => {
                            await removeFriendByIdMutation.mutateAsync({
                              id: id!,
                            });
                          }}
                        >
                          {removeFriendByIdMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="animate-spin" size={16} />
                              Removing...
                            </div>
                          ) : (
                            "Remove Friend"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  !isBlocked && (
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
                  )
                )}

                {isBlocked ? (
                  <Dialog
                    open={isUnblockDialogOpen}
                    onOpenChange={setIsUnblockDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full" variant={"outline"}>
                        Unblock
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader className="text-center sm:text-left">
                        <DialogTitle className="text-lg font-semibold">
                          Unblock {username}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                          Are you sure you want to unblock{" "}
                          <span className="text-foreground font-semibold">
                            {username}.
                          </span>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex flex-row space-x-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setIsUnblockDialogOpen(false)}
                          disabled={unblockUserMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1"
                          disabled={unblockUserMutation.isPending}
                          onClick={async () => {
                            await unblockUserMutation.mutateAsync({
                              userToUnblockId: id!,
                            });
                          }}
                        >
                          {unblockUserMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="animate-spin" size={16} />
                              Unblocking...
                            </div>
                          ) : (
                            "Unblock"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Dialog
                    open={isBlockDialogOpen}
                    onOpenChange={setIsBlockDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-1/2" variant={"destructive"}>
                        Block
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader className="text-center sm:text-left">
                        <DialogTitle className="text-lg font-semibold">
                          Block {username}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                          Are you sure you want to block{" "}
                          <span className="text-foreground font-semibold">
                            {username}.
                          </span>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex flex-row space-x-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setIsBlockDialogOpen(false)}
                          disabled={blockUserMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          disabled={blockUserMutation.isPending}
                          onClick={async () => {
                            await blockUserMutation.mutateAsync({
                              userToBlockId: id!,
                              isFriend: isFriend,
                            });
                          }}
                        >
                          {blockUserMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="animate-spin" size={16} />
                              Blocking...
                            </div>
                          ) : (
                            "Block User"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
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
            <CommentGrid
              comments={userComments}
              isLoading={isCommentsLoading}
            />
          ) : selectedOption === "public" ? (
            <PostGrid posts={userPosts} isLoading={isPostsLoading} />
          ) : selectedOption === "liked" ? (
            <PostGrid posts={userLikedPosts} isLoading={isLikedPostsLoading} />
          ) : selectedOption === "private" ? (
            <PostGrid
              posts={userPrivatePosts}
              isLoading={isPrivatePostsLoading}
            />
          ) : selectedOption === "disLiked" ? (
            <PostGrid
              posts={userDisLikedPosts}
              isLoading={isDisLikedPostsLoading}
            />
          ) : selectedOption === "friends" ? (
            isFriendsLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="animate-spin" size={20} />
              </div>
            ) : (
              <FriendsGrid friends={userFriends?.friends} />
            )
          ) : null}
        </div>
      </div>
    </main>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Card,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Smartphone, UserX, Trash2, Camera, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CldUploadButton } from "next-cloudinary";
import { toast } from "sonner";
import {
  Dialog,
  DialogFooter,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { parseDate } from "chrono-node";
import { useUserStore, type Font } from "@/lib/userStore";
import { Controller, useForm } from "react-hook-form";
import {
  changePasswordSchema,
  type TChnagePasswordSchema,
} from "@/lib/schemas";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";

export function ProfileSettings() {
  const getUserDataQuery = api.userRouter.getUserData.useQuery();
  const user = getUserDataQuery.data?.user;

  const editAvatarMutation = api.userRouter.editAvatar.useMutation({
    onSuccess: async () => {
      void getUserDataQuery.refetch();
      toast("Avatar updated successfully");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your public profile information.
        </p>
      </div>

      <Card className="py-6">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            This will be displayed on your profile and posts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {getUserDataQuery.isLoading || getUserDataQuery.isRefetching ? (
              <Skeleton className="h-20 w-20 rounded-full" />
            ) : (
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={user?.avatar ? String(user.avatar) : undefined}
                />
                <AvatarFallback>
                  {user?.username ? String(user.username).slice(0, 2) : ""}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex items-center gap-2">
              <CldUploadButton
                options={{
                  resourceType: "image",
                  clientAllowedFormats: [
                    "jpg",
                    "jpeg",
                    "png",
                    "gif",
                    "webp",
                    "bmp",
                    "tiff",
                    "svg",
                    "ico",
                    "avif",
                    "heic",
                    "heif",
                    "jxl",
                    "jp2",
                    "raw",
                    "psd",
                  ],
                  maxFiles: 1,
                }}
                uploadPreset="social-media-again"
                className="w-full"
                onSuccess={async (results) => {
                  // @ts-expect-error - results.info is not typed
                  const imageUrl = String(results.info.secure_url);
                  await editAvatarMutation.mutateAsync({ avatar: imageUrl });
                }}
              >
                <Button
                  size="sm"
                  disabled={
                    editAvatarMutation.isPending || getUserDataQuery.isLoading
                  }
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
              </CldUploadButton>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  editAvatarMutation.isPending ||
                  user?.avatar?.length === 0 ||
                  getUserDataQuery.isLoading
                }
                onClick={async () => {
                  await editAvatarMutation.mutateAsync({
                    avatar: "",
                  });
                }}
              >
                {editAvatarMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" />
                    Removing
                  </div>
                ) : (
                  "Remove"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PrivacySettings() {
  const getUserDataQuery = api.userRouter.getUserData.useQuery();
  const user = getUserDataQuery.data?.user;

  const accountTypeMutation = api.userRouter.changeAccountType.useMutation({
    onSuccess: async () => {
      void getUserDataQuery.refetch();
      toast("Your account type has been successfully updated");
    },
  });

  const {
    data: blockedUsers,
    isLoading: isBlockedUsersLoading,
    refetch: refetchBlockedUsers,
  } = api.userRouter.getBlockedUsers.useQuery();

  const unblockUserMutation = api.userRouter.unblockUser.useMutation({
    onSuccess: async (data) => {
      await refetchBlockedUsers();
      toast(`Unblocked ${data.username} successfully`);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Privacy</h2>
        <p className="text-muted-foreground">
          Control who can see your content and interact with you.
        </p>
      </div>

      <Card className="py-6">
        <CardHeader>
          <CardTitle>Account Privacy</CardTitle>
          <CardDescription>
            Manage who can see your profile and posts.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Private Account</Label>
              <p className="text-muted-foreground text-sm">
                Only friends can see your posts
              </p>
            </div>
            <Switch
              defaultChecked={Boolean(user?.accountType === "private")}
              onCheckedChange={async (e) => {
                await accountTypeMutation.mutateAsync({
                  isPrivate: e,
                });
              }}
            />
          </div>
          {/* <Separator />
            <div className="space-y-2">
              <Label>Who can see your posts</Label>
              <Select defaultValue="everyone">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="friends">Friends only</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          {/* <div className="space-y-2">
              <Label>Who can message you</Label>
              <Select defaultValue="followers">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="followers">Followers only</SelectItem>
                  <SelectItem value="none">No one</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
        </CardContent>
      </Card>

      <Card className="py-6">
        <CardHeader>
          <CardTitle>Blocked Users</CardTitle>
          <CardDescription>Manage users {"you've"} blocked.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {isBlockedUsersLoading ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-2 w-18" />
                </div>
              ) : (
                blockedUsers?.data?.map((blockedUser) => {
                  return (
                    <>
                      <div
                        className="flex items-center gap-3"
                        key={blockedUser.id}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={String(blockedUser.avatar)} />
                          <AvatarFallback>
                            {blockedUser.username.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {blockedUser.username}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={unblockUserMutation.isPending}
                        onClick={async () => {
                          await unblockUserMutation.mutateAsync({
                            userToUnblockId: blockedUser.id,
                            userToUnblockUsername: blockedUser.username,
                          });
                        }}
                      >
                        {unblockUserMutation.isPending ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Unblock
                          </>
                        )}
                      </Button>
                    </>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function NotificationSettings() {
  const getUserDataQuery = api.userRouter.getUserData.useQuery();
  const user = getUserDataQuery.data?.user;

  const [receiveNotificationsForLike, setReceiveNotificationsForLike] =
    useState(user?.receiveNotificationsForLike ?? true);
  const [receiveNotificationsForComment, setReceiveNotificationsForComment] =
    useState(user?.receiveNotificationsForComment ?? true);
  const [receiveNotificationsForMention, setReceiveNotificationsForMention] =
    useState(user?.receiveNotificationsForMention ?? true);
  const [
    receiveNotificationsForFriendRequest,
    setReceiveNotificationsForFriendRequest,
  ] = useState(user?.receiveNotificationsForFriendRequest ?? true);
  const [
    receiveNotificationsForFriendPost,
    setReceiveNotificationsForFriendPost,
  ] = useState(user?.receiveNotificationsForFriendPost ?? true);

  const chnageNotificationSettingForPostMutation =
    api.userRouter.changeNotificationSettingsForPost.useMutation({
      onSuccess: () => {
        void getUserDataQuery.refetch();
      },
      onMutate: (data) => {
        setReceiveNotificationsForFriendPost((prev) => !prev);
        if (data.pref) {
          toast("You will now receive notifications for new posts");
        } else {
          toast("You will no longer receive notifications for new posts");
        }
      },
    });

  const chnageNotificationSettingForCommentMutation =
    api.userRouter.changeNotificationSettingsForComment.useMutation({
      onSuccess: () => {
        void getUserDataQuery.refetch();
      },
      onMutate: (data) => {
        setReceiveNotificationsForComment((prev) => !prev);
        if (data.pref) {
          toast("You will now receive notifications for new comments");
        } else {
          toast("You will no longer receive notifications for new comments");
        }
      },
    });

  const chnageNotificationSettingForFriendRequestMutation =
    api.userRouter.changeNotificationSettingsForFriendRequest.useMutation({
      onSuccess: () => {
        void getUserDataQuery.refetch();
      },
      onMutate: (data) => {
        setReceiveNotificationsForFriendRequest((prev) => !prev);
        if (data.pref) {
          toast("You will now receive notifications for friend requests");
        } else {
          toast("You will no longer receive notifications for friend requests");
        }
      },
    });

  const chnageNotificationSettingForLikeMutation =
    api.userRouter.changeNotificationSettingsForLike.useMutation({
      onSuccess: () => {
        void getUserDataQuery.refetch();
      },
      onMutate: (data) => {
        setReceiveNotificationsForLike((prev) => !prev);
        if (data.pref) {
          toast("You will now receive notifications for likes");
        } else {
          toast("You will no longer receive notifications for likes");
        }
      },
    });

  const chnageNotificationSettingForMentionMutation =
    api.userRouter.changeNotificationSettingsForMention.useMutation({
      onSuccess: () => {
        void getUserDataQuery.refetch();
      },
      onMutate: (data) => {
        setReceiveNotificationsForMention((prev) => !prev);
        if (data.pref) {
          toast("You will now receive notifications for mentions");
        } else {
          toast("You will no longer receive notifications for mentions");
        }
      },
    });

  useEffect(() => {
    setReceiveNotificationsForLike(user?.receiveNotificationsForLike ?? true);
    setReceiveNotificationsForComment(
      user?.receiveNotificationsForComment ?? true,
    );
    setReceiveNotificationsForMention(
      user?.receiveNotificationsForMention ?? true,
    );
    setReceiveNotificationsForFriendRequest(
      user?.receiveNotificationsForFriendRequest ?? true,
    );
    setReceiveNotificationsForFriendPost(
      user?.receiveNotificationsForFriendPost ?? true,
    );
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">
          Choose what notifications you want to receive.
        </p>
      </div>

      <Card className="py-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Likes</Label>
              <p className="text-muted-foreground text-sm">
                When someone likes your post
              </p>
            </div>
            {getUserDataQuery.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Switch
                checked={receiveNotificationsForLike}
                onCheckedChange={(e) => {
                  void chnageNotificationSettingForLikeMutation.mutateAsync({
                    pref: e,
                  });
                }}
              />
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Comments</Label>
              <p className="text-muted-foreground text-sm">
                When someone comments on your post
              </p>
            </div>
            {getUserDataQuery.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Switch
                checked={receiveNotificationsForComment}
                onCheckedChange={(e) => {
                  void chnageNotificationSettingForCommentMutation.mutateAsync({
                    pref: e,
                  });
                }}
              />
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">New Friend Request</Label>
              <p className="text-muted-foreground text-sm">
                When someone sends you a friend request
              </p>
            </div>
            {getUserDataQuery.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Switch
                checked={receiveNotificationsForFriendRequest}
                onCheckedChange={(e) => {
                  void chnageNotificationSettingForFriendRequestMutation.mutateAsync(
                    {
                      pref: e,
                    },
                  );
                }}
              />
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Post</Label>
              <p className="text-muted-foreground text-sm">
                When your friend uploads a new post
              </p>
            </div>
            {getUserDataQuery.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Switch
                defaultChecked={receiveNotificationsForFriendPost}
                onCheckedChange={(e) => {
                  void chnageNotificationSettingForPostMutation.mutateAsync({
                    pref: e,
                  });
                }}
              />
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Mentions</Label>
              <p className="text-muted-foreground text-sm">
                When someone mentions you in a post
              </p>
            </div>
            {getUserDataQuery.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Switch
                defaultChecked={receiveNotificationsForMention}
                onCheckedChange={(e) => {
                  void chnageNotificationSettingForMentionMutation.mutateAsync({
                    pref: e,
                  });
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AccountSettings() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("In 2 days");
  const [date, setDate] = useState<Date | undefined>(
    parseDate(value) ?? undefined,
  );
  const [month, setMonth] = useState<Date | undefined>(date);
  const [isDeactivatedDialogOpen, setIsDeactivatedDialogOpen] = useState(false);
  const [isDeletedDialogOpen, setIsDeletedDialogOpen] = useState(false);
  const { setUser } = useUserStore();

  const { data: userData } = api.userRouter.getUserData.useQuery();
  const changePasswordMutation = api.userRouter.changePassword.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast("Password updated successfully");
        reset();
      } else {
        setError("root", {
          message: data.message,
        });
      }
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isLoading, errors },
    reset,
    setError,
  } = useForm<TChnagePasswordSchema>({
    resolver: valibotResolver(changePasswordSchema),
  });

  const deactivateAccountMutation =
    api.userRouter.deactivateAccount.useMutation({
      onSuccess: async () => {
        toast(`Account deactivated till ${date?.toDateString()}`);
        await fetch("/api/logout");
        setUser({
          avatar: "",
          username: "",
          posts: [],
          friends: [],
          createdAt: "",
          id: "",
          blockedUsers: [],
          savedPosts: [],
          joinedCommunities: [],
        });
        location.href = "/login";
      },
    });

  const deleteAccountMutation = api.userRouter.deleteAccount.useMutation({
    onSuccess: async () => {
      toast("Account deleted");
      await fetch("/api/logout");
      setUser({
        avatar: "",
        username: "",
        posts: [],
        friends: [],
        createdAt: "",
        id: "",
        blockedUsers: [],
        savedPosts: [],
        joinedCommunities: [],
      });
      location.href = "/login";
    },
  });

  function formatDate(date: Date | undefined) {
    if (!date) {
      return "";
    }

    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  async function onSubmit(formData: TChnagePasswordSchema) {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
    } catch (error) {
      console.error(error);
      setError("root", {
        message: "Something went wrong on our side",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account</h2>
        <p className="text-muted-foreground">
          Manage your account settings and security.
        </p>
      </div>

      <Card className="py-6">
        <CardHeader>
          <CardTitle>Login Information</CardTitle>
          <CardDescription>Update your email and password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              disabled
              value={userData?.user?.username}
              placeholder="Username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field }) => (
                <Input
                  id="currentPassword"
                  type="password"
                  showPasswordToggle
                  {...field}
                />
              )}
            />
            {errors.currentPassword && (
              <p className="text-destructive text-sm">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Controller
              control={control}
              name="newPassword"
              render={({ field }) => (
                <Input
                  id="newPassword"
                  type="password"
                  showPasswordToggle
                  {...field}
                />
              )}
            />
            {errors.newPassword && (
              <p className="text-destructive text-sm">
                {errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPasswordConfirm">Confirm New Password</Label>
            <Controller
              control={control}
              name="newPasswordConfirm"
              render={({ field }) => (
                <Input
                  id="newPasswordConfirm"
                  type="password"
                  showPasswordToggle
                  {...field}
                />
              )}
            />

            {errors.newPasswordConfirm && (
              <p className="text-destructive text-sm">
                {errors.newPasswordConfirm.message}
              </p>
            )}
          </div>
          {errors.root && (
            <p className="text-destructive text-sm">{errors.root.message}</p>
          )}
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={changePasswordMutation.isPending || isLoading}
          >
            {changePasswordMutation.isPending || isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Updating...
              </div>
            ) : (
              "Update Password"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive py-6">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Deactivate Account</Label>
              <p className="text-muted-foreground text-sm">
                Temporarily disable your account
              </p>
            </div>
            <Dialog
              open={isDeactivatedDialogOpen}
              onOpenChange={setIsDeactivatedDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">Deactivate</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center sm:text-left">
                  <DialogTitle className="text-lg font-semibold">
                    Deactivate
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground flex flex-col gap-3 text-sm">
                    <p>
                      Are you sure, you want to deactivate your account. You
                      won&apos;t be able to log in while it&apos;s deactivated.
                    </p>
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="date" className="px-1">
                        Activate again
                      </Label>
                      <div className="relative flex gap-2">
                        <Input
                          id="date"
                          value={value}
                          placeholder="Tomorrow or next week"
                          className="bg-background pr-10"
                          onChange={(e) => {
                            setValue(e.target.value);
                            const date = parseDate(e.target.value);
                            if (date) {
                              setDate(date);
                              setMonth(date);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setOpen(true);
                            }
                          }}
                        />
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              id="date-picker"
                              variant="ghost"
                              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                            >
                              <CalendarIcon className="size-3.5" />
                              <span className="sr-only">Select date</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="end"
                          >
                            <Calendar
                              mode="single"
                              selected={date}
                              captionLayout="dropdown"
                              month={month}
                              onMonthChange={setMonth}
                              onSelect={(date) => {
                                setDate(date);
                                setValue(formatDate(date));
                                setOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="text-muted-foreground px-1 text-sm">
                        Your post will be published on{" "}
                        <span className="font-medium">{formatDate(date)}</span>.
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDeactivatedDialogOpen(false)}
                    disabled={deactivateAccountMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={deactivateAccountMutation.isPending}
                    onClick={async () => {
                      await deactivateAccountMutation.mutateAsync({
                        deactivateTill: date!,
                      });
                    }}
                  >
                    {deactivateAccountMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Deactivating...
                      </div>
                    ) : (
                      "Deactivate"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-destructive text-base">
                Delete Account
              </Label>
              <p className="text-muted-foreground text-sm">
                Permanently delete your account and all data
              </p>
            </div>
            <Dialog
              open={isDeletedDialogOpen}
              onOpenChange={setIsDeletedDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 /> Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center sm:text-left">
                  <DialogTitle className="text-lg font-semibold">
                    Deactivate
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground flex flex-col gap-3 text-sm">
                    <p>Are you sure, you want to delete your account.</p>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDeletedDialogOpen(false)}
                    disabled={deleteAccountMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={deleteAccountMutation.isPending}
                    onClick={async () => {
                      await deleteAccountMutation.mutateAsync();
                    }}
                  >
                    {deleteAccountMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Deleting...
                      </div>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CustomiseSettings() {
  const font = useUserStore((s) => s.font);
  const setFont = useUserStore((s) => s.setFont);
  const { setTheme } = useTheme();

  const fonts = [
    { label: "Inter", value: "inter" },
    { label: "Spline Sans", value: "spline" },
    { label: "Roboto", value: "roboto" },
    { label: "Fira", value: "fira" },
    { label: "Ubuntu", value: "ubuntu" },
  ];

  const themes = ["light", "dark", "caffeine", "sunset", "ghibli", "t3-chat"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Customise</h2>
        <p className="text-muted-foreground">Make the site your own.</p>
      </div>

      <Card className="py-6">
        <CardHeader>
          <CardTitle>Font</CardTitle>
          <CardDescription>Update the font to your liking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={(e) => setFont(e as Font)}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={fonts.find((f) => f.value === font)?.label}
              />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {fonts.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card className="py-6">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Update the theme to your liking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={(e) => setTheme(e)}>
            <SelectTrigger className="w-full capitalize">
              <SelectValue placeholder={"Select a theme"} />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {themes.map((f) => (
                  <SelectItem key={f} value={f} className="capitalize">
                    {f === "t3-chat" ? "Pink" : f}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import {
  useEffect,
  useState,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Shield,
  Bell,
  Settings,
  Smartphone,
  UserX,
  Trash2,
  Camera,
  Loader2,
  ChevronUp,
  XIcon,
  type LucideProps,
} from "lucide-react";
import Navbar from "@/components/navbar";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { CldUploadButton } from "next-cloudinary";
import { toast } from "sonner";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import {
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  Drawer,
} from "@/components/ui/drawer";
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
import { useUserStore } from "@/lib/userStore";
import { Controller, useForm } from "react-hook-form";
import {
  changePasswordSchema,
  type TChnagePasswordSchema,
} from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";

type GetUserDataQueryType = ReturnType<
  typeof api.userRouter.getUserData.useQuery
>;
type GetUserDataOutput =
  inferRouterOutputs<AppRouter>["userRouter"]["getUserData"];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  const getUserDataQuery = api.userRouter.getUserData.useQuery();

  return (
    <div className="bg-background min-h-screen px-2 py-2">
      <Navbar />
      <div className="w-full flex-1 items-start py-6 md:flex md:gap-6 lg:container lg:m-auto lg:w-[calc(100vw-20rem)] lg:gap-10 lg:px-0">
        <SettingsNavigation
          setActiveSection={setActiveSection}
          activeSection={activeSection}
        />
        <div className="w-full px-2">
          {/* Main Content */}
          <div className="flex w-full flex-col overflow-hidden">
            {activeSection === "profile" && (
              <ProfileSettings getUserDataQuery={getUserDataQuery} />
            )}
            {activeSection === "privacy" && (
              <PrivacySettings getUserDataQuery={getUserDataQuery} />
            )}
            {activeSection === "notifications" && <NotificationSettings />}
            {activeSection === "account" && <AccountSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({
  getUserDataQuery,
}: {
  getUserDataQuery: GetUserDataQueryType;
}) {
  const user = getUserDataQuery.data as GetUserDataOutput;

  const editAvatarMutation = api.userRouter.editAvatar.useMutation({
    onSuccess: async () => {
      await getUserDataQuery.refetch();
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
                <AvatarImage src={String(user?.user?.avatar)} />
                <AvatarFallback>
                  {String(user?.user?.username).slice(0, 2)}
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
                  user?.user?.avatar?.length === 0 ||
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

function PrivacySettings({
  getUserDataQuery,
}: {
  getUserDataQuery: GetUserDataQueryType;
}) {
  const user = getUserDataQuery.data as GetUserDataOutput;

  const accountTypeMutation = api.userRouter.changeAccountType.useMutation({
    onSuccess: async () => {
      await getUserDataQuery.refetch();
      toast("Your account type has been successfully updated");
    },
  });

  const { data: blockedUsers, isLoading: isBlockedUsersLoading } =
    api.userRouter.getBlockedUsers.useQuery();

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
              defaultChecked={Boolean(user.user?.accountType === "private")}
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
                      <Button variant="outline" size="sm">
                        <UserX className="mr-2 h-4 w-4" />
                        Unblock
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

function NotificationSettings() {
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
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Comments</Label>
              <p className="text-muted-foreground text-sm">
                When someone comments on your post
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">New Friend Request</Label>
              <p className="text-muted-foreground text-sm">
                When someone sends you a friend request
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          {/* <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Direct Messages</Label>
              <p className="text-muted-foreground text-sm">
                When you receive a new message
              </p>
            </div>
            <Switch defaultChecked />
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}

function AccountSettings() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("In 2 days");
  const [date, setDate] = useState<Date | undefined>(
    parseDate(value) ?? undefined,
  );
  const [month, setMonth] = useState<Date | undefined>(date);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    resolver: zodResolver(changePasswordSchema),
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    onClick={() => setIsDialogOpen(false)}
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
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsNavigation({
  setActiveSection,
  activeSection,
}: {
  setActiveSection: (id: string) => void;
  activeSection: string;
}) {
  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: Settings },
  ];

  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    setIsDesktop(window.innerWidth > 768);
  }, []);

  return !isDesktop ? (
    <SettingsBottomNav
      setActiveSection={setActiveSection}
      activeSection={activeSection}
      sections={sections}
    />
  ) : (
    <SettingsSidebar
      setActiveSection={setActiveSection}
      activeSection={activeSection}
      sections={sections}
    />
  );
}

function SettingsSidebar({
  setActiveSection,
  activeSection,
  sections,
}: {
  setActiveSection: (id: string) => void;
  activeSection: string;
  sections: {
    id: string;
    label: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
  }[];
}) {
  return (
    <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-max shrink-0 md:sticky md:block">
      <div className="h-full py-6 pr-6 lg:py-8">
        <nav className="grid items-start gap-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant="ghost"
                onClick={() => setActiveSection(section.id)}
                className={`justify-start gap-4 font-medium transition-colors ${activeSection === section.id ? "bg-muted text-primary" : ""}`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function SettingsBottomNav({
  setActiveSection,
  activeSection,
  sections,
}: {
  setActiveSection: (id: string) => void;
  activeSection: string;
  sections: {
    id: string;
    label: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
  }[];
}) {
  return (
    <Card className="bottom-nav fixed bottom-20 z-10 flex w-[98%] flex-row items-center justify-between p-4">
      <div></div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" size="icon">
            <ChevronUp className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-background p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <XIcon />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </DrawerClose>
          </div>
          <nav className="mt-6 space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <DrawerClose asChild key={section.id} className="w-full">
                  <Button
                    onClick={() => setActiveSection(section.id)}
                    className={`flex cursor-pointer justify-start ${activeSection === section.id ? "bg-muted text-primary" : ""}`}
                    variant={"ghost"}
                  >
                    <Icon />
                    {section.label}
                  </Button>
                </DrawerClose>
              );
            })}
          </nav>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}

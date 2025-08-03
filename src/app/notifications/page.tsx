"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Heart,
  MessageCircle,
  Trash2,
  Check,
  AtSign,
  UserPlus,
  X,
  BellMinus,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/format-time-ago";
import Navbar from "@/components/navbar";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import Link from "next/link";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "comment":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "mention":
      return <AtSign className="h-4 w-4 text-purple-500" />;
    case "friend_request":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const FriendRequestNotification = ({
  notification,
  markAsReadMutation,
  deleteNotificationMutation,
  refetchNotifications,
}: {
  refetchNotifications: () => Promise<void>;
  notification: {
    id: string;
    type: string;
    content: string;
    read: boolean;
    createdAt: Date;
    message: string;
    byUser: {
      id: string | null;
      username: string | null;
      avatar: string | null;
    };
  };
  markAsReadMutation: { mutate: (id: string) => Promise<void> };
  deleteNotificationMutation: { mutate: (id: string) => Promise<void> };
}) => {
  const acceptFriendRequestMutation =
    api.userRouter.acceptFriendRequest.useMutation({
      onSuccess: async () => {
        toast.success("Friend request accepted");
        await refetchNotifications();
      },
    });

  const rejectFriendRequestMutation =
    api.userRouter.rejectFriendRequest.useMutation({
      onSuccess: async () => {
        toast.success("Friend request rejected");
        await refetchNotifications();
      },
    });

  return (
    <Card className={`border-l-4 transition-all duration-200 hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={notification.byUser.avatar ?? ""}
                alt={notification.byUser.username ?? ""}
              />
              <AvatarFallback>
                {notification.byUser.username!.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  {getNotificationIcon(notification.type)}
                  <p className="truncate text-sm font-medium">
                    {notification.content}
                  </p>
                  {!notification.read && (
                    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                  )}
                </div>
                <p className="text-muted-foreground mb-3 text-sm">
                  {notification.message}
                </p>

                <div className="mb-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    className="text-white"
                    onClick={async () => {
                      void (await acceptFriendRequestMutation.mutateAsync({
                        id: notification.byUser.id!,
                      }));
                    }}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      void (await rejectFriendRequestMutation.mutateAsync({
                        id: notification.byUser.id!,
                      }));
                    }}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Decline
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () =>
                          void (await markAsReadMutation.mutate(
                            notification.id,
                          ))
                        }
                        className="h-6 w-6 p-0"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                      onClick={async () =>
                        void (await deleteNotificationMutation.mutate(
                          notification.id,
                        ))
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RegularNotification = ({
  notification,
  markAsReadMutation,
  deleteNotificationMutation,
}: {
  notification: {
    id: string;
    type: string;
    content: string;
    read: boolean;
    createdAt: Date;
    message: string;
    byUser: {
      id: string | null;
      username: string | null;
      avatar: string | null;
    };
    post: string | null;
  };
  markAsReadMutation: { mutateAsync: (id: string) => Promise<void> };
  deleteNotificationMutation: { mutateAsync: (id: string) => Promise<void> };
}) => {
  return (
    <Link href={`/p?post=${notification.post ?? ""}`}>
      <Card
        className={`transition-all duration-200 hover:shadow-md ${
          !notification.read ? "ring-primary/20 ring-2" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={notification.byUser.avatar ?? ""}
                  alt={notification.byUser.username ?? ""}
                />
                <AvatarFallback className="text-xs">
                  {notification.byUser.username!.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    <p className="truncate text-sm font-medium">
                      {notification.content}
                    </p>
                    {!notification.read && (
                      <div className="bg-primary h-2 w-2 flex-shrink-0 rounded-full" />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2 text-sm">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          e.nativeEvent instanceof MouseEvent &&
                          e.currentTarget.closest("a")
                        ) {
                          e.preventDefault?.();
                        }
                      }}
                    >
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            e.preventDefault?.();
                            void (await markAsReadMutation.mutateAsync(
                              notification.id,
                            ));
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                        onClick={async (e) => {
                          e.stopPropagation();
                          e.preventDefault?.();
                          void (await deleteNotificationMutation.mutateAsync(
                            notification.id,
                          ));
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function NotificationsPage() {
  const { data: notifications, refetch } =
    api.userRouter.getAllNotifications.useQuery();

  const markAsReadMutation = api.userRouter.markNotificationsAsRead.useMutation(
    {
      onSuccess: async () => {
        toast.success("Notification marked as read");
        await refetch();
      },
    },
  );

  const markAllAsReadMutation =
    api.userRouter.markAllNotificationsAsRead.useMutation({
      onSuccess: async () => {
        toast.success("All notifications marked as read");
        await refetch();
      },
    });

  const deleteNotificationMutation =
    api.userRouter.deleteNotification.useMutation({
      onSuccess: async () => {
        toast.success("Notification deleted");
        await refetch();
      },
    });

  const unreadCount = notifications?.filter((n) => !n.read).length;

  return (
    <div className="relative flex h-screen w-full flex-col gap-3 overflow-x-hidden px-2 py-2">
      <Navbar />

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <h1 className="mb-2 text-2xl font-normal">Notifications</h1>
          {Number(unreadCount) > 0 && (
            <Badge variant="default" className="mb-2 h-6 py-3.5">
              {unreadCount}
            </Badge>
          )}
        </div>
        {Number(unreadCount) > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (notifications) {
                markAllAsReadMutation.mutate(notifications.map((n) => n.id));
              }
            }}
            className="text-xs"
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {notifications?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <BellMinus className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">No notifications</h3>
            <p className="text-muted-foreground">
              You have no notifications at the moment
            </p>
          </div>
        ) : (
          notifications?.map((notification) => (
            <div key={notification.id}>
              {notification.type === "friend_request" ? (
                <FriendRequestNotification
                  notification={notification}
                  // @ts-expect-error Fix later
                  markAsReadMutation={markAsReadMutation}
                  // @ts-expect-error Fix later
                  deleteNotificationMutation={deleteNotificationMutation}
                  // @ts-expect-error Fix later
                  refetchNotifications={refetch}
                />
              ) : (
                <RegularNotification
                  notification={notification}
                  // @ts-expect-error Fix later
                  markAsReadMutation={markAsReadMutation}
                  // @ts-expect-error Fix later
                  deleteNotificationMutation={deleteNotificationMutation}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

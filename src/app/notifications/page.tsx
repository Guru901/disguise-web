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
} from "lucide-react";
import { formatTimeAgo } from "@/lib/format-time-ago";
import Navbar from "@/components/navbar";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "comment":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "mention":
      return <AtSign className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
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

  const getCurrentNotifications = () => {
    return notifications;
  };

  return (
    <div className="relative flex h-screen w-full flex-col gap-3 overflow-x-hidden px-2 py-2">
      <Navbar />

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Notifications</h1>
          {Number(unreadCount) > 0 && (
            <Badge variant="default" className="h-6 px-2">
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

      {getCurrentNotifications()?.map((notification) => (
        <Card
          key={notification.id}
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
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              markAsReadMutation.mutate(notification.id)
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
                          onClick={() =>
                            deleteNotificationMutation.mutate(notification.id)
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
      ))}
    </div>
  );
}

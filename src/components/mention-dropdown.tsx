"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

type User = {
  id: string;
  username: string;
  avatar: string | null;
  posts: string[] | null;
  friends: string[] | null;
  createdAt: Date;
  lastOnline: Date | null;
};

interface MentionDropdownProps {
  users: User[];
  selectedIndex: number;
  onSelectUser: (user: User) => void;
  show: boolean;
}

export function MentionDropdown({
  users,
  selectedIndex,
  onSelectUser,
  show,
}: MentionDropdownProps) {
  if (!show || users.length === 0) return null;

  return (
    <Card className="absolute z-50 mb-1 max-h-60 overflow-y-auto border shadow-lg">
      <div className="p-1">
        {users.map((user, index) => (
          <div
            key={user.id}
            className={`flex cursor-pointer items-center gap-3 rounded-md p-3 transition-colors ${
              index === selectedIndex
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
            onMouseDown={() => onSelectUser(user)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.avatar ?? "/placeholder.svg"}
                alt={user.username}
              />
              <AvatarFallback>
                {user.username.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">@{user.username}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

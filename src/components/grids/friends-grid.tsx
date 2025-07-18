import { Loader2 } from "lucide-react";
import UserCard from "../user-card";

export default function FriendsGrid({
  friends,
  isLoading,
}: {
  friends:
    | {
        id: string;
        username: string;
        avatar: string | null;
      }[]
    | undefined;

  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {friends?.map((friend) => <UserCard user={friend} key={friend.id} />)}
    </div>
  );
}

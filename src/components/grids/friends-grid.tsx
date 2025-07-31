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

  return friends?.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-12">
      <h3 className="mb-2 text-lg font-medium">No friends 🤷‍♂️</h3>
      <p className="text-muted-foreground text-center">
        Maybe they're in your other tab... or imaginary. <br />
        Either way, it's pretty lonely here.
      </p>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      {friends?.map((friend) => <UserCard user={friend} key={friend.id} />)}
    </div>
  );
}

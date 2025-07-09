import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";

export default function UserCard({
  user,
}: {
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}) {
  return (
    <Link href={`/u/${user.id}`}>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar!} alt={user.username} />
              <AvatarFallback className="text-sm font-medium">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{user.username}</h3>
              <p className="text-muted-foreground text-sm">
                Click to view profile
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

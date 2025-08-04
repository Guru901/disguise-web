import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function TrendingCommunity({
  community,
  index,
  joinCommunityToggleMutation,
  joinedCommunities,
}: {
  community: {
    id: string;
    name: string;
    description: string;
    icon: string | null;
    banner: string | null;
    tags: string[] | null;
    memberCount: number;
    postsInLast7Days: number;
  };
  index: number;
  joinCommunityToggleMutation: {
    mutateAsync: (args: {
      communityId: string;
      isJoined: boolean;
    }) => Promise<unknown>;
    isPending?: boolean;
    variables?: {
      communityId: string;
      isJoined: boolean;
    };
  };
  joinedCommunities: Set<string>;
}) {
  return (
    <div
      className="group hover:bg-muted/50 transition-colors duration-200"
      key={community.id}
    >
      <div className="flex items-center p-6">
        <Link href={`/communities/${community.id}`} className="flex-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-8 text-sm font-medium">
                #{index + 1}
              </span>
              <Avatar className="ring-border group-hover:ring-primary/20 h-12 w-12 ring-2 transition-all duration-200">
                <AvatarImage src={community.icon ?? "/placeholder.svg"} />
                <AvatarFallback className="text-sm font-semibold">
                  {community.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="truncate text-lg font-semibold">
                  {community.name}
                </h3>
                {index < 3 && (
                  <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Hot
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                {community.description}
              </p>
              <div className="text-muted-foreground flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {community.memberCount} members
                </span>
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>0
                  online
                </span>
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full text-green-500"></div>
                  {community.postsInLast7Days} posts in the last 7 days
                </span>
              </div>
            </div>
          </div>
        </Link>
        <Button
          variant={joinedCommunities?.has(community.id) ? "outline" : "default"}
          size="sm"
          className="ml-4"
          onClick={async () => {
            if (joinedCommunities?.has(community.id)) {
              await joinCommunityToggleMutation.mutateAsync({
                communityId: community.id,
                isJoined: true,
              });
            } else {
              await joinCommunityToggleMutation.mutateAsync({
                communityId: community.id,
                isJoined: false,
              });
            }
          }}
          disabled={
            joinCommunityToggleMutation.isPending &&
            community.id === joinCommunityToggleMutation.variables?.communityId
          }
        >
          {joinCommunityToggleMutation.isPending &&
          community.id === joinCommunityToggleMutation.variables?.communityId
            ? "Please wait..."
            : joinedCommunities?.has(community.id)
              ? "Joined"
              : "Join"}
        </Button>
      </div>
    </div>
  );
}

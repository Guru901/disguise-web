import Masonry from "react-masonry-css";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { Loader2 } from "lucide-react";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { Badge } from "../ui/badge";

const breakpointColumnsObjComments = {
  default: 3,
  1100: 2,
  700: 1,
};

export default function CommentGrid({
  comments,
  isLoading,
}: {
  comments:
    | {
        id: string;
        content: string;
        post: string | null;
        image: string | null;
        isAReply: boolean;
        replyTo: string | null;
        replies: string[] | null;
        author: string | null;
        createdAt: Date;
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

  return comments?.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-12">
      <h3 className="mb-2 text-lg font-medium">No comments</h3>
      <p className="text-muted-foreground text-center">
        You don't have any comments yet.
      </p>
    </div>
  ) : (
    <Masonry
      breakpointCols={breakpointColumnsObjComments}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {comments?.reverse().map((comment) => (
        <div key={comment.id}>
          <Card className="overflow-hidden">
            <Link href={`/p?post=${comment.post}`} className="h-full">
              <CardContent className="flex h-full flex-col gap-2 p-3">
                <h1>{comment.content}</h1>
                <Badge
                  variant={"secondary"}
                  className="text-muted-foreground w-max text-xs"
                >
                  {formatTimeAgo(comment.createdAt)}
                </Badge>
              </CardContent>
            </Link>
          </Card>
        </div>
      ))}
    </Masonry>
  );
}

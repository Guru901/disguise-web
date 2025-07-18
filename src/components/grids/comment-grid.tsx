import Masonry from "react-masonry-css";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { Loader2 } from "lucide-react";

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

  return (
    <Masonry
      breakpointCols={breakpointColumnsObjComments}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {comments?.reverse().map((comment) => (
        <div key={comment.id}>
          <Card className="overflow-hidden">
            <Link href={`/p/${comment.post}`} className="h-full">
              <CardContent className="h-full p-3">
                <h1>{comment.content}</h1>
              </CardContent>
            </Link>
          </Card>
        </div>
      ))}
    </Masonry>
  );
}

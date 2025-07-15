import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { api } from "@/trpc/react";
import MediaPlayer from "@/components/media-player";

const PostCard = React.forwardRef<
  HTMLDivElement,
  {
    avatar: string;
    username: string;
    title: string;
    image: string | null;
    createdAt: Date;
    content: string | null;
    id: string;
    likes: string[];
    disLikes: string[];
    userId: string;
  }
>(
  (
    {
      avatar,
      username,
      title,
      image,
      createdAt,
      content,
      id,
      likes,
      disLikes,
      userId,
    },
    ref,
  ) => {
    const [optimisticLikes, setOptimisticLikes] = useState(likes.length);
    const [optimisticDislikes, setOptimisticDislikes] = useState(
      disLikes.length,
    );

    const [hasLiked, setHasLiked] = useState(() => likes.includes(userId));
    const [hasDisliked, setHasDisliked] = useState(() =>
      disLikes.includes(userId),
    );

    const likePostMutation = api.postRouter.likePost.useMutation();
    const unlikePostMutation = api.postRouter.unlikePost.useMutation();
    const likeAndUndislikePostMutation =
      api.postRouter.likeAndUndislikePost.useMutation();

    const dislikePostMutation = api.postRouter.dislikePost.useMutation();
    const undislikePostMutation = api.postRouter.undislikePost.useMutation();
    const dislikeAndUnlikePostMutation =
      api.postRouter.dislikeAndUnlikePost.useMutation();

    async function copyUrlToClipboard() {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast("Copied to clipboard");
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    }

    async function likePost() {
      if (hasLiked) {
        // We are unliking the post
        setOptimisticLikes((prev) => prev - 1);
        setHasLiked(false);
        try {
          await unlikePostMutation.mutateAsync({ post: id });
        } catch (error) {
          console.error(error);
          setOptimisticLikes((prev) => prev + 1);
          setHasLiked(true);
        }
      } else {
        // We are liking the post
        const wasDisliked = hasDisliked;
        setOptimisticLikes((prev) => prev + 1);
        setHasLiked(true);
        if (wasDisliked) {
          setOptimisticDislikes((prev) => prev - 1);
          setHasDisliked(false);
        }

        try {
          if (wasDisliked) {
            await likeAndUndislikePostMutation.mutateAsync({ post: id });
          } else {
            await likePostMutation.mutateAsync({ post: id });
          }
        } catch (error) {
          console.error(error);
          setOptimisticLikes((prev) => prev - 1);
          setHasLiked(false);
          if (wasDisliked) {
            setOptimisticDislikes((prev) => prev + 1);
            setHasDisliked(true);
          }
        }
      }
    }

    async function dislikePost() {
      if (hasDisliked) {
        // We are undisliking the post
        setOptimisticDislikes((prev) => prev - 1);
        setHasDisliked(false);
        try {
          await undislikePostMutation.mutateAsync({ post: id });
        } catch (error) {
          console.error(error);
          setOptimisticDislikes((prev) => prev + 1);
          setHasDisliked(true);
        }
      } else {
        // We are disliking the post
        const wasLiked = hasLiked;
        setOptimisticDislikes((prev) => prev + 1);
        setHasDisliked(true);
        if (wasLiked) {
          setOptimisticLikes((prev) => prev - 1);
          setHasLiked(false);
        }

        try {
          if (wasLiked) {
            await dislikeAndUnlikePostMutation.mutateAsync({ post: id });
          } else {
            await dislikePostMutation.mutateAsync({ post: id });
          }
        } catch (error) {
          console.error(error);
          setOptimisticDislikes((prev) => prev - 1);
          setHasDisliked(false);
          if (wasLiked) {
            setOptimisticLikes((prev) => prev + 1);
            setHasLiked(true);
          }
        }
      }
    }

    return (
      <Card className="h-max overflow-hidden py-6" ref={ref}>
        <CardHeader className="flex items-center gap-4 px-4 py-3">
          <Avatar className="h-14 w-14">
            <AvatarImage
              src={avatar}
              alt="@shadcn"
              className="w-24 object-cover"
            />
            <AvatarFallback>{username.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="font-medium">{username}</div>
            <div className="text-muted-foreground text-sm">
              {formatTimeAgo(createdAt)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-0">
          <div className="space-y-3">
            <p>{title}</p>
            {image && (
              <MediaPlayer
                url={image}
                imageProps={{
                  alt: title,
                  width: 600,
                  height: 200,
                  className: "h-52 w-full rounded-md object-cover",
                }}
                videoProps={{
                  className: "h-52 w-full rounded-md bg-black object-cover",
                }}
              />
            )}
            {content && <p className="truncate overflow-hidden">{content}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between px-4 py-3">
          <div className="text-muted-foreground flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                className="flex gap-1"
                variant={"ghost"}
                size={"icon"}
                onClick={likePost}
              >
                {hasLiked ? <HeartIconFilled /> : <HeartIcon />}
                <span>{optimisticLikes}</span>
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                className="flex gap-1"
                variant={"ghost"}
                size={"icon"}
                onClick={dislikePost}
              >
                {hasDisliked ? <ThumbsDownIconFilled /> : <ThumbsDownIcon />}
                <span>{optimisticDislikes}</span>
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                className="flex gap-1"
                variant={"ghost"}
                size={"icon"}
                onClick={copyUrlToClipboard}
              >
                <Share2 />
              </Button>
            </div>
          </div>
          <Link href={`/p/${id}?image=${image!.length > 0}`} className="w-min">
            <Button>See More</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  },
);
PostCard.displayName = "PostCard";

export { PostCard };

function HeartIcon() {
  return (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function HeartIconFilled() {
  return (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="red"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function ThumbsDownIcon() {
  return (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

function ThumbsDownIconFilled() {
  return (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

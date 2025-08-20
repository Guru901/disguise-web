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
import { Bookmark, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { api } from "@/trpc/react";
import MediaPlayer from "@/components/media-player";
import useGetUser from "@/lib/use-get-user";
import {
  Carousel,
  CarouselPrevious,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "./ui/carousel";

const PostCard = React.forwardRef<
  HTMLDivElement,
  {
    avatar: string;
    username: string;
    authorId: string;
    title: string;
    image: string[] | null;
    createdAt: Date;
    content: string | null;
    id: string;
    likes: string[];
    disLikes: string[];
    savedCount: number;
    loggedInUserId: string;
    loggedInUserUsername: string;
  }
>(
  (
    {
      avatar,
      username,
      authorId,
      title,
      image,
      createdAt,
      content,
      id,
      likes,
      disLikes,
      savedCount,
      loggedInUserId,
      loggedInUserUsername,
    },
    ref,
  ) => {
    const [optimisticLikes, setOptimisticLikes] = useState(likes.length);
    const [optimisticDislikes, setOptimisticDislikes] = useState(
      disLikes.length,
    );
    const [optimisticSavedCount, setOptimisticSavedCount] =
      useState(savedCount);

    const { user } = useGetUser();

    const [hasLiked, setHasLiked] = useState(() =>
      likes.includes(loggedInUserId),
    );
    const [hasDisliked, setHasDisliked] = useState(() =>
      disLikes.includes(loggedInUserId),
    );
    const [hasSaved, setHasSaved] = useState(() =>
      user?.savedPosts?.includes(id),
    );

    const likePostMutation = api.postRouter.likePost.useMutation();

    const unlikePostMutation = api.postRouter.unlikePost.useMutation();

    const likeAndUndislikePostMutation =
      api.postRouter.likeAndUndislikePost.useMutation();

    const dislikePostMutation = api.postRouter.dislikePost.useMutation();
    const savePostMutation = api.postRouter.savePostById.useMutation();
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

    async function savePost() {
      const previousSaveState = hasSaved;
      // Optimistically update the save state and count
      setHasSaved(!hasSaved);
      if (hasSaved) {
        // If we're unsaving, decrease the count
        setOptimisticSavedCount((prev) => prev - 1);
      } else {
        // If we're saving, increase the count
        setOptimisticSavedCount((prev) => prev + 1);
      }

      try {
        await savePostMutation.mutateAsync({
          postId: id,
          saved: previousSaveState,
        });
      } catch (error) {
        console.error("Failed to save/unsave post:", error);
        // Revert the optimistic updates on error
        setHasSaved(previousSaveState);
        if (previousSaveState) {
          // If we were trying to unsave, revert the count increase
          setOptimisticSavedCount((prev) => prev + 1);
        } else {
          // If we were trying to save, revert the count decrease
          setOptimisticSavedCount((prev) => prev - 1);
        }
        toast.error("Failed to save post. Please try again.");
      }
    }

    return (
      <Card className="h-max overflow-hidden py-3" ref={ref}>
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
            <Link href={`/u/${authorId}`} className="font-medium underline">
              {username}
            </Link>
            <div className="text-muted-foreground text-sm">
              {formatTimeAgo(createdAt)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-0">
          <div className="space-y-3">
            <p>{title}</p>
            {image && image.length > 1 && image[0] !== "" ? (
              <div className="mt-2">
                <Carousel>
                  <CarouselContent>
                    {image.map((img, idx) => (
                      <CarouselItem key={img + idx} className="relative">
                        <MediaPlayer
                          url={img}
                          imageProps={{
                            alt: title,
                            width: 600,
                            height: 200,
                            className: "h-52 w-full rounded-md object-cover",
                          }}
                          videoProps={{
                            className:
                              "h-52 w-full rounded-md bg-black object-cover",
                          }}
                        />
                        <div className="absolute top-2 left-6 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                          {idx + 1} of {image?.length ?? 0}
                          {img.endsWith(".mp4") ||
                          img.endsWith(".mkv") ||
                          img.endsWith(".mov")
                            ? " (video)"
                            : " (image)"}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute left-[8px] z-50" />
                  <CarouselNext className="absolute right-[8px] z-50" />
                </Carousel>
              </div>
            ) : (
              image &&
              image.length !== 0 &&
              image[0] !== "" && (
                <div className="mt-2">
                  <MediaPlayer
                    url={String(image[0])}
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
                </div>
              )
            )}
            {content && <p className="truncate overflow-hidden">{content}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between px-4 py-3">
          <div className="text-muted-foreground flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                className="group relative flex gap-1"
                variant={"ghost"}
                size={"icon"}
                onClick={likePost}
              >
                {hasLiked ? <HeartIconFilled /> : <HeartIcon />}
                <span>{optimisticLikes}</span>
                <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {hasLiked ? "Unlike" : "Like"}
                </span>
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                className="group relative flex gap-1"
                variant={"ghost"}
                size={"icon"}
                onClick={dislikePost}
              >
                {hasDisliked ? <ThumbsDownIconFilled /> : <ThumbsDownIcon />}
                <span>{optimisticDislikes}</span>
                <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {hasDisliked ? "Undislike" : "Dislike"}
                </span>
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                className="group relative flex gap-1"
                variant={"ghost"}
                size={"icon"}
                onClick={copyUrlToClipboard}
              >
                <Share2 />
                <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Share
                </span>
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                className="group relative flex gap-1"
                variant={"ghost"}
                size={"icon"}
                onClick={savePost}
              >
                <Bookmark fill={hasSaved ? "currentColor" : "transparent"} />
                <span>{optimisticSavedCount}</span>
                <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {hasSaved ? "Unsave" : "Save"}
                </span>
              </Button>
            </div>
          </div>
          <Link
            href={`/p?post=${id}&image=${image!.length > 0}&author=${username === loggedInUserUsername}`}
            className="w-min"
          >
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

import { Card } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { Loader2, Share2 } from "lucide-react";
import { useState } from "react";
import useGetUser from "@/lib/use-get-user";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import Link from "next/link";

export function PostDetails({
  author,
  title,
  content,
  image,
  createdAt,
  likes = [],
  disLikes = [],
  topic = "General",
  postID,
}: {
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  title: string;
  content: string;
  image: string;
  createdAt: Date;
  likes: string[];
  disLikes: string[];
  topic: string;
  postID: string;
}) {
  const { user } = useGetUser();

  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [hasLiked, setHasLiked] = useState(() => likes.includes(user.id));
  const [hasDisliked, setHasDisliked] = useState(() =>
    disLikes.includes(user.id),
  );

  const [optimisticLikes, setOptimisticLikes] = useState(likes.length);
  const [optimisticDislikes, setOptimisticDislikes] = useState(disLikes.length);

  const likePostMutation = api.postRouter.likePost.useMutation();
  const unlikePostMutation = api.postRouter.unlikePost.useMutation();
  const likeAndUndislikePostMutation =
    api.postRouter.likeAndUndislikePost.useMutation();

  const dislikePostMutation = api.postRouter.dislikePost.useMutation();
  const undislikePostMutation = api.postRouter.undislikePost.useMutation();
  const dislikeAndUnlikePostMutation =
    api.postRouter.dislikeAndUnlikePost.useMutation();

  const commentAddMutation = api.postRouter.addComments.useMutation();

  const {
    data: comments,
    isLoading: isCommentsLoading,
    isPending: isCommentsPending,
    refetch: refetchComments,
  } = api.postRouter.getCommentsByPostId.useQuery(
    {
      postId: postID,
    },
    {
      refetchInterval: 1000,
    },
  );

  async function addComment() {
    try {
      setCommentLoading(true);
      const data = await commentAddMutation.mutateAsync({
        content: newComment,
        postId: postID,
      });

      if (data.success) {
        setNewComment("");
        toast("Comment added");
        void (await refetchComments());

        setCommentLoading(false);
      }
    } catch (error) {
      console.log(error);

      setCommentLoading(false);
    }
  }

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
      setOptimisticLikes((prev) => prev - 1);
      setHasLiked(false);
      try {
        await unlikePostMutation.mutateAsync({ post: postID });
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
          await likeAndUndislikePostMutation.mutateAsync({ post: postID });
        } else {
          await likePostMutation.mutateAsync({ post: postID });
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
        await undislikePostMutation.mutateAsync({ post: postID });
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
          await dislikeAndUnlikePostMutation.mutateAsync({ post: postID });
        } else {
          await dislikePostMutation.mutateAsync({ post: postID });
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
    <Card className="flex h-[calc(100vh+15rem)] w-full items-start py-0 pb-12">
      <div className="text-foreground flex w-full items-center justify-center">
        <div className="h-screen w-screen max-w-7xl px-2 py-3 sm:px-6 lg:px-8">
          <div className="bg-card overflow-hidden rounded-lg">
            <div className="flex flex-col px-[6px] pb-[6px] sm:flex-row md:py-[6px]">
              <div className="py-6 sm:w-1/2 sm:p-6">
                <div className="flex items-start">
                  <div className="mr-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={author?.avatar} alt="@user" />
                      <AvatarFallback>
                        {author.username.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      <Link href={`/u/${author.id}`} className="underline">
                        {author.username}
                      </Link>
                    </div>
                    <div className="text-muted-foreground text-xs font-semibold">
                      {formatTimeAgo(createdAt)}
                    </div>
                    <div className="text-muted-foreground text-xs font-semibold">
                      {topic.charAt(0).toUpperCase() + topic.slice(1)}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xl font-semibold">{title}</p>
                </div>
                {image && (
                  <div className="mt-4">
                    <Image
                      src={image}
                      alt="Post Image"
                      width={500}
                      height={500}
                      className="w-full rounded-md object-cover"
                    />
                  </div>
                )}
                <div className="mt-3 break-words">
                  {content?.includes("\n") ? (
                    content
                      .split("\n")
                      .filter((x) => x !== "")
                      .map((y) => (
                        <p className="text-lg" key={y}>
                          {y}
                        </p>
                      ))
                  ) : (
                    <p className="text-md">{content}</p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={likePost}>
                      {hasLiked ? <HeartIconFilled /> : <HeartIcon />}
                      <span className="sr-only">Like</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={dislikePost}>
                      {hasDisliked ? (
                        <ThumbsDownIconFilled />
                      ) : (
                        <ThumbsDownIcon />
                      )}
                      <span className="sr-only">Dislike</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyUrlToClipboard}
                    >
                      <Share2 />
                      <span className="sr-only">Share</span>
                    </Button>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {optimisticLikes} Likes • {optimisticDislikes} Dislikes •{" "}
                    {comments?.length ?? 0} Comments
                  </div>
                </div>
              </div>
              <div className={`bg-muted w-full rounded-lg px-4 py-6`}>
                <h2 className="text-secondary-foreground mb-4 text-lg font-semibold">
                  Comments
                </h2>
                <div className="space-y-4">
                  <div className="flex w-full items-center gap-1">
                    <Input
                      type="text"
                      className="w-full rounded-md py-5"
                      placeholder="Add a comment..."
                      onChange={(e) => setNewComment(e.target.value)}
                      value={newComment}
                    />
                    <Button
                      className="w-[30%] py-5"
                      onClick={addComment}
                      disabled={commentLoading}
                    >
                      {commentLoading ? "Please Wait" : "Submit"}
                    </Button>
                  </div>
                  {isCommentsLoading || isCommentsPending ? (
                    <div className="flex min-h-[300px] w-full items-center justify-center">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : (
                    comments?.reverse().map((comment) => (
                      <div
                        className="flex items-center"
                        key={comment.comments.id}
                      >
                        <div className="mr-4">
                          <Avatar className="h-14 w-14">
                            <AvatarImage
                              src={comment.users?.avatar ?? ""}
                              alt="Avatar"
                              width={56}
                              height={56}
                              className="rounded-full"
                            />
                            <AvatarFallback>
                              <div className="bg-background border-primary flex h-full w-full items-center justify-center rounded-full border-1">
                                <span className="text-foreground">
                                  {comment.users?.username.slice(0, 1)}
                                </span>
                              </div>
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <div className="text-md font-semibold text-[#949BA8]">
                            <Link
                              href={`/u/${comment.users?.id}`}
                              className="underline"
                            >
                              {comment.users?.username ?? "User"} •
                              <span
                                className="text-xs font-light"
                                style={{ textDecoration: "none !important" }}
                              >
                                {" "}
                                {formatTimeAgo(comment.comments.createdAt)}
                              </span>
                            </Link>
                          </div>
                          <div className="text-accent-foreground font-medium">
                            {comment.comments.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

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
      fill="red" // Use currentColor for filled style
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

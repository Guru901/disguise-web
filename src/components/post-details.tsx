import { Card } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { formatTimeAgo } from "@/lib/format-time-ago";
import {
  EllipsisVerticalIcon,
  ImageIcon,
  Loader2,
  Share2,
  X,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import useGetUser from "@/lib/use-get-user";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import MediaPlayer from "./media-player";
import { CldUploadButton } from "next-cloudinary";

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
  commentsCount,
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
  commentsCount: number;
}) {
  const { user } = useGetUser();

  const [newComment, setNewComment] = useState({
    image: "",
    content: "",
  });
  const [commentLoading, setCommentLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasLiked, setHasLiked] = useState(() => likes.includes(user.id));
  const [replyTo, setReplyTo] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasDisliked, setHasDisliked] = useState(() =>
    disLikes.includes(user.id),
  );

  const [optimisticLikes, setOptimisticLikes] = useState(likes.length);
  const [optimisticDislikes, setOptimisticDislikes] = useState(disLikes.length);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set(),
  );

  const likePostMutation = api.postRouter.likePost.useMutation();
  const unlikePostMutation = api.postRouter.unlikePost.useMutation();
  const likeAndUndislikePostMutation =
    api.postRouter.likeAndUndislikePost.useMutation();

  const deleteCommentMutation = api.postRouter.deleteComment.useMutation();

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

  useEffect(() => {
    if (replyTo && inputRef.current) {
      // Use setTimeout to ensure DOM is updated before focusing
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Optional: scroll input into view
          inputRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  }, [replyTo]);

  // Function to handle reply button click
  const handleReply = (commentId: string, username: string) => {
    setReplyTo(commentId);
    setNewComment({ content: `@${username} `, image: "" });

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(
          inputRef.current.value.length,
          inputRef.current.value.length,
        );
      }
    }, 200);
  };

  // Function to toggle reply visibility
  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const removeUploadedImage = () => {
    setNewComment({ ...newComment, image: "" });
  };

  async function addComment() {
    if (newComment.content.trim() === "") return;
    try {
      setCommentLoading(true);
      let data;
      if (replyTo) {
        data = await commentAddMutation.mutateAsync({
          content: newComment.content,
          image: newComment.image,
          postId: postID,
          isAReply: true,
          replyTo: replyTo,
        });
      } else {
        data = await commentAddMutation.mutateAsync({
          content: newComment.content,
          image: newComment.image,
          postId: postID,
          isAReply: false,
          replyTo: replyTo,
        });
      }

      if (data.success) {
        setNewComment({ content: "", image: "" });
        setReplyTo(""); // Clear the reply state
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
    <Card className="flex h-[calc(100vh+15rem)] w-full items-start py-0 pb-12 md:h-fit md:w-fit md:pb-0">
      <div className="text-foreground flex w-full items-center justify-center">
        <div className="h-auto w-full px-2 py-3 sm:px-6 md:w-auto lg:p-2">
          <div className="bg-card overflow-hidden rounded-lg">
            <div className="flex flex-col px-[6px] pb-[6px] md:min-w-[60vw] md:flex-row md:py-[6px]">
              <div className="py-6 sm:w-3/4 sm:p-6">
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
                    <MediaPlayer
                      url={image}
                      imageProps={{
                        alt: "Post Image",
                        width: 500,
                        height: 500,
                        className: "h-full w-full rounded-md object-cover",
                      }}
                      videoProps={{
                        className: "h-52 w-full rounded-md object-cover",
                      }}
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
                <div className="mt-4 flex items-center gap-12 sm:justify-between sm:gap-0">
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
                    {commentsCount} Comments
                  </div>
                </div>
              </div>
              <div className={`bg-muted rounded-lg px-4 py-6 md:w-[50vw]`}>
                <h2 className="text-secondary-foreground mb-4 text-lg font-semibold">
                  Comments
                </h2>
                <div className="space-y-4">
                  {/* Comment input with upload functionality */}
                  <div className="space-y-3">
                    <div className="flex w-full items-end gap-2">
                      <div className="flex-1">
                        <Input
                          type="text"
                          className="w-full rounded-md py-5"
                          placeholder={
                            replyTo ? "Write your reply..." : "Add a comment..."
                          }
                          onChange={(e) =>
                            setNewComment({
                              ...newComment,
                              content: e.target.value,
                            })
                          }
                          value={newComment.content}
                          ref={inputRef}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              void (async () => {
                                await addComment();
                              })();
                            }
                            if (e.key === "Escape") {
                              setReplyTo("");
                              setNewComment({
                                content: "",
                                image: "",
                              });
                            }
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <CldUploadButton
                          className="w-full"
                          uploadPreset="social-media-again"
                          onSuccess={(results) => {
                            // @ts-expect-error - results.info is not typed
                            const uploadedImageUrl = String(results.info.secure_url);

                            setNewComment((prev) => ({
                              ...prev,
                              image: String(uploadedImageUrl),
                            }));
                            toast("Image uploaded successfully!");
                            setUploadingImage(false);
                          }}
                        >
                          <Button variant="outline" size="icon"><ImageIcon className="h-4 w-4" /></Button>
                        </CldUploadButton>
                        <Button
                          className="py-5"
                          onClick={addComment}
                          disabled={
                            commentLoading ||
                            (!newComment.content.trim() && !newComment.image)
                          }
                        >
                          {commentLoading
                            ? "Please Wait"
                            : replyTo
                              ? "Reply"
                              : "Submit"}
                        </Button>
                      </div>
                    </div>

                    {/* Image preview */}
                    {newComment.image && (
                      <div className="relative inline-block">
                        <div className="relative">
                          <MediaPlayer
                            url={newComment.image}
                            imageProps={{
                              alt: "Comment attachment",
                              width: 200,
                              height: 200,
                            }}
                            videoProps={{
                              className: "max-h-32 max-w-48 rounded-md object-cover",
                            }}
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={removeUploadedImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Show reply indicator */}
                    {replyTo && (
                      <div className="flex items-center justify-between rounded-md bg-blue-50 p-2 dark:bg-blue-900/20">
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          Replying to comment
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReplyTo("");
                            setNewComment({
                              content: "",
                              image: "",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {isCommentsLoading || isCommentsPending ? (
                    <div className="flex min-h-[300px] w-full items-center justify-center">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : (
                    comments
                      ?.filter((comment) => !comment.comments.isAReply)
                      .map((comment) => {
                        // Get replies for this comment
                        const replies =
                          comments?.filter(
                            (reply) =>
                              reply.comments.isAReply &&
                              reply.comments.replyTo === comment.comments.id,
                          ) ?? [];

                        return (
                          <div key={comment.comments.id}>
                            {/* Main comment */}
                            <div className="flex items-start">
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
                              <div className="flex w-full justify-between">
                                <div className="flex-1">
                                  <div className="text-md font-semibold text-[#949BA8]">
                                    <Link href={`/u/${comment.users?.id}`}>
                                      <span className="underline">
                                        {comment.users?.username ?? "User"}
                                      </span>
                                      {" • "}
                                      <span className="text-xs font-light">
                                        {formatTimeAgo(
                                          comment.comments.createdAt,
                                        )}
                                      </span>
                                    </Link>
                                  </div>
                                  <div className="text-accent-foreground">
                                    {!comment.comments.content.includes("@") ? (
                                      <p>{comment.comments.content}</p>
                                    ) : (
                                      <p>
                                        {comment.comments.content
                                          .split(" ")
                                          .map((x: string, index: number) =>
                                            x.startsWith("@") ? (
                                              <Link
                                                key={index}
                                                className="text-primary underline"
                                                href={`/u/${x.slice(1)}`}
                                              >
                                                {x + " "}
                                              </Link>
                                            ) : (
                                              <span key={index}>{x + " "}</span>
                                            ),
                                          )}
                                      </p>
                                    )}
                                  </div>
                                  {comment.comments.image && (
                                    <div className="mt-2">
                                      <MediaPlayer
                                        imageProps={{
                                          alt: "Comment attachment",
                                          width: 250,
                                          height: 150,
                                          className:
                                            "w-full rounded-md object-cover",
                                        }}
                                        videoProps={{
                                          className: "md:max-w-[28rem] w-full",
                                        }}
                                        url={comment.comments.image}
                                      />
                                    </div>
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <EllipsisVerticalIcon />
                                    </Button>
                                  </DropdownMenuTrigger>

                                  <DropdownMenuContent align="start">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        handleReply(
                                          comment.comments.id,
                                          comment.users?.username ?? "User",
                                        );
                                      }}
                                    >
                                      Reply
                                    </DropdownMenuItem>
                                    {user.id === comment.users?.id && (
                                      <DropdownMenuItem
                                        onClick={async () => {
                                          void (await deleteCommentMutation.mutateAsync(
                                            {
                                              commentId: comment.comments.id,
                                            },
                                          ));
                                        }}
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* Replies section */}
                            {replies.length > 0 && (
                              <div className="border-muted mt-1 ml-18 space-y-3 border-l-2 pl-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toggleReplies(comment.comments.id)
                                  }
                                  className="text-muted-foreground hover:text-foreground text-xs"
                                >
                                  {expandedReplies.has(comment.comments.id)
                                    ? `Hide ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`
                                    : `Show ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`}
                                </Button>

                                {expandedReplies.has(comment.comments.id) && (
                                  <div className="flex flex-col gap-4">
                                    {replies.reverse().map((reply) => (
                                      <div
                                        key={reply.comments.id}
                                        className="flex items-start"
                                      >
                                        <div className="mr-3">
                                          <Avatar className="h-10 w-10">
                                            <AvatarImage
                                              src={reply.users?.avatar ?? ""}
                                              alt="Avatar"
                                              width={40}
                                              height={40}
                                              className="rounded-full"
                                            />
                                            <AvatarFallback>
                                              <div className="bg-background border-primary flex h-full w-full items-center justify-center rounded-full border-1">
                                                <span className="text-foreground text-sm">
                                                  {reply.users?.username.slice(
                                                    0,
                                                    1,
                                                  )}
                                                </span>
                                              </div>
                                            </AvatarFallback>
                                          </Avatar>
                                        </div>
                                        <div className="flex w-full justify-between">
                                          <div className="flex-1">
                                            <div className="text-sm font-semibold text-[#949BA8]">
                                              <Link
                                                href={`/u/${reply.users?.id}`}
                                              >
                                                <span className="underline">
                                                  {reply.users?.username ??
                                                    "User"}
                                                </span>
                                                {" • "}
                                                <span className="text-xs font-light">
                                                  {formatTimeAgo(
                                                    reply.comments.createdAt,
                                                  )}
                                                </span>
                                              </Link>
                                            </div>
                                            <div className="text-accent-foreground text-sm font-medium">
                                              {!reply.comments.content.includes(
                                                "@",
                                              ) ? (
                                                <p>{reply.comments.content}</p>
                                              ) : (
                                                <p>
                                                  {reply.comments.content
                                                    .split(" ")
                                                    .map(
                                                      (
                                                        x: string,
                                                        index: number,
                                                      ) =>
                                                        x.startsWith("@") ? (
                                                          <Link
                                                            key={index}
                                                            className="text-primary underline"
                                                            href={`/u/${x.slice(1)}`}
                                                          >
                                                            {x + " "}
                                                          </Link>
                                                        ) : (
                                                          <span key={index}>
                                                            {x + " "}
                                                          </span>
                                                        ),
                                                    )}
                                                </p>
                                              )}
                                            </div>
                                            {/* Display reply image if it exists */}
                                            {reply.comments.image && (
                                              <div className="mt-2">
                                                <MediaPlayer
                                                  url={reply.comments.image}
                                                  imageProps={{
                                                    alt: "Reply attachment",
                                                    width: 250,
                                                    height: 150,
                                                  }}
                                                  videoProps={{
                                                    className: "md:max-w-[28rem] w-full",
                                                  }}
                                                />
                                              </div>
                                            )}
                                          </div>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                              >
                                                <EllipsisVerticalIcon className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="start">
                                              <DropdownMenuItem
                                                onSelect={(event) => {
                                                  event.preventDefault();
                                                  handleReply(
                                                    comment.comments.id,
                                                    reply.users?.username ??
                                                      "User",
                                                  );
                                                }}
                                              >
                                                Reply
                                              </DropdownMenuItem>
                                              {user.id === reply.users?.id && (
                                                <DropdownMenuItem
                                                  onClick={async () => {
                                                    void (await deleteCommentMutation.mutateAsync(
                                                      {
                                                        commentId:
                                                          reply.comments.id,
                                                      },
                                                    ));
                                                  }}
                                                >
                                                  Delete
                                                </DropdownMenuItem>
                                              )}
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
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

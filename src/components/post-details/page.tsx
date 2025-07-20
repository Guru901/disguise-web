"use client";

import { Card } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { ImageIcon, Loader2, Share2, Trash, X } from "lucide-react";
import * as icons from "./icons";
import { useState, useEffect } from "react";
import useGetUser from "@/lib/use-get-user";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import Link from "next/link";
import MediaPlayer from "../media-player";
import { CldUploadButton } from "next-cloudinary";
import { useMentionInput } from "@/lib/use-mention-input";
import { MentionDropdown } from "@/components/mention-dropdown";
import Comment from "./comment";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { PostCommentsLoading } from "../loaders/post-loading";
import { Skeleton } from "../ui/skeleton";

export function PostDetails({ postId }: { postId: string }) {
  const { user } = useGetUser();
  const router = useRouter();

  // Fetch the post data here
  const { data: post, isLoading: isPostLoading } =
    api.postRouter.getPostById.useQuery({ postId });

  const searchParams = useSearchParams();

  const [isAuthor, setIsAuthor] = useState(false);
  const [isImage, setIsImage] = useState(false);

  const isImageParam = searchParams.get("image");
  const isAuthorParam = searchParams.get("author");

  // Use post fields for all logic below
  const [newComment, setNewComment] = useState({
    image: "",
    content: "",
  });
  const [commentLoading, setCommentLoading] = useState(false);
  const [hasLiked, setHasLiked] = useState(() =>
    post?.likes?.includes(user.id),
  );
  const [replyTo, setReplyTo] = useState("");
  const [optimisticCommentsCount, setOptimisticCommentsCount] = useState(
    post?.commentsCount ?? 0,
  );
  const [hasDisliked, setHasDisliked] = useState(() =>
    post?.disLikes?.includes(user.id),
  );
  const [mentionUsers, setMentionUsers] = useState<
    { id: string; username: string; avatar: string }[]
  >([]);
  const [optimisticLikes, setOptimisticLikes] = useState(
    post?.likes?.length ?? 0,
  );
  const [optimisticDislikes, setOptimisticDislikes] = useState(
    post?.disLikes?.length ?? 0,
  );
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allUsers } = api.userRouter.getAllUsers.useQuery({
    searchTerm: searchTerm,
  });

  const {
    inputValue,
    setInputValue,
    showDropdown,
    setShowDropdown,
    filteredUsers,
    selectedIndex,
    inputRef,
    handleInputChange,
    selectUser,
    handleKeyDown,
  } = useMentionInput(mentionUsers);

  useEffect(() => {
    setNewComment((prev) => ({ ...prev, content: inputValue }));
  }, [inputValue]);

  const likePostMutation = api.postRouter.likePost.useMutation();
  const unlikePostMutation = api.postRouter.unlikePost.useMutation();
  const likeAndUndislikePostMutation =
    api.postRouter.likeAndUndislikePost.useMutation();
  const deleteCommentMutation = api.postRouter.deleteComment.useMutation({
    onMutate: () => {
      toast("Comment Deleted");
    },
  });
  const dislikePostMutation = api.postRouter.dislikePost.useMutation();
  const undislikePostMutation = api.postRouter.undislikePost.useMutation();
  const dislikeAndUnlikePostMutation =
    api.postRouter.dislikeAndUnlikePost.useMutation();
  const commentAddMutation = api.postRouter.addComments.useMutation({
    onMutate: (data) => {
      toast("Comment Added");
      comments?.unshift({
        authorAvatar: user.avatar ?? null,
        authorId: user.id,
        authorUsername: user.username,
        content: data.content,
        createdAt: new Date(),
        id: String(Math.random() * 190),
        image: data.image ?? null,
        isAReply: data.isAReply,
        isDeleted: false,
        post: postId,
        replies: [],
        replyTo: null,
      });
      setOptimisticCommentsCount((prev) => prev + 1);
      setCommentLoading(false);
      setNewComment({ content: "", image: "" });
      setInputValue("");
      setReplyTo("");
    },
  });

  const deletePostByIdMutation = api.postRouter.deletePostById.useMutation({
    onSuccess: async () => {
      toast("Post deleted");
      router.back();
    },
  });

  const {
    data: comments,
    isLoading: isCommentsLoading,
    isPending: isCommentsPending,
  } = api.postRouter.getCommentsByPostId.useQuery(
    {
      postId: postId,
    },
    {
      refetchInterval: 1000,
    },
  );

  useEffect(() => {
    if (replyTo && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  }, [replyTo, inputRef]);

  useEffect(() => {
    if (isAuthorParam === "true") {
      setIsAuthor(true);
    } else if (post?.createdBy?.id === user.id) {
      setIsAuthor(true);
    } else {
      setIsAuthor(false);
    }

    if (isImageParam === "true") {
      setIsImage(true);
    } else if (post?.image) {
      setIsImage(true);
    } else {
      setIsImage(false);
    }
  }, [isAuthorParam, post, isImageParam, user.id]);

  useEffect(() => {
    setOptimisticCommentsCount(post?.commentsCount ?? 0);
    setOptimisticLikes(post?.likes?.length ?? 0);
    setOptimisticDislikes(post?.disLikes?.length ?? 0);

    setHasDisliked(post?.disLikes?.includes(user.id));
    setHasLiked(post?.likes?.includes(user.id));
  }, [post, user.id]);

  useEffect(() => {
    setMentionUsers(
      (allUsers ?? []).map((user) => ({
        id: user.id,
        username: user.username,
        avatar: user.avatar ?? "/placeholder.svg",
      })),
    );
  }, [allUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowDropdown, inputRef]);

  function handleReply(commentId: string, username: string) {
    setReplyTo(commentId);
    username = username.replace(" ", "_");
    const replyText = `@${username} `;
    setInputValue(replyText);
    setNewComment({ content: replyText, image: "" });
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(
          inputRef.current.value.length,
          inputRef.current.value.length,
        );
      }
    }, 200);
  }

  function toggleReplies(commentId: string) {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }

  function removeUploadedImage() {
    setNewComment({ ...newComment, image: "" });
  }

  async function addComment() {
    if (newComment.content.trim() === "") return;
    try {
      setCommentLoading(true);
      if (replyTo) {
        await commentAddMutation.mutateAsync({
          content: newComment.content,
          image: newComment.image,
          postId: postId,
          isAReply: true,
          replyTo: replyTo,
        });
      } else {
        await commentAddMutation.mutateAsync({
          content: newComment.content,
          image: newComment.image,
          postId: postId,
          isAReply: false,
          replyTo: replyTo,
        });
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
        await unlikePostMutation.mutateAsync({ post: postId });
      } catch (error) {
        console.error(error);
        setOptimisticLikes((prev) => prev + 1);
        setHasLiked(true);
      }
    } else {
      const wasDisliked = hasDisliked;
      setOptimisticLikes((prev) => prev + 1);
      setHasLiked(true);
      if (wasDisliked) {
        setOptimisticDislikes((prev) => prev - 1);
        setHasDisliked(false);
      }
      try {
        if (wasDisliked) {
          await likeAndUndislikePostMutation.mutateAsync({ post: postId });
        } else {
          await likePostMutation.mutateAsync({ post: postId });
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
        await undislikePostMutation.mutateAsync({ post: postId });
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
          await dislikeAndUnlikePostMutation.mutateAsync({ post: postId });
        } else {
          await dislikePostMutation.mutateAsync({ post: postId });
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
                {isPostLoading || !post ? (
                  <div className="flex items-start">
                    <div className="mr-4">
                      <Skeleton className="h-14 w-14 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-5 w-32" />
                      <Skeleton className="mb-1 h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <div className="mr-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage
                          src={post.createdBy?.avatar ?? "/placeholder.svg"}
                          alt="@user"
                        />
                        <AvatarFallback>
                          {post.createdBy?.username.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        <Link
                          href={`/u/${post.createdBy?.id}`}
                          className="underline"
                        >
                          {post.createdBy?.username}
                        </Link>
                      </div>
                      <div className="text-muted-foreground text-xs font-semibold">
                        {formatTimeAgo(post.createdAt)}
                      </div>
                      <div className="text-muted-foreground text-xs font-semibold">
                        {post.topic.charAt(0).toUpperCase() +
                          post.topic.slice(1)}
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  {isPostLoading || !post ? (
                    <Skeleton className="h-7 w-3/4 max-w-md" />
                  ) : (
                    <p className="text-xl font-semibold">{post.title}</p>
                  )}
                </div>
                {isImage &&
                  (isPostLoading || !post ? (
                    <div className="mt-4">
                      <Skeleton className="h-[300px] w-full rounded-md" />
                    </div>
                  ) : (
                    post.image && (
                      <div className="mt-4">
                        <MediaPlayer
                          url={post.image}
                          imageProps={{
                            alt: "Post Image",
                            width: 500,
                            height: 500,
                            className: "h-full w-full rounded-md object-cover",
                          }}
                          videoProps={{
                            className: "h-full w-full rounded-md object-cover",
                          }}
                        />
                      </div>
                    )
                  ))}

                <div className="mt-3 break-words">
                  {isPostLoading || !post ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  ) : post.content?.includes("\n") ? (
                    post.content
                      .split("\n")
                      .filter((x) => x !== "")
                      .map((y) => (
                        <p className="text-lg" key={y}>
                          {y}
                        </p>
                      ))
                  ) : (
                    <p className="text-md">{post.content}</p>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-12 sm:justify-between sm:gap-0">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={likePost}>
                      {hasLiked ? (
                        <icons.HeartIconFilled />
                      ) : (
                        <icons.HeartIcon />
                      )}
                      <span className="sr-only">Like</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={dislikePost}>
                      {hasDisliked ? (
                        <icons.ThumbsDownIconFilled />
                      ) : (
                        <icons.ThumbsDownIcon />
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
                    {isAuthor && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <div className="mb-4 flex items-center gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
                              <Trash className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                              <DialogTitle className="text-foreground text-lg font-semibold">
                                Delete Post
                              </DialogTitle>
                              <p className="text-muted-foreground mt-1 text-sm">
                                This action cannot be undone. The post will be
                                permanently removed.
                              </p>
                            </div>
                          </div>

                          <div className="bg-muted/50 mb-6 rounded-lg p-4">
                            <p className="text-muted-foreground text-sm">
                              Are you sure you want to delete this post? This
                              will remove it from your profile and all
                              associated comments.
                            </p>
                          </div>

                          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <DialogClose>
                              <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                disabled={deletePostByIdMutation.isPending}
                              >
                                Cancel
                              </Button>
                            </DialogClose>

                            <Button
                              variant="destructive"
                              onClick={async () => {
                                await deletePostByIdMutation.mutateAsync({
                                  postId: postId,
                                });
                                router.push("/feed");
                              }}
                              size={"default"}
                              disabled={deletePostByIdMutation.isPending}
                              className="w-full bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 sm:w-auto"
                            >
                              {deletePostByIdMutation.isPending ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                "Delete Post"
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {isPostLoading || !post ? (
                      <Skeleton className="h-[20px] w-[213px]" />
                    ) : (
                      <>
                        {optimisticLikes} Likes • {optimisticDislikes} Dislikes
                        • {optimisticCommentsCount} Comments
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className={`bg-muted rounded-lg px-4 py-6 md:w-[50vw]`}>
                <h2 className="text-secondary-foreground mb-4 text-lg font-semibold">
                  Comments
                </h2>
                <div className="space-y-4">
                  {/* Comment input with mention functionality */}
                  <div className="space-y-3">
                    <div className="flex w-full items-end gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="text"
                          className="w-full rounded-md py-5"
                          placeholder={
                            replyTo
                              ? "Write your reply..."
                              : "Add a comment... (Type @ to mention users)"
                          }
                          onChange={(e) => {
                            setSearchTerm(e.target.value ?? "");
                            handleInputChange(e);
                          }}
                          value={inputValue}
                          ref={inputRef}
                          onKeyDown={(e) =>
                            handleKeyDown(e, () => void addComment())
                          }
                        />
                        <MentionDropdown
                          users={filteredUsers}
                          selectedIndex={selectedIndex}
                          onSelectUser={selectUser}
                          show={showDropdown}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <CldUploadButton
                          options={{
                            resourceType: "image",
                          }}
                          className="w-full"
                          uploadPreset="social-media-again"
                          onSuccess={(results) => {
                            const uploadedImageUrl = String(
                              // @ts-expect-error - results.info is not typed
                              results.info.secure_url,
                            );
                            setNewComment((prev) => ({
                              ...prev,
                              image: String(uploadedImageUrl),
                            }));
                            toast("Image uploaded successfully!");
                          }}
                        >
                          <Button variant="outline" size="icon">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        </CldUploadButton>
                        <Button
                          className="py-5"
                          onClick={addComment}
                          disabled={
                            commentLoading ??
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
                              className:
                                "max-h-32 max-w-48 rounded-md object-cover",
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
                            setInputValue("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  {isCommentsLoading || isCommentsPending ? (
                    <PostCommentsLoading />
                  ) : (
                    comments
                      ?.filter((comment) => !comment.isAReply)
                      .map((comment) => {
                        // Get replies for this comment
                        const replies =
                          comments?.filter(
                            (reply) =>
                              reply.isAReply && reply.replyTo === comment.id,
                          ) ?? [];
                        return (
                          <Comment
                            comment={comment}
                            replies={replies}
                            handleReply={handleReply}
                            user={user}
                            toggleReplies={toggleReplies}
                            expandedReplies={expandedReplies}
                            deleteCommentMutation={deleteCommentMutation}
                            key={comment.id}
                          />
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

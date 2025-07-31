"use client";

import { Card } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { formatTimeAgo } from "@/lib/format-time-ago";
import {
  Bookmark,
  Edit,
  ImageIcon,
  Loader2,
  Share2,
  Trash,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import * as icons from "./icons";
import { useState, useEffect, useCallback } from "react";
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
import { Label } from "../ui/label";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { uploadPostSchema, type TUploadPostSchema } from "@/lib/schemas";
import { Controller, useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Carousel,
  CarouselPrevious,
  CarouselItem,
  CarouselContent,
  CarouselNext,
} from "../ui/carousel";
import { Badge } from "../ui/badge";

export function PostDetails({ postId }: { postId: string }) {
  const { user, refetchUser } = useGetUser();
  const router = useRouter();

  // Fetch the post data here
  const {
    data: post,
    isLoading: isPostLoading,
    refetch: refetchPost,
  } = api.postRouter.getPostById.useQuery({ postId });

  const searchParams = useSearchParams();

  const [isAuthor, setIsAuthor] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const isImageParam = searchParams.get("image");
  const isAuthorParam = searchParams.get("author");

  // Use post fields for all logic below
  const [newComment, setNewComment] = useState({
    image: "",
    content: "",
  });

  const [canFetchComments, setCanFetchComments] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [hasLiked, setHasLiked] = useState(() =>
    post?.likes?.includes(user.id),
  );
  const [hasSaved, setHasSaved] = useState(() =>
    user?.savedPosts?.includes(postId),
  );
  const [replyTo, setReplyTo] = useState("");
  const [optimisticCommentsCount, setOptimisticCommentsCount] = useState(
    post?.commentsCount ?? 0,
  );
  const [hasDisliked, setHasDisliked] = useState(() =>
    post?.disLikes?.includes(user.id),
  );

  const [optimisticLikes, setOptimisticLikes] = useState(
    post?.likes?.length ?? 0,
  );
  const [optimisticDislikes, setOptimisticDislikes] = useState(
    post?.disLikes?.length ?? 0,
  );
  const [optimisticSavedCount, setOptimisticSavedCount] = useState(
    post?.savedCount ?? 0,
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
  } = useMentionInput(allUsers);

  useEffect(() => {
    setNewComment((prev) => ({ ...prev, content: inputValue }));
  }, [inputValue]);

  const likePostMutation = api.postRouter.likePost.useMutation();

  const unlikePostMutation = api.postRouter.unlikePost.useMutation();

  const likeAndUndislikePostMutation =
    api.postRouter.likeAndUndislikePost.useMutation();

  const editCommentMutation = api.postRouter.editComment.useMutation({
    onSuccess: () => {
      setCanFetchComments(true);
      toast("Comment edited successfully");
    },
  });

  const deleteCommentMutation = api.postRouter.deleteComment.useMutation({
    onMutate: (data) => {
      setCanFetchComments(false);
      setOptimisticCommentsCount((prev) => prev - 1);

      const index = comments?.findIndex(
        (comment) => comment.id === data.commentId,
      );
      if (index !== -1 && index !== undefined) {
        comments?.splice(index, 1);
      }
    },
    onSuccess: () => {
      setCanFetchComments(true);
    },
  });

  const dislikePostMutation = api.postRouter.dislikePost.useMutation();

  const savePostMutation = api.postRouter.savePostById.useMutation({
    onMutate: (data) => {
      if (data.saved) {
        toast.success("Post unsaved successfully");
      } else {
        toast.success("Post saved successfully");
      }
      setHasSaved((prev) => !prev);
      setOptimisticSavedCount((prev) => prev + 1);
    },
    onSuccess: async () => {
      await refetchUser();
    },
  });

  const undislikePostMutation = api.postRouter.undislikePost.useMutation();

  const dislikeAndUnlikePostMutation =
    api.postRouter.dislikeAndUnlikePost.useMutation();

  const commentAddMutation = api.postRouter.addComments.useMutation({
    onMutate: (data) => {
      setCanFetchComments(false);
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
    onSettled: () => {
      setCanFetchComments(true);
    },
  });

  const deletePostByIdMutation = api.postRouter.deletePostById.useMutation({
    onSuccess: async () => {
      toast("Post deleted");
      router.back();
    },
  });

  const editPostMutation = api.postRouter.editPostById.useMutation({
    onSuccess: async () => {
      await refetchPost();
      setIsEditDialogOpen(false);
      toast("Post edited successfully");
    },
    onError: (error) => {
      toast(`Failed to edit post: ${error.message}`);
    },
  });

  const { isLoading: isLoadingTopics, data: topics } =
    api.topicRouter.getAllTopics.useQuery();

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<TUploadPostSchema>({
    resolver: valibotResolver(uploadPostSchema),
  });

  // Reset form when post data loads or dialog opens
  useEffect(() => {
    if (post) {
      reset({
        title: post.title || "",
        content: post.content ?? "",
        image: post.image ?? [],
        isPublic: post.isPublic,
        topic: post.topic || "General",
        author: user.id,
      });
      // Initialize edit images
      setEditImages(post.image ?? []);
    }
  }, [post, isEditDialogOpen, reset, user.id]);

  // Local state for edit images to avoid form state issues
  const [editImages, setEditImages] = useState<string[]>([]);

  // Function to handle image upload with proper state management for edit form
  const handleEditImageUpload = useCallback(
    (uploadImageUrl: string) => {
      try {
        console.log("Adding new edit image:", uploadImageUrl);
        setEditImages((prev) => {
          const updatedImages = [...prev, uploadImageUrl];
          console.log("Updated edit images array:", updatedImages);
          // Sync with form
          setValue("image", updatedImages, { shouldValidate: true });
          return updatedImages;
        });
        toast(`Image uploaded successfully! Total: ${editImages.length + 1}`);
      } catch (error) {
        console.error("Error handling edit image upload:", error);
        toast.error("Failed to upload image. Please try again.");
      }
    },
    [setValue, editImages.length],
  );

  // Function to remove a specific image from edit form
  const removeEditImage = useCallback(
    (indexToRemove: number) => {
      setEditImages((prev) => {
        const updatedImages = prev.filter(
          (_, index) => index !== indexToRemove,
        );
        setValue("image", updatedImages, { shouldValidate: true });
        return updatedImages;
      });
      toast("Image removed");
    },
    [setValue],
  );

  async function onEditPost(data: TUploadPostSchema) {
    try {
      await editPostMutation.mutateAsync({
        postId: postId,
        uploadPostSchema: data,
      });
    } catch (error) {
      console.error("Edit post error:", error);
    }
  }

  const {
    data: comments,
    isLoading: isCommentsLoading,
    isPending: isCommentsPending,
  } = api.postRouter.getCommentsByPostId.useQuery(
    {
      postId: postId,
    },
    {
      enabled: canFetchComments,
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
    setOptimisticSavedCount(post?.savedCount ?? 0);

    setHasDisliked(post?.disLikes?.includes(user.id));
    setHasLiked(post?.likes?.includes(user.id));
    setHasSaved(user?.savedPosts?.includes(postId));
  }, [post, postId, user.id, user?.savedPosts]);

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

  const visibility = watch("isPublic");

  return (
    <Card className="flex h-[calc(100vh+15rem)] w-full items-start py-0 pb-12 md:h-fit md:w-fit md:pb-0">
      <div className="h-auto w-full px-2 py-3 sm:px-6 md:w-auto lg:p-2">
        <div className="flex flex-col px-[6px] pb-[6px] md:min-w-[60vw] md:flex-row md:py-[6px]">
          <div className="w-full py-6 sm:w-3/4 sm:p-6">
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
                    {post.topic.charAt(0).toUpperCase() + post.topic.slice(1)}
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
              ) : post.image &&
                post.image.length > 0 &&
                post.image[0] !== "" &&
                post.image.length > 1 ? (
                <div className="mt-4">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {post.image.map((image, idx) => (
                        <CarouselItem key={image + idx}>
                          <div className="relative flex aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100 sm:aspect-[16/9] lg:aspect-[4/3] dark:bg-gray-800">
                            <MediaPlayer
                              url={image}
                              imageProps={{
                                alt: `Post Image ${idx + 1}`,
                                width: 800,
                                height: 600,
                                className:
                                  "h-full w-full object-contain transition-transform duration-300 hover:scale-105",
                              }}
                              videoProps={{
                                className: "h-full w-full object-contain",
                              }}
                            />
                            {/* Image counter badge */}
                            <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                              {idx + 1} of {post.image?.length ?? 0}
                              {image.endsWith(".mp4") ||
                              image.endsWith(".mkv") ||
                              image.endsWith(".mov")
                                ? " (video)"
                                : " (image)"}
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90" />
                    <CarouselNext className="right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90" />
                  </Carousel>
                </div>
              ) : (
                post.image &&
                post.image[0] !== "" && (
                  <div className="mt-4">
                    <div className="relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      {/* Dynamic aspect ratio container for single images */}
                      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[4/3]">
                        <MediaPlayer
                          url={String(post.image[0])}
                          imageProps={{
                            alt: "Post Image",
                            width: 800,
                            height: 600,
                            className:
                              "h-full w-full object-contain transition-transform duration-300 hover:scale-105",
                          }}
                          videoProps={{
                            className: "h-full w-full object-contain",
                          }}
                        />
                      </div>
                    </div>
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
              ) : (
                (() => {
                  const content = post.content ?? "";
                  const renderContent = (text: string) => {
                    // Split by newlines, but keep empty lines as well
                    const lines = text.split("\n");
                    const elements: React.ReactNode[] = [];

                    let emptyLineCount: number;

                    lines.forEach((line, idx) => {
                      if (!line.trim()) {
                        emptyLineCount++;
                        elements.push(<br key={`br-${idx}`} />);
                        return;
                      }
                      emptyLineCount = 0;
                      const parts = line.split(/(#\w+)/g);
                      elements.push(
                        <p className="text-lg" key={`p-${idx}`}>
                          {parts.map((part, i) =>
                            /^#\w+/.test(part) ? (
                              <Link
                                href={`/t/${part.slice(1)}`}
                                className="text-primary underline"
                                key={i}
                              >
                                {part}
                              </Link>
                            ) : (
                              <span key={i}>{part}</span>
                            ),
                          )}
                        </p>,
                      );
                    });

                    return elements;
                  };

                  return renderContent(content);
                })()
              )}
            </div>

            <div className="mt-8 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-12">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={likePost}
                  className="group relative"
                >
                  {hasLiked ? <icons.HeartIconFilled /> : <icons.HeartIcon />}
                  <span className="sr-only">Like</span>
                  <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Like
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={dislikePost}
                  className="group relative"
                >
                  {hasDisliked ? (
                    <icons.ThumbsDownIconFilled />
                  ) : (
                    <icons.ThumbsDownIcon />
                  )}
                  <span className="sr-only">Dislike</span>
                  <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Dislike
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyUrlToClipboard}
                  className="group relative"
                >
                  <Share2 />
                  <span className="sr-only">Share</span>
                  <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Share
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () =>
                    await savePostMutation.mutateAsync({
                      postId: postId,
                      saved: hasSaved,
                    })
                  }
                  className="group relative"
                >
                  <Bookmark fill={hasSaved ? "currentColor" : "transparent"} />
                  <span className="sr-only">Save</span>
                  <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Save
                  </span>
                </Button>
                {isAuthor && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="group relative"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                        <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                          Delete
                        </span>
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
                          Are you sure you want to delete this post? This will
                          remove it from your profile and all associated
                          comments.
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
                {isAuthor && (
                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="group relative"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                        <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                          Edit
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-h-[90vh] max-w-2xl overflow-y-auto"
                      style={{ zIndex: 9999 }}
                    >
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                          <Edit className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <DialogTitle className="text-foreground text-lg font-semibold">
                            Edit Post
                          </DialogTitle>
                          <p className="text-muted-foreground mt-1 text-sm">
                            Make changes to your post below
                          </p>
                        </div>
                      </div>

                      <form
                        onSubmit={handleSubmit(onEditPost)}
                        className="space-y-6"
                      >
                        <div className="grid gap-3">
                          <Label
                            htmlFor="title"
                            className="text-base font-medium"
                          >
                            Title
                          </Label>
                          <Controller
                            control={control}
                            name="title"
                            render={({ field }) => (
                              <Input
                                id="title"
                                type="text"
                                placeholder="Enter a title for your post"
                                className="h-11"
                                {...field}
                              />
                            )}
                          />
                          {errors.title && (
                            <p className="text-sm text-red-500">
                              {errors.title.message}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-3">
                          <Label
                            htmlFor="content"
                            className="text-base font-medium"
                          >
                            Content
                          </Label>
                          <Controller
                            control={control}
                            name="content"
                            render={({ field }) => (
                              <Textarea
                                id="content"
                                placeholder="Write the content of your post"
                                rows={4}
                                className="resize-none"
                                {...field}
                              />
                            )}
                          />
                          {errors.content && (
                            <p className="text-sm text-red-500">
                              {errors.content.message}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-3">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="image"
                              className="text-base font-medium"
                            >
                              Images
                            </Label>
                            {editImages && editImages.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {editImages.length} image
                                {editImages.length > 1 ? "s" : ""} uploaded
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-3">
                            <div
                              style={{
                                zIndex: 10000,
                                position: "relative",
                                pointerEvents: "all",
                              }}
                              className="cloudinary-upload-wrapper"
                            >
                              <CldUploadButton
                                className="pointer-events-[all] w-full"
                                uploadPreset="social-media-again"
                                options={{
                                  resourceType: "image",
                                }}
                                onSuccess={(results) => {
                                  const uploadImageUrl = String(
                                    // @ts-expect-error - results.info is not typed
                                    results?.info?.secure_url,
                                  );
                                  handleEditImageUpload(uploadImageUrl);
                                }}
                              >
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="w-full"
                                >
                                  <ImageIcon className="mr-2 h-4 w-4" />
                                  {editImages && editImages.length > 0
                                    ? `Add Another Image (${editImages.length} uploaded)`
                                    : "Upload Images"}
                                </Button>
                              </CldUploadButton>
                            </div>

                            {editImages && editImages.length > 0 && (
                              <div className="relative">
                                <Carousel className="w-full">
                                  <CarouselContent>
                                    {editImages.map(
                                      (url: string, idx: number) => (
                                        <CarouselItem key={`${url}-${idx}`}>
                                          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                            <MediaPlayer
                                              url={url}
                                              imageProps={{
                                                alt: `Preview ${idx + 1}`,
                                                className:
                                                  "w-full max-w-md h-auto object-cover rounded-md",
                                                height: 300,
                                                width: 400,
                                              }}
                                              videoProps={{
                                                className:
                                                  "w-full max-w-md h-auto object-cover rounded-md",
                                              }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                                            {/* Remove button */}
                                            <Button
                                              type="button"
                                              variant="destructive"
                                              size="sm"
                                              className="absolute top-2 right-2 h-8 w-8 p-0"
                                              onClick={() =>
                                                removeEditImage(idx)
                                              }
                                            >
                                              <X size={14} />
                                            </Button>

                                            {/* Image counter */}
                                            <Badge
                                              variant="secondary"
                                              className="absolute top-2 left-2 bg-white/90 text-gray-700"
                                            >
                                              {idx + 1} of {editImages.length}
                                            </Badge>
                                          </div>
                                        </CarouselItem>
                                      ),
                                    )}
                                  </CarouselContent>
                                  {editImages.length > 1 && (
                                    <>
                                      <CarouselPrevious />
                                      <CarouselNext />
                                    </>
                                  )}
                                </Carousel>
                              </div>
                            )}
                          </div>
                          {errors.image && (
                            <p className="text-sm text-red-500">
                              {errors.image.message}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-3">
                          <Label
                            htmlFor="visibility"
                            className="text-base font-medium"
                          >
                            Visibility
                          </Label>
                          <div className="mb-2 flex items-center gap-2">
                            {visibility ? (
                              <div className="flex items-center gap-2">
                                <Eye size={16} className="text-primary" />
                                <p className="text-primary text-sm font-medium">
                                  Public - Visible to everyone
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <EyeOff
                                  size={16}
                                  className="text-secondary-foreground"
                                />
                                <p className="text-secondary-foreground text-sm font-medium">
                                  Private - Only visible to you and your friends
                                </p>
                              </div>
                            )}
                          </div>
                          <Controller
                            name="isPublic"
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={(value) =>
                                  field.onChange(value === "true")
                                }
                                value={field.value ? "true" : "false"}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">
                                    <div className="flex items-center gap-2">
                                      <Eye size={16} />
                                      Public
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="false">
                                    <div className="flex items-center gap-2">
                                      <EyeOff size={16} />
                                      Private
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.isPublic && (
                            <p className="text-sm text-red-500">
                              {errors.isPublic.message}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-3">
                          <Label
                            htmlFor="topic"
                            className="text-base font-medium"
                          >
                            Topic
                          </Label>
                          <Controller
                            name="topic"
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a topic" />
                                </SelectTrigger>
                                <SelectContent>
                                  {isLoadingTopics ? (
                                    <SelectItem value="General">
                                      General
                                    </SelectItem>
                                  ) : (
                                    topics?.map(
                                      (topic: { id: string; name: string }) => (
                                        <SelectItem
                                          key={topic.id}
                                          value={topic.name}
                                        >
                                          {topic.name}
                                        </SelectItem>
                                      ),
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.topic && (
                            <p className="text-sm text-red-500">
                              {errors.topic.message}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                          <DialogClose asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full sm:w-auto"
                              disabled={editPostMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </DialogClose>

                          <Button
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={editPostMutation.isPending}
                          >
                            {editPostMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="text-muted-foreground text-sm">
                {isPostLoading || !post ? (
                  <Skeleton className="h-[20px] w-[213px]" />
                ) : (
                  <>
                    {optimisticLikes} Likes • {optimisticDislikes} Dislikes •{" "}
                    {optimisticCommentsCount} Comments • {optimisticSavedCount}{" "}
                    Saves
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
                        editCommentMutation={editCommentMutation}
                        key={comment.id}
                      />
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

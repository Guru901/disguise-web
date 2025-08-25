/* eslint-disable @typescript-eslint/unbound-method */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimeAgo } from "@/lib/format-time-ago";
import Link from "next/link";
import MediaPlayer from "../media-player";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Edit,
  EllipsisVerticalIcon,
  Reply,
  Trash,
  Loader2,
  Check,
  X,
} from "lucide-react";
import type { User } from "@/lib/userStore";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import { toast } from "sonner"; // Assuming you're using sonner for toasts

type CommentProps = {
  comment: {
    id: string;
    content: string;
    post: string | null;
    image: string | null;
    isAReply: boolean;
    replyTo: string | null;
    replies: string[] | null;
    authorUsername: string | null;
    authorAvatar: string | null;
    authorId: string | null;
    isDeleted: boolean | null;
    createdAt: Date;
  };
  replies: {
    id: string;
    content: string;
    post: string | null;
    image: string | null;
    isAReply: boolean;
    replyTo: string | null;
    replies: string[] | null;
    authorUsername: string | null;
    authorAvatar: string | null;
    authorId: string | null;
    isDeleted: boolean | null;
    createdAt: Date;
  }[];
  handleReply(commentId: string, username: string): void;
  user: User;
  toggleReplies(commentId: string): void;
  expandedReplies: Set<string>;
  deleteCommentMutation: {
    mutateAsync: (args: { commentId: string }) => Promise<unknown>;
    isPending?: boolean;
  };
  editCommentMutation: {
    mutateAsync: (args: {
      commentId: string;
      content: string;
    }) => Promise<unknown>;
    isPending?: boolean;
  };
};

type DeleteState = {
  isOpen: boolean;
  commentId: string | null;
  isReply: boolean;
  isDeleting: boolean;
};

type EditState = {
  commentId: string | null;
};

type EditFormData = {
  content: string;
};

export default function Comment({
  comment,
  replies,
  handleReply,
  user,
  toggleReplies,
  expandedReplies,
  deleteCommentMutation,
  editCommentMutation,
}: CommentProps) {
  const [deleteState, setDeleteState] = useState<DeleteState>({
    isOpen: false,
    commentId: null,
    isReply: false,
    isDeleting: false,
  });

  const [editState, setEditState] = useState<EditState>({
    commentId: null,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormData>();

  const handleDeleteClick = (commentId: string, isReply = false) => {
    setDeleteState({
      isOpen: true,
      commentId,
      isReply,
      isDeleting: false,
    });
  };

  const handleEditClick = (targetComment: typeof comment) => {
    setEditState({
      commentId: targetComment.id,
    });
    reset({ content: targetComment.content });
  };

  const handleCancelEdit = () => {
    setEditState({
      commentId: null,
    });
    reset();
  };

  const handleEditSubmit = async (data: EditFormData) => {
    if (!editState.commentId || !data.content.trim()) return;

    try {
      await editCommentMutation.mutateAsync({
        commentId: editState.commentId,
        content: data.content.trim(),
      });

      toast.success(`Updated successfully`);

      setEditState({
        commentId: null,
      });
      reset();
    } catch (error) {
      console.error("Failed to edit comment:", error);
      toast.error(`Failed to update. Please try again.`);
    }
  };

  const closeDeleteDialog = () => {
    if (deleteState.isDeleting) return; // Prevent closing while deleting
    setDeleteState({
      isOpen: false,
      commentId: null,
      isReply: false,
      isDeleting: false,
    });
  };

  const confirmDelete = async () => {
    if (!deleteState.commentId || deleteState.isDeleting) return;

    setDeleteState((prev) => ({ ...prev, isDeleting: true }));

    try {
      await deleteCommentMutation.mutateAsync({
        commentId: deleteState.commentId,
      });

      toast.success(
        `${deleteState.isReply ? "Reply" : "Comment"} deleted successfully`,
      );

      closeDeleteDialog();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error(
        `Failed to delete ${deleteState.isReply ? "reply" : "comment"}. Please try again.`,
      );
      setDeleteState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const renderCommentContent = (
    targetComment: typeof comment,
    isDeleted?: boolean,
    isReplyComment = false,
  ) => {
    const isEditing = editState.commentId === targetComment.id;

    if (isEditing) {
      return (
        <form
          onSubmit={handleSubmit(handleEditSubmit)}
          className="mt-3 space-y-3"
        >
          <div className="text-muted-foreground text-sm font-medium">
            Editing {isReplyComment ? "reply" : "comment"}
          </div>
          <Controller
            name="content"
            control={control}
            rules={{
              required: "Comment content is required",
              minLength: {
                value: 1,
                message: "Comment must not be empty",
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={`Edit your ${isReplyComment ? "reply" : "comment"}...`}
                className="min-h-[44px] w-full text-base" // Better touch target
                autoFocus
                disabled={editCommentMutation.isPending}
              />
            )}
          />
          {errors.content && (
            <p className="text-destructive text-sm">{errors.content.message}</p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              size="sm"
              disabled={editCommentMutation.isPending}
              className="min-h-[44px] flex-1 sm:flex-none"
            >
              {editCommentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              disabled={editCommentMutation.isPending}
              className="min-h-[44px] flex-1 sm:flex-none"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      );
    }

    return (
      <div
        className={`mt-2 leading-relaxed ${
          isDeleted ? "text-muted-foreground italic" : "text-foreground"
        }`}
      >
        {isDeleted ? (
          <p className="text-sm">This comment has been deleted</p>
        ) : !targetComment.content.includes("@") ? (
          <p className="text-[15px] break-words sm:text-base">
            {targetComment.content}
          </p>
        ) : (
          <p className="text-sm break-words sm:text-base">
            {targetComment.content
              .split(" ")
              .map((word: string, index: number) =>
                word.startsWith("@") ? (
                  <Link
                    key={index}
                    className="text-primary hover:text-primary/80 underline transition-colors"
                    href={`/u/${word.slice(1)}`}
                  >
                    {word + " "}
                  </Link>
                ) : (
                  <span key={index}>{word + " "}</span>
                ),
              )}
          </p>
        )}
      </div>
    );
  };

  const renderDropdownMenu = (
    targetComment: typeof comment,
    reply: CommentProps["comment"] = {
      id: "",
      content: "",
      post: null,
      image: null,
      isAReply: false,
      replyTo: null,
      replies: null,
      authorUsername: null,
      authorAvatar: null,
      authorId: null,
      isDeleted: null,
      createdAt: new Date(),
    },
  ) => {
    let idToCheck = reply.authorId ? reply.authorId : targetComment.authorId;
    let idToDelete = reply.id ? reply.id : targetComment.id;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-min shrink-0 py-0"
            disabled={deleteState.isDeleting || editCommentMutation.isPending}
          >
            <EllipsisVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => {
              handleReply(
                targetComment.id,
                targetComment.authorUsername ?? "User",
              );
            }}
            disabled={deleteState.isDeleting || editCommentMutation.isPending}
            className="cursor-pointer"
          >
            <Reply className="mr-3 h-4 w-4" />
            Reply
          </DropdownMenuItem>
          {user.id === idToCheck && (
            <>
              <DropdownMenuItem
                onClick={() => handleEditClick(reply ? reply : comment)}
                disabled={
                  deleteState.isDeleting ??
                  editCommentMutation.isPending ??
                  editState.commentId !== null
                }
                className="cursor-pointer"
              >
                <Edit className="mr-3 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(idToDelete)}
                disabled={
                  deleteState.isDeleting || editCommentMutation.isPending
                }
                className="text-destructive focus:text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <Trash className="mr-3 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="w-full">
      {/* Main comment */}
      <div className="flex flex-col gap-2 p-3 sm:p-4 md:flex-row">
        {/* Avatar */}
        <div className="flex shrink-0 gap-3">
          <Avatar className="h-8 w-8 sm:h-12 sm:w-12">
            <AvatarImage
              src={comment.authorAvatar ?? ""}
              alt={`${comment.authorUsername ?? "User"}'s avatar`}
              className="rounded-full"
            />
            <AvatarFallback>
              <div className="bg-background border-primary flex h-full w-full items-center justify-center rounded-full border-2">
                <span className="text-foreground text-sm font-medium sm:text-base">
                  {comment.authorUsername?.slice(0, 1).toUpperCase() ?? "U"}
                </span>
              </div>
            </AvatarFallback>
          </Avatar>
          <div className="static flex w-full items-start justify-between gap-2 md:hidden">
            <div className="min-w-0 flex-1">
              <Link
                href={`/u/${comment.authorId}`}
                className="group inline-flex flex-row items-center gap-1"
              >
                <span className="text-foreground truncate text-sm font-semibold group-hover:underline sm:text-base">
                  {comment.authorUsername ?? "User"}
                </span>
                <span className="font-thin">•</span>
                <span className="text-muted-foreground shrink-0 text-xs sm:text-sm">
                  {formatTimeAgo(
                    typeof comment.createdAt === "string"
                      ? new Date(comment.createdAt)
                      : comment.createdAt,
                  )}
                </span>
              </Link>
            </div>
            {!comment.isDeleted && (
              <div className="shrink-0">{renderDropdownMenu(comment)}</div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="hidden w-full items-center justify-between gap-2 md:flex">
            <div className="min-w-0 flex-1">
              <Link
                href={`/u/${comment.authorId}`}
                className="flex items-center gap-2"
              >
                <span className="text-foreground truncate text-sm font-semibold group-hover:underline sm:text-base">
                  {comment.authorUsername ?? "User"}
                </span>
                <div className="bg-muted-foreground h-1 w-1 rounded-full"></div>
                <span className="text-muted-foreground shrink-0 text-xs sm:text-sm">
                  {formatTimeAgo(
                    typeof comment.createdAt === "string"
                      ? new Date(comment.createdAt)
                      : comment.createdAt,
                  )}
                </span>
              </Link>
            </div>
            {!comment.isDeleted && (
              <div className="shrink-0 p-0">{renderDropdownMenu(comment)}</div>
            )}
          </div>

          {/* Comment content */}
          {renderCommentContent(comment, comment.isDeleted ?? false)}

          {/* Image/Media */}
          {comment.image && !comment.isDeleted && (
            <div className="mt-3">
              <MediaPlayer
                imageProps={{
                  alt: "Comment attachment",
                  width: 300,
                  height: 100,
                  className: "w-full max-w-sm rounded-lg object-cover border",
                }}
                videoProps={{
                  className: "w-full max-w-sm rounded-lg border",
                }}
                url={comment.image}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies section */}
      {replies.length > 0 && (
        <>
          <div className="border-muted border-l-2 pl-4 sm:ml-12 sm:pl-6 md:ml-8 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleReplies(comment.id)}
              className="text-muted-foreground mb-3 text-[12px] transition-colors"
              disabled={deleteState.isDeleting || editCommentMutation.isPending}
            >
              {expandedReplies.has(comment.id)
                ? `Hide ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`
                : `Show ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`}
            </Button>

            {expandedReplies.has(comment.id) && (
              <div className="space-y-4">
                {replies.map((reply) => (
                  <div
                    className="flex w-full justify-between gap-3 p-3 sm:p-4 md:flex-row"
                    key={reply.id}
                  >
                    {/* Avatar */}
                    <div className="w-full">
                      <div className="flex shrink-0 items-center gap-3">
                        <Avatar className="h-8 w-8 sm:h-12 sm:w-12">
                          <AvatarImage
                            src={reply.authorAvatar ?? ""}
                            alt={`${reply.authorUsername ?? "User"}'s avatar`}
                            className="rounded-full"
                          />
                          <AvatarFallback>
                            <div className="bg-background border-primary flex h-full w-full items-center justify-center rounded-full border-2">
                              <span className="text-foreground text-sm font-medium sm:text-base">
                                {reply.authorUsername
                                  ?.slice(0, 1)
                                  .toUpperCase() ?? "U"}
                              </span>
                            </div>
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex w-full items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/u/${reply.authorId}`}
                              className="group inline-flex flex-row items-center gap-1 sm:gap-2"
                            >
                              <span className="text-foreground truncate text-sm font-semibold group-hover:underline sm:text-base">
                                {reply.authorUsername ?? "User"}
                              </span>
                              <span className="font-thin">•</span>
                              <span className="text-muted-foreground shrink-0 text-xs sm:text-sm">
                                {formatTimeAgo(
                                  typeof reply.createdAt === "string"
                                    ? new Date(reply.createdAt)
                                    : reply.createdAt,
                                )}
                              </span>
                            </Link>
                          </div>
                          {!reply.isDeleted && (
                            <div className="shrink-0">
                              {renderDropdownMenu(comment, reply)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        {/* Comment content */}
                        {renderCommentContent(reply, reply.isDeleted ?? false)}

                        {/* Image/Media */}
                        {reply.image && !reply.isDeleted && (
                          <div className="mt-3">
                            <MediaPlayer
                              imageProps={{
                                alt: "Comment attachment",
                                width: 300,
                                height: 100,
                                className:
                                  "w-full max-w-sm rounded-lg object-cover border",
                              }}
                              videoProps={{
                                className: "w-full max-w-sm rounded-lg border",
                              }}
                              url={reply.image}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-muted hidden border-l-2 pl-4 sm:ml-12 sm:pl-6 md:ml-8 md:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleReplies(comment.id)}
              className="text-muted-foreground mb-3 text-[12px] transition-colors"
              disabled={deleteState.isDeleting || editCommentMutation.isPending}
            >
              {expandedReplies.has(comment.id)
                ? `Hide ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`
                : `Show ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`}
            </Button>

            {expandedReplies.has(comment.id) && (
              <div className="space-y-4">
                {replies.map((reply) => (
                  <div
                    className="hidden flex-col gap-3 p-3 sm:p-4 md:flex md:flex-row"
                    key={reply.id}
                  >
                    {/* Avatar */}
                    <div className="flex shrink-0 gap-3">
                      <Avatar className="h-8 w-8 sm:h-12 sm:w-12">
                        <AvatarImage
                          src={reply.authorAvatar ?? ""}
                          alt={`${reply.authorUsername ?? "User"}'s avatar`}
                          className="rounded-full"
                        />
                        <AvatarFallback>
                          <div className="bg-background border-primary flex h-full w-full items-center justify-center rounded-full border-2">
                            <span className="text-foreground text-sm font-medium sm:text-base">
                              {reply.authorUsername
                                ?.slice(0, 1)
                                .toUpperCase() ?? "U"}
                            </span>
                          </div>
                        </AvatarFallback>
                      </Avatar>
                      <div className="static flex w-full items-start justify-between gap-2 md:hidden">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/u/${reply.authorId}`}
                            className="group inline-flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2"
                          >
                            <span className="text-foreground truncate text-sm font-semibold group-hover:underline sm:text-base">
                              {reply.authorUsername ?? "User"}
                            </span>
                            <span className="text-muted-foreground shrink-0 text-xs sm:text-sm">
                              {formatTimeAgo(
                                typeof reply.createdAt === "string"
                                  ? new Date(reply.createdAt)
                                  : reply.createdAt,
                              )}
                            </span>
                          </Link>
                        </div>
                        {!reply.isDeleted && (
                          <div className="shrink-0">
                            {renderDropdownMenu(comment, reply)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {/* Header */}
                      <div className="hidden w-full items-center justify-between gap-2 md:flex">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/u/${reply.authorId}`}
                            className="flex items-center gap-2"
                          >
                            <span className="text-foreground truncate text-sm font-semibold group-hover:underline sm:text-base">
                              {reply.authorUsername ?? "User"}
                            </span>
                            <div className="bg-muted-foreground h-1 w-1 rounded-full"></div>
                            <span className="text-muted-foreground shrink-0 text-xs sm:text-sm">
                              {formatTimeAgo(
                                typeof reply.createdAt === "string"
                                  ? new Date(reply.createdAt)
                                  : reply.createdAt,
                              )}
                            </span>
                          </Link>
                        </div>
                        {!reply.isDeleted && (
                          <div className="shrink-0 p-0">
                            {renderDropdownMenu(comment, reply)}
                          </div>
                        )}
                      </div>

                      {/* Comment content */}
                      {renderCommentContent(reply, reply.isDeleted ?? false)}

                      {/* Image/Media */}
                      {reply.image && !reply.isDeleted && (
                        <div className="mt-3">
                          <MediaPlayer
                            imageProps={{
                              alt: "Comment attachment",
                              width: 300,
                              height: 100,
                              className:
                                "w-full max-w-sm rounded-lg object-cover border",
                            }}
                            videoProps={{
                              className: "w-full max-w-sm rounded-lg border",
                            }}
                            url={reply.image}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog open={deleteState.isOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent className="mx-4 sm:max-w-md">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
              <Trash className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-foreground mb-1 text-lg font-semibold">
                Delete {deleteState.isReply ? "Reply" : "Comment"}
              </DialogTitle>
              <p className="text-muted-foreground text-sm leading-relaxed">
                This action cannot be undone. The comment will be permanently
                removed from the discussion.
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-2">
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={deleteState.isDeleting}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteState.isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[44px] w-full sm:w-auto"
            >
              {deleteState.isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Forever
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

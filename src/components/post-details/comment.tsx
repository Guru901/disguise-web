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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "../ui/dialog";
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
  isReply: boolean;
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
    isReply: false,
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

  const handleEditClick = (
    targetComment: typeof comment,
    isReply = false,
  ) => {
    setEditState({
      commentId: targetComment.id,
      isReply,
    });
    reset({ content: targetComment.content });
  };

  const handleCancelEdit = () => {
    setEditState({
      commentId: null,
      isReply: false,
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

      toast.success(
        `${editState.isReply ? "Reply" : "Comment"} updated successfully`,
      );

      setEditState({
        commentId: null,
        isReply: false,
      });
      reset();
    } catch (error) {
      console.error("Failed to edit comment:", error);
      toast.error(
        `Failed to update ${editState.isReply ? "reply" : "comment"}. Please try again.`,
      );
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
          className="mt-2 space-y-2"
        >
          <div className="text-muted-foreground mb-1 text-sm">
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
                className="w-full"
                autoFocus
                disabled={editCommentMutation.isPending}
              />
            )}
          />
          {errors.content && (
            <p className="text-destructive text-xs">{errors.content.message}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={editCommentMutation.isPending}
              className="h-8"
            >
              {editCommentMutation.isPending ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Save
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              disabled={editCommentMutation.isPending}
              className="h-8"
            >
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
          </div>
        </form>
      );
    }

    return (
      <div
        className={`text-accent-foreground ${isDeleted ? "text-muted-foreground italic" : ""}`}
      >
        {isDeleted ? (
          <p className="text-sm">This comment has been deleted</p>
        ) : !targetComment.content.includes("@") ? (
          <p>{targetComment.content}</p>
        ) : (
          <p>
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
    isReplyComment = false,
  ) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={isReplyComment ? "h-8 w-8" : ""}
          disabled={deleteState.isDeleting || editCommentMutation.isPending}
        >
          <EllipsisVerticalIcon className={isReplyComment ? "h-4 w-4" : ""} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() => {
            handleReply(
              isReplyComment ? comment.id : targetComment.id,
              targetComment.authorUsername ?? "User",
            );
          }}
          disabled={deleteState.isDeleting || editCommentMutation.isPending}
        >
          <Reply className="mr-2 h-4 w-4" />
          Reply
        </DropdownMenuItem>
        {user.id === targetComment.authorId && (
          <>
            <DropdownMenuItem
              onClick={() => handleEditClick(targetComment, isReplyComment)}
              disabled={
                deleteState.isDeleting ??
                editCommentMutation.isPending ??
                editState.commentId !== null
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                handleDeleteClick(targetComment.id, isReplyComment)
              }
              disabled={deleteState.isDeleting || editCommentMutation.isPending}
              className="text-destructive focus:text-destructive hover:bg-destructive/10"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div>
      {/* Main comment */}
      <div className="flex items-start">
        <div className="mr-4">
          <Avatar className="h-14 w-14">
            <AvatarImage
              src={comment.authorAvatar ?? ""}
              alt="Avatar"
              width={56}
              height={56}
              className="rounded-full"
            />
            <AvatarFallback>
              <div className="bg-background border-primary flex h-full w-full items-center justify-center rounded-full border-1">
                <span className="text-foreground">
                  {comment.authorUsername?.slice(0, 1)}
                </span>
              </div>
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex w-full justify-between">
          <div className="flex-1">
            <div className="text-md font-semibold text-[#949BA8]">
              <Link
                href={`/u/${comment.authorId}`}
                className="transition-all hover:underline"
              >
                <span className="underline">
                  {comment.authorUsername ?? "User"}
                </span>
                {" • "}
                <span className="text-xs font-light">
                  {formatTimeAgo(
                    typeof comment.createdAt === "string"
                      ? new Date(comment.createdAt)
                      : comment.createdAt,
                  )}
                </span>
              </Link>
            </div>
            {renderCommentContent(comment, comment.isDeleted ?? false)}
            {comment.image && !comment.isDeleted && (
              <div className="mt-2">
                <MediaPlayer
                  imageProps={{
                    alt: "Comment attachment",
                    width: 250,
                    height: 150,
                    className: "w-full rounded-md object-cover",
                  }}
                  videoProps={{
                    className: "md:max-w-[28rem] w-full",
                  }}
                  url={comment.image}
                />
              </div>
            )}
          </div>
          {!comment.isDeleted && renderDropdownMenu(comment)}
        </div>
      </div>

      {/* Replies section */}
      {replies.length > 0 && (
        <div className="border-muted mt-4 ml-18 space-y-3 border-l-2 pl-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleReplies(comment.id)}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            disabled={deleteState.isDeleting || editCommentMutation.isPending}
          >
            {expandedReplies.has(comment.id)
              ? `Hide ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`
              : `Show ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`}
          </Button>
          {expandedReplies.has(comment.id) && (
            <div className="flex flex-col gap-4">
              {replies.reverse().map((reply) => (
                <div key={reply.id} className="flex items-start">
                  <div className="mr-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={reply.authorAvatar ?? ""}
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <AvatarFallback>
                        <div className="bg-background border-primary flex h-full w-full items-center justify-center rounded-full border-1">
                          <span className="text-foreground text-sm">
                            {reply.authorUsername?.slice(0, 1)}
                          </span>
                        </div>
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex w-full justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-[#949BA8]">
                        <Link
                          href={`/u/${reply.authorId}`}
                          className="transition-all hover:underline"
                        >
                          <span className="underline">
                            {reply.authorUsername ?? "User"}
                          </span>
                          {" • "}
                          <span className="text-sm font-light">
                            {formatTimeAgo(
                              typeof reply.createdAt === "string"
                                ? new Date(reply.createdAt)
                                : reply.createdAt,
                            )}
                          </span>
                        </Link>
                      </div>
                      <div className="text-accent-foreground text-sm font-medium">
                        {renderCommentContent(
                          reply,
                          reply.isDeleted ?? false,
                          true,
                        )}
                      </div>
                      {reply.image && !reply.isDeleted && (
                        <div className="mt-2">
                          <MediaPlayer
                            url={reply.image}
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
                    {!reply.isDeleted && renderDropdownMenu(reply, true)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog open={deleteState.isOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
              <Trash className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg font-semibold">
                Delete {deleteState.isReply ? "Reply" : "Comment"}
              </DialogTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                This action cannot be undone. The comment will be permanently
                removed.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={deleteState.isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteState.isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              {deleteState.isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

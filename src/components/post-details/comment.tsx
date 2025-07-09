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
import { EllipsisVerticalIcon } from "lucide-react";
import type { User } from "@/lib/userStore";
import type { Dispatch, SetStateAction } from "react";

export default function Comment({
  comment,
  replies,
  handleReply,
  user,
  setOptimisticCommentsCount,
  toggleReplies,
  expandedReplies,
  deleteCommentMutation,
}: {
  comment: {
    users?: {
      id: string;
      username: string;
      avatar?: string;
    };
    comments: {
      id: string;
      content: string;
      createdAt: Date | string;
      image?: string;
      isAReply?: boolean;
      replyTo?: string;
    };
  };
  replies: Array<{
    comments: {
      id: string;
      content: string;
      createdAt: Date | string;
      image?: string;
      isAReply?: boolean;
      replyTo?: string;
    };
    users?: {
      id: string;
      username: string;
      avatar?: string;
    };
  }>;
  user: User;
  setOptimisticCommentsCount: Dispatch<SetStateAction<number>>;
  handleReply: (commentId: string, username: string) => void;
  toggleReplies: (commentId: string) => void;
  expandedReplies: Set<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteCommentMutation: any;
}) {
  return (
    <div>
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
                    typeof comment.comments.createdAt === "string"
                      ? new Date(comment.comments.createdAt)
                      : comment.comments.createdAt,
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
                    className: "w-full rounded-md object-cover",
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
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                    void (await deleteCommentMutation.mutateAsync({
                      commentId: comment.comments.id,
                    }));
                    setOptimisticCommentsCount((prev) => prev - 1);
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
            onClick={() => toggleReplies(comment.comments.id)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            {expandedReplies.has(comment.comments.id)
              ? `Hide ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`
              : `Show ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`}
          </Button>
          {expandedReplies.has(comment.comments.id) && (
            <div className="flex flex-col gap-4">
              {replies.reverse().map((reply) => (
                <div key={reply.comments.id} className="flex items-start">
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
                            {reply.users?.username.slice(0, 1)}
                          </span>
                        </div>
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex w-full justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#949BA8]">
                        <Link href={`/u/${reply.users?.id}`}>
                          <span className="underline">
                            {reply.users?.username ?? "User"}
                          </span>
                          {" • "}
                          <span className="text-xs font-light">
                            {formatTimeAgo(
                              typeof reply.comments.createdAt === "string"
                                ? new Date(reply.comments.createdAt)
                                : reply.comments.createdAt,
                            )}
                          </span>
                        </Link>
                      </div>
                      <div className="text-accent-foreground text-sm font-medium">
                        {!reply.comments.content.includes("@") ? (
                          <p>{reply.comments.content}</p>
                        ) : (
                          <p>
                            {reply.comments.content
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            handleReply(
                              comment.comments.id,
                              reply.users?.username ?? "User",
                            );
                          }}
                        >
                          Reply
                        </DropdownMenuItem>
                        {user.id === reply.users?.id && (
                          <DropdownMenuItem
                            onClick={async () => {
                              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                              void (await deleteCommentMutation.mutateAsync({
                                commentId: reply.comments.id,
                              }));
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
}

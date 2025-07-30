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
import { EllipsisVerticalIcon } from "lucide-react";
import type { User } from "@/lib/userStore";

type CommnetProps = {
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
  };
};

export default function Comment({
  comment,
  replies,
  handleReply,
  user,
  toggleReplies,
  expandedReplies,
  deleteCommentMutation,
}: CommnetProps) {
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
              <Link href={`/u/${comment.authorId}`}>
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
            <div
              className={`text-accent-foreground ${comment.isDeleted ? "italic" : ""}`}
            >
              {!comment.content.includes("@") ? (
                <p>{comment.content}</p>
              ) : (
                <p>
                  {comment.content.split(" ").map((x: string, index: number) =>
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
            {comment.image && (
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => {
                  handleReply(comment.id, comment.authorUsername ?? "User");
                }}
              >
                Reply
              </DropdownMenuItem>
              {user.id === comment.authorId && (
                <DropdownMenuItem
                  onClick={async () => {
                    void (await deleteCommentMutation.mutateAsync({
                      commentId: comment.id,
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
      {/* Replies section */}
      {replies.length > 0 && (
        <div className="border-muted mt-1 ml-18 space-y-3 border-l-2 pl-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleReplies(comment.id)}
            className="text-muted-foreground hover:text-foreground text-xs"
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
                        <Link href={`/u/${reply.authorId}`}>
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
                        {!reply.content.includes("@") ? (
                          <p>{reply.content}</p>
                        ) : (
                          <p>
                            {reply.content
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
                      {reply.image && (
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onSelect={() => {
                            handleReply(
                              comment.id,
                              reply.authorUsername ?? "User",
                            );
                          }}
                        >
                          Reply
                        </DropdownMenuItem>
                        {user.id === reply.authorId && (
                          <DropdownMenuItem
                            onClick={async () => {
                              void (await deleteCommentMutation.mutateAsync({
                                commentId: reply.id,
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

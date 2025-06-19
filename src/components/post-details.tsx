import { Card } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import useGetUser from "@/lib/use-get-user";

export function PostDetails({
  author,
  title,
  content,
  image,
  createdAt,
  likes = [],
  disLikes = [],
  topic = "General",
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

  // const {
  //   data: comments,
  //   isLoading: isCommentsLoading,
  //   isPending,
  //   refetch: refetchComments,
  // } = useQuery({
  //   queryKey: ["get-comments", postID],
  //   queryFn: async () => {
  //     const { data } = await axios.get(`/api/post/get-comments?id=${postID}`);

  //     if (data.success) {
  //       return data.data;
  //     }
  //   },
  // });

  // async function addComment() {
  //   try {
  //     setCommentLoading(true);
  //     const { data } = await axios.post("/api/post/add-comment", {
  //       content: newComment,
  //       post: postID,
  //       author: author._id,
  //     });

  //     if (data.success) {
  //       setNewComment("");
  //       toast({
  //         title: "Comment added",
  //         description: "Your comment has been added.",
  //         variant: "default",
  //       });
  //       refetchComments();

  //       setCommentLoading(false);
  //     }
  //   } catch (error) {
  //     console.log(error);

  //     setCommentLoading(false);
  //   }
  // }

  // async function copyUrlToClipboard() {
  //   try {
  //     await navigator.clipboard.writeText(window.location.href);
  //     toast({
  //       title: "Copied to clipboard",
  //       description: "The URL has been copied to your clipboard.",
  //       variant: "default",
  //     });
  //   } catch (err) {
  //     console.error("Failed to copy: ", err);
  //   }
  // }

  // async function likePost() {
  //   const newLikeCount = hasLiked ? optimisticLikes - 1 : optimisticLikes + 1;

  //   try {
  //     setOptimisticLikes(newLikeCount);
  //     setHasLiked(!hasLiked);

  //     const endpoint = hasLiked
  //       ? "/api/post/unlike-post"
  //       : "/api/post/like-post";
  //     await axios.post(endpoint, {
  //       post: postID,
  //       user: user._id,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     setOptimisticLikes(hasLiked ? optimisticLikes + 1 : optimisticLikes - 1);
  //     setHasLiked(hasLiked);
  //   }
  // }

  // async function dislikePost() {
  //   const newDislikeCount = hasDisliked
  //     ? optimisticDislikes - 1
  //     : optimisticDislikes + 1;

  //   try {
  //     setOptimisticDislikes(newDislikeCount);
  //     setHasDisliked(!hasDisliked);

  //     const endpoint = hasDisliked
  //       ? "/api/post/undislike-post"
  //       : "/api/post/dislike-post";
  //     await axios.post(endpoint, {
  //       post: postID,
  //       user: user._id,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     setOptimisticDislikes(
  //       hasDisliked ? optimisticDislikes + 1 : optimisticDislikes - 1,
  //     );
  //     setHasDisliked(hasDisliked);
  //   }
  // }

  return (
    <Card className="flex h-[calc(100vh+15rem)] w-full items-start px-0 py-0 pb-12">
      <div className="bg-background text-foreground flex w-full items-center justify-center">
        <div className="h-screen w-screen max-w-7xl px-2 py-3 sm:px-6 lg:px-8">
          <div className="bg-card overflow-hidden rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row">
              <div className="p-6 sm:w-1/2">
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
                    <div className="text-lg font-bold">{author.username}</div>
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
                    <Button variant="ghost" size="icon">
                      {/* onClick={likePost} */}
                      {hasLiked ? <HeartIconFilled /> : <HeartIcon />}
                      <span className="sr-only">Like</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      {/* onClick={dislikePost} */}
                      {hasDisliked ? (
                        <ThumbsDownIconFilled />
                      ) : (
                        <ThumbsDownIcon />
                      )}
                      <span className="sr-only">Dislike</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      {/* onClick={copyUrlToClipboard} */}

                      <Share2 />
                      <span className="sr-only">Share</span>
                    </Button>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {optimisticLikes} Likes • {optimisticDislikes} Dislikes •{" "}
                    {/* {comments?.length ?? 0} Comments */}0 Comments
                  </div>
                </div>
              </div>
              <div className={`bg-muted w-full rounded-lg px-4 py-6`}>
                <h2 className="mb-4 text-lg font-semibold">Comments</h2>
                <div className="space-y-4">
                  <div className="flex w-full items-center gap-1">
                    <Input
                      type="text"
                      className="w-full rounded-md bg-black py-5 text-white"
                      placeholder="Add a comment..."
                      onChange={(e) => setNewComment(e.target.value)}
                      value={newComment}
                    />
                    <Button
                      className="w-[30%] py-4"
                      // onClick={addComment}
                      disabled={commentLoading}
                    >
                      {commentLoading ? "Please Wait" : "Submit"}
                    </Button>
                  </div>
                  {/* {isCommentsLoading || isPending ? (
                    <h1>Loading...</h1>
                  ) : (
                    comments
                      .reverse()
                      .map(
                        (comment: {
                          _id: string;
                          author: { avatar: string; username: string };
                          content: string;
                        }) => (
                          <div className="flex items-center" key={comment._id}>
                            <div className="mr-4">
                              <Image
                                src={comment.author.avatar}
                                alt="Avatar"
                                width={56}
                                height={56}
                                className="rounded-full"
                              />
                            </div>
                            <div>
                              <div className="text-lg font-extrabold">
                                {comment.author.username}
                              </div>
                              <div className="font-medium text-[#949BA8]">
                                {comment.content}
                              </div>
                            </div>
                          </div>
                        ),
                      )
                  )} */}
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

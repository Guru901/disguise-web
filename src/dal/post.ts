import type { TCommentAddSchema, TUploadPostSchema } from "@/lib/schemas";
import { db } from "@/server/db";
import {
  commentSchema,
  notificationSchema,
  postSchema,
  userSchema,
} from "@/server/db/schema";
import { and, desc, eq, sql, or, ilike, inArray, not } from "drizzle-orm";
import { getUserDataById } from "./user";

async function getFeed(page: number, limit: number, loggedInUserId: string) {
  try {
    const results = await db
      .select()
      .from(postSchema)
      .where(
        and(
          eq(postSchema.isPublic, true),
          or(eq(postSchema.topic, "General"), eq(postSchema.topic, "")),
          or(
            eq(userSchema.accountType, "public"),
            and(
              eq(userSchema.accountType, "private"),
              sql`${loggedInUserId} = ANY (${userSchema.friends})`,
            ),
            eq(postSchema.createdBy, loggedInUserId),
          ),
          not(
            sql`${postSchema.createdBy}::text = ANY (${userSchema.blockedUsers})`,
          ),
          not(sql`${loggedInUserId}::text = ANY (${userSchema.blockedUsers})`),
        ),
      )
      .leftJoin(userSchema, and(eq(userSchema.id, postSchema.createdBy)))
      .orderBy(desc(postSchema.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return results.map((row) => ({
      ...row.posts,
      createdBy: row.users,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getLoggedInUserPublicPost(userId: string) {
  try {
    const results = await db
      .select()
      .from(postSchema)
      .where(
        and(eq(postSchema.createdBy, userId), eq(postSchema.isPublic, true)),
      )
      .orderBy(desc(postSchema.createdAt));

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getPostById(postId: string) {
  const results = await db
    .select()
    .from(postSchema)
    .where(eq(postSchema.id, postId));

  const post = results[0];
  if (!post) return null;

  const userResults = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema.id, post.createdBy!));

  const user = userResults[0] ?? null;
  user!.password = "";

  return {
    ...post,
    createdBy: user,
  };
}

async function createPost(input: TUploadPostSchema) {
  let post: {
    id: string;
    title: string;
  }[] = [];

  await db.transaction(async (trx) => {
    post = await trx
      .insert(postSchema)
      .values({
        title: input.title,
        content: input.content ?? null,
        image: input.image ?? null,
        isPublic: input.isPublic,
        topic: input.topic ?? "",
        createdBy: input.author,
        likes: [],
        disLikes: [],
      })
      .returning({ id: postSchema.id, title: postSchema.title });

    const author = await trx
      .update(userSchema)
      .set({
        posts: sql`array_append
        (
        ${userSchema.posts},
        ${post[0]!.id}
        )`,
      })
      .where(eq(userSchema.id, input.author))
      .returning({
        friends: userSchema.friends,
        username: userSchema.username,
      });

    const friendsToNotify = await trx
      .select({
        id: userSchema.id,
        username: userSchema.username,
        receiveNotificationsForFriendRequest:
          userSchema.receiveNotificationsForFriendRequest,
      })
      .from(userSchema)
      .where(
        and(
          inArray(userSchema.id, author[0]?.friends ?? []),
          eq(userSchema.receiveNotificationsForFriendPost, true),
        ),
      );

    await Promise.all(
      friendsToNotify
        .filter((friend) => friend.receiveNotificationsForFriendRequest)
        .map(async (friend) => {
          await trx.insert(notificationSchema).values({
            content: `${author[0]?.username} uploaded a new post`,
            message: `${author[0]?.username} uploaded a new post about '${post[0]?.title}'`,
            byUser: input.author,
            post: post[0]!.id,
            user: friend.id,
            type: "upload",
          });
        }),
    );
  });

  if (Array.isArray(post) && post.length > 0 && post[0]?.id) {
    return {
      success: true,
      message: "Post created successfully",
      postId: post[0].id,
    };
  } else {
    return {
      success: false,
      message: "Failed to create post",
    };
  }
}

async function likePost(userId: string, postId: string) {
  try {
    const post = await db
      .update(postSchema)
      .set({
        likes: sql`array_append
        (
        ${postSchema.likes},
        ${userId}
        )`,
      })
      .where(eq(postSchema.id, postId))
      .returning({
        createdBy: postSchema.createdBy,
        title: postSchema.title,
      });

    const { user } = await getUserDataById(userId);
    const { user: createdByUser } = await getUserDataById(post[0]?.createdBy!);

    if (createdByUser?.receiveNotificationsForLike) {
      await db.insert(notificationSchema).values({
        type: "like",
        content: `${user?.username} liked your post`,
        message: `${user?.username} liked your post about '${post[0]?.title}'`,
        byUser: userId,
        post: postId,
        user: post[0]?.createdBy,
      });
    }

    return {
      success: true,
      message: "Post Liked successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to like post",
    };
  }
}

async function unlikePost(userId: string, postId: string) {
  try {
    await db
      .update(postSchema)
      .set({
        likes: sql`array_remove
        (
        ${postSchema.likes},
        ${userId}
        )`,
      })
      .where(eq(postSchema.id, postId));

    return {
      success: true,
      message: "Post Unliked successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to unlike post",
    };
  }
}

async function likeAndUndislikePost(userId: string, postId: string) {
  try {
    await db
      .update(postSchema)
      .set({
        likes: sql`array_append
        (
        ${postSchema.likes},
        ${userId}
        )`,
        disLikes: sql`array_remove
        (
        ${postSchema.disLikes},
        ${userId}
        )`,
      })
      .where(eq(postSchema.id, postId));

    return {
      success: true,
      message: "Post liked and undisliked successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to like and undislike post",
    };
  }
}

async function dislikePost(userId: string, postId: string) {
  try {
    await db
      .update(postSchema)
      .set({
        disLikes: sql`array_append
        (
        ${postSchema.disLikes},
        ${userId}
        )`,
      })
      .where(eq(postSchema.id, postId));

    return {
      success: true,
      message: "Post Disliked successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to dislike post",
    };
  }
}

async function undislikePost(userId: string, postId: string) {
  try {
    await db
      .update(postSchema)
      .set({
        disLikes: sql`array_remove
        (
        ${postSchema.disLikes},
        ${userId}
        )`,
      })
      .where(eq(postSchema.id, postId));

    return {
      success: true,
      message: "Post Undisliked successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to undislike post",
    };
  }
}

async function dislikeAndUnlikePost(userId: string, postId: string) {
  try {
    await db
      .update(postSchema)
      .set({
        disLikes: sql`array_append
        (
        ${postSchema.disLikes},
        ${userId}
        )`,
        likes: sql`array_remove
        (
        ${postSchema.likes},
        ${userId}
        )`,
      })
      .where(eq(postSchema.id, postId));

    return {
      success: true,
      message: "Post disliked and unliked successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to dislike and unlike post",
    };
  }
}

async function getCommentsByPostId(postId: string) {
  try {
    const results = await db
      .select({
        id: commentSchema.id,
        content: commentSchema.content,
        post: commentSchema.post,
        image: commentSchema.image,
        isAReply: commentSchema.isAReply,
        replyTo: commentSchema.replyTo,
        replies: commentSchema.replies,
        authorUsername: userSchema.username,
        authorAvatar: userSchema.avatar,
        authorId: userSchema.id,
        isDeleted: commentSchema.isDeleted,
        createdAt: commentSchema.createdAt,
      })
      .from(commentSchema)
      .where(eq(commentSchema.post, postId))
      .orderBy(desc(commentSchema.createdAt))
      .leftJoin(userSchema, eq(userSchema.id, commentSchema.author));

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Helper function to extract usernames from @ mentions
async function extractMentionsAndNotify(
  content: string,
  commentAuthorId: string,
  postId: string,
) {
  // Regex to match @username pattern - supports alphanumeric and underscore
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions = content.match(mentionRegex);

  if (!mentions) return;

  // Get unique usernames (remove @ symbol)
  const usernames = [...new Set(mentions.map((mention) => mention.slice(1)))];

  // Get comment author info for notification
  const { user: authorUser } = await getUserDataById(commentAuthorId);

  // Find each mentioned user and create notifications
  for (const username of usernames) {
    try {
      // Find user by username (case-insensitive)
      const mentionedUser = await db
        .select()
        .from(userSchema)
        .where(ilike(userSchema.username, username))
        .limit(1)
        .then((res) => res[0]);
      mentionedUser!.password = "";

      if (mentionedUser && mentionedUser.id !== commentAuthorId) {
        // Get post info for better notification message
        const post = await db
          .select({ title: postSchema.title })
          .from(postSchema)
          .where(eq(postSchema.id, postId))
          .limit(1)
          .then((res) => res[0]);

        if (mentionedUser.receiveNotificationsForMention) {
          // Create notification for mentioned user
          await db.insert(notificationSchema).values({
            type: "mention",
            content: `${authorUser?.username} mentioned you in a comment`,
            message: `${authorUser?.username} mentioned you in a comment on '${post?.title ?? "a post"}'`,
            byUser: commentAuthorId,
            post: postId,
            user: mentionedUser.id,
          });
        }
      }
    } catch (error) {
      console.error(
        `Error creating mention notification for ${username}:`,
        error,
      );
    }
  }
}

async function addComment(input: TCommentAddSchema, userId: string) {
  let comment;

  if (input.isAReply) {
    comment = await db
      .insert(commentSchema)
      .values({
        content: input.content,
        post: input.postId,
        author: userId,
        isAReply: input.isAReply,
        replyTo: input.replyTo,
        image: input.image,
      })
      .returning({ id: commentSchema.id });

    await db
      .update(commentSchema)
      .set({
        replies: sql`array_append
        (
        ${commentSchema.replies},
        ${userId}
        )`,
      })
      .where(eq(commentSchema.id, input.replyTo));
  } else {
    comment = await db
      .insert(commentSchema)
      .values({
        content: input.content,
        post: input.postId,
        author: userId,
        image: input.image,
      })
      .returning({ id: commentSchema.id });
  }

  await db
    .update(postSchema)
    .set({
      commentsCount: sql`comments_count + 1`,
    })
    .where(eq(postSchema.id, input.postId));

  // Get post info for notifications
  const post = await db
    .select()
    .from(postSchema)
    .where(eq(postSchema.id, input.postId))
    .limit(1)
    .then((res) => res[0]);

  // Get comment author info for notifications
  const { user: authorUser } = await getUserDataById(userId);
  const { user: postAuthor } = await getUserDataById(post?.createdBy!);

  // Create notification for post author (if commenter is not the post author)
  if (
    post?.createdBy &&
    post.createdBy !== userId &&
    postAuthor?.receiveNotificationsForComment
  ) {
    await db.insert(notificationSchema).values({
      type: "comment",
      content: `${authorUser?.username} commented on your post`,
      message: `${authorUser?.username} commented on your post about '${post.title}'`,
      byUser: userId,
      post: input.postId,
      user: post.createdBy,
    });
  }

  // Extract mentions and create notifications
  await extractMentionsAndNotify(input.content, userId, input.postId);

  return {
    success: true,
    message: "Comment added successfully",
    commentId: comment[0]!.id,
  };
}

async function getLoggedInUserLikedPosts(userId: string) {
  try {
    const results = await db
      .select()
      .from(postSchema)
      .where(
        sql`${userId}
        = ANY(
        ${postSchema.likes}
        )`,
      )
      .orderBy(desc(postSchema.createdAt));

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getDislikedPostsByUserId(userId: string) {
  try {
    const results = await db
      .select()
      .from(postSchema)
      .where(
        sql`${userId}
        = ANY(
        ${postSchema.disLikes}
        )`,
      )
      .orderBy(desc(postSchema.createdAt));

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getLoggedInUserPrivatePosts(userId: string) {
  try {
    const results = await db
      .select()
      .from(postSchema)
      .where(
        and(eq(postSchema.createdBy, userId), eq(postSchema.isPublic, false)),
      );

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getCommentsByUserId(userId: string) {
  try {
    const results = await db
      .select()
      .from(commentSchema)
      .where(eq(commentSchema.author, userId));

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getFriendsByUserId(userId: string) {
  const user = await db
    .select({
      friends: userSchema.friends,
    })
    .from(userSchema)
    .where(eq(userSchema.id, userId))
    .limit(1)
    .then((res) => res[0]);

  if (!user) {
    return {
      friends: [],
    };
  }

  const friends =
    user.friends && user.friends.length > 0
      ? await db
          .select({
            id: userSchema.id,
            username: userSchema.username,
            avatar: userSchema.avatar,
          })
          .from(userSchema)
          .where(inArray(userSchema.id, user.friends))
      : [];

  return {
    friends,
  };
}

async function deleteComment(commentId: string, userId: string) {
  try {
    const comment = await db
      .select()
      .from(commentSchema)
      .where(
        and(eq(commentSchema.id, commentId), eq(commentSchema.author, userId)),
      )
      .then((res) => res[0]);

    if (comment?.isAReply) {
      const comment = await db
        .delete(commentSchema)
        .where(
          and(
            eq(commentSchema.id, commentId),
            eq(commentSchema.author, userId),
          ),
        )
        .returning({ replyTo: commentSchema.replyTo, id: commentSchema.id })
        .then((res) => res[0]);

      await db
        .update(commentSchema)
        .set({
          replies: sql`array_remove(${commentSchema.replies},${comment?.id})`,
        })
        .where(eq(commentSchema.id, String(comment?.replyTo)))
        .returning({ replyTo: commentSchema.replyTo })
        .then((res) => res[0]);
    } else {
      if (comment?.replies && comment?.replies?.length > 0) {
        await db
          .update(commentSchema)
          .set({
            content: "Comment deleted by the author",
            isDeleted: true,
          })
          .where(
            and(
              eq(commentSchema.id, commentId),
              eq(commentSchema.author, userId),
            ),
          )
          .then((res) => res[0]);
      } else {
        await db
          .delete(commentSchema)
          .where(
            and(
              eq(commentSchema.id, commentId),
              eq(commentSchema.author, userId),
            ),
          )
          .returning({ post: commentSchema.post });
      }
    }

    await db
      .update(postSchema)
      .set({
        commentsCount: sql`comments_count - 1`,
      })
      .where(eq(postSchema.id, String(comment?.post)));

    return {
      success: true,
      message: "Comment deleted successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to delete comment",
    };
  }
}

async function getUserPublicPostsByUserId(userId: string) {
  try {
    const results = await db
      .select()
      .from(postSchema)
      .where(
        and(eq(postSchema.createdBy, userId), eq(postSchema.isPublic, true)),
      )
      .orderBy(desc(postSchema.createdAt));

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getUserlikedPostsByUserId(
  userId: string,
  loggedInUserId: string,
) {
  try {
    const isFriend = await db
      .select()
      .from(userSchema)
      .where(
        and(
          eq(userSchema.id, loggedInUserId),
          sql`${userId}
          = ANY(
          ${userSchema.friends}
          )`,
        ),
      )
      .limit(1);

    if (!isFriend) return [];

    const results = await db
      .select()
      .from(postSchema)
      .where(
        and(sql`${userId}
        = ANY(
        ${postSchema.likes}
        )`),
      )
      .orderBy(desc(postSchema.createdAt));

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getUserPrivatePostsByUserId(
  userId: string,
  loggedInUserId: string,
) {
  try {
    const isFriend = await db
      .select()
      .from(userSchema)
      .where(
        and(
          eq(userSchema.id, loggedInUserId),
          sql`${userId}
          = ANY(
          ${userSchema.friends}
          )`,
        ),
      )
      .limit(1);

    if (!isFriend) return [];

    const results = await db
      .select()
      .from(postSchema)
      .where(
        and(
          sql`${userId}
          = ANY(
          ${postSchema.createdBy}
          )`,
          eq(postSchema.isPublic, false),
        ),
      )
      .orderBy(desc(postSchema.createdAt));

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getTopicSpecificFeed(topicName: string) {
  try {
    const results = await db
      .select()
      .from(postSchema)
      .where(
        and(eq(postSchema.isPublic, true), eq(postSchema.topic, topicName)),
      )
      .leftJoin(userSchema, eq(userSchema.id, postSchema.createdBy))
      .orderBy(desc(postSchema.createdAt));

    return results.map((row) => ({
      ...row.posts,
      createdBy: row.users,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function deletePostById(postId: string, userId: string) {
  try {
    return await db.transaction(async (tx) => {
      await tx.delete(commentSchema).where(eq(commentSchema.post, postId));
      await tx
        .delete(notificationSchema)
        .where(eq(notificationSchema.post, postId));

      await tx
        .update(userSchema)
        .set({
          posts: sql`array_remove(${userSchema.posts}, ${postId})`,
        })
        .where(eq(userSchema.id, userId));

      const deletedPost = await tx
        .delete(postSchema)
        .where(and(eq(postSchema.id, postId), eq(postSchema.createdBy, userId)))
        .returning();

      if (deletedPost.length === 0) {
        throw new Error("Post not found or unauthorized");
      }

      return {
        success: true,
        message: "Post deleted successfully",
      };
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return {
      success: false,
      message: "Failed to delete post",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export {
  getCommentsByPostId,
  getFeed,
  getPostById,
  getCommentsByUserId,
  getLoggedInUserLikedPosts,
  getLoggedInUserPrivatePosts,
  getTopicSpecificFeed,
  getUserPrivatePostsByUserId,
  getUserPublicPostsByUserId,
  getUserlikedPostsByUserId,
  getUserDataById,
  getDislikedPostsByUserId,
  getFriendsByUserId,
  getLoggedInUserPublicPost,
  createPost,
  unlikePost,
  dislikeAndUnlikePost,
  likePost,
  likeAndUndislikePost,
  deleteComment,
  addComment,
  dislikePost,
  undislikePost,
  deletePostById,
};

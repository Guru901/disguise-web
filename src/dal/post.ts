import type { TCommentAddSchema, TUploadPostSchema } from "@/lib/schemas";
import { db } from "@/server/db";
import { commentSchema, postSchema, userSchema } from "@/server/db/schema";
import { and, desc, eq, sql, or } from "drizzle-orm";

export async function getFeed() {
  try {
    const results = await db
      .select()
      .from(postSchema)
      .where(
        and(
          eq(postSchema.isPublic, true),
          or(eq(postSchema.topic, "General"), eq(postSchema.topic, "")),
        ),
      )
      .leftJoin(userSchema, and(eq(userSchema.id, postSchema.createdBy)))
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

export async function getLoggedInUserPublicPost(userId: string) {
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

export async function getPostById(postId: string) {
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

  return {
    ...post,
    createdBy: user,
  };
}

export async function createPost(input: TUploadPostSchema) {
  const post = await db
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
    .returning({ id: postSchema.id });

  await db
    .update(userSchema)
    .set({
      posts: sql`array_append
      (
      ${userSchema.posts},
      ${post[0]!.id}
      )`,
    })
    .where(eq(userSchema.id, input.author));

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

export async function likePost(userId: string, postId: string) {
  try {
    await db
      .update(postSchema)
      .set({
        likes: sql`array_append
        (
        ${postSchema.likes},
        ${userId}
        )`,
      })
      .where(eq(postSchema.id, postId));

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

export async function unlikePost(userId: string, postId: string) {
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

export async function likeAndUndislikePost(userId: string, postId: string) {
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

export async function dislikePost(userId: string, postId: string) {
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

export async function undislikePost(userId: string, postId: string) {
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

export async function dislikeAndUnlikePost(userId: string, postId: string) {
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

export async function getCommentsByPostId(postId: string) {
  try {
    const results = await db
      .select()
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

export async function addComment(input: TCommentAddSchema, userId: string) {
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
      commentsCount: sql`comments_count
      + 1`,
    })
    .where(eq(postSchema.id, input.postId));

  return {
    success: true,
    message: "Comment added successfully",
    commentId: comment[0]!.id,
  };
}

export async function getLoggedInUserLikedPosts(userId: string) {
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

export async function getLoggedInUserPrivatePosts(userId: string) {
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

export async function deleteComment(commentId: string, userId: string) {
  try {
    const comment = await db
      .delete(commentSchema)
      .where(
        and(eq(commentSchema.id, commentId), eq(commentSchema.author, userId)),
      )
      .returning({ post: commentSchema.post });

    await db
      .update(postSchema)
      .set({
        commentsCount: sql`comments_count
        - 1`,
      })
      .where(eq(postSchema.id, comment[0]!.post!));

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

export async function getUserPublicPostsByUserId(userId: string) {
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

export async function getUserlikedPostsByUserId(
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

export async function getUserPrivatePostsByUserId(
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

export async function getTopicSpecificFeed(topicName: string) {
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

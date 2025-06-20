import { uploadPostSchema } from "@/lib/schemas";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { commentSchema, postSchema, userSchema } from "@/server/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

export const postRouter = createTRPCRouter({
  getFeed: publicProcedure.query(async ({ ctx }) => {
    const results = await ctx.db
      .select()
      .from(postSchema)
      .where(eq(postSchema.isPublic, true))
      .leftJoin(userSchema, eq(userSchema.id, postSchema.createdBy))
      .orderBy(desc(postSchema.createdAt));

    return results.map((row) => ({
      ...row.posts,
      createdBy: row.users,
    }));
  }),

  getUserPosts: protectedProcedure.query(async ({ ctx }) => {
    const results = await ctx.db
      .select()
      .from(postSchema)
      .where(eq(postSchema.createdBy, ctx.userId))
      .orderBy(desc(postSchema.createdAt));

    return results;
  }),

  getPostById: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const results = await ctx.db
        .select()
        .from(postSchema)
        .where(eq(postSchema.id, input.postId));

      const post = results[0];
      if (!post) return null;

      const userResults = await ctx.db
        .select()
        .from(userSchema)
        .where(eq(userSchema.id, post.createdBy!));

      const user = userResults[0] ?? null;

      return {
        ...post,
        createdBy: user,
      };
    }),

  createPost: protectedProcedure
    .input(uploadPostSchema)
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.db
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

      await ctx.db
        .update(userSchema)
        .set({
          posts: sql`array_append(${userSchema.posts}, ${post[0]!.id})`,
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
    }),

  likePost: protectedProcedure
    .input(z.object({ post: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(postSchema)
        .set({
          likes: sql`array_append(${postSchema.likes}, ${ctx.userId})`,
        })
        .where(eq(postSchema.id, input.post));

      return {
        success: true,
        message: "Post Liked successfully",
      };
    }),
  unlikePost: protectedProcedure
    .input(z.object({ post: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(postSchema)
        .set({
          likes: sql`array_remove(${postSchema.likes}, ${ctx.userId})`,
        })
        .where(eq(postSchema.id, input.post));

      return {
        success: true,
        message: "Post Unliked successfully",
      };
    }),
  likeAndUndislikePost: protectedProcedure
    .input(z.object({ post: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(postSchema)
        .set({
          likes: sql`array_append(${postSchema.likes}, ${ctx.userId})`,
          disLikes: sql`array_remove(${postSchema.disLikes}, ${ctx.userId})`,
        })
        .where(eq(postSchema.id, input.post));

      return {
        success: true,
        message: "Post liked and undisliked successfully",
      };
    }),
  dislikePost: protectedProcedure
    .input(z.object({ post: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(postSchema)
        .set({
          disLikes: sql`array_append(${postSchema.disLikes}, ${ctx.userId})`,
        })
        .where(eq(postSchema.id, input.post));

      return {
        success: true,
        message: "Post Disliked successfully",
      };
    }),
  undislikePost: protectedProcedure
    .input(z.object({ post: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(postSchema)
        .set({
          disLikes: sql`array_remove(${postSchema.disLikes}, ${ctx.userId})`,
        })
        .where(eq(postSchema.id, input.post));

      return {
        success: true,
        message: "Post Undisliked successfully",
      };
    }),
  dislikeAndUnlikePost: protectedProcedure
    .input(z.object({ post: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(postSchema)
        .set({
          disLikes: sql`array_append(${postSchema.disLikes}, ${ctx.userId})`,
          likes: sql`array_remove(${postSchema.likes}, ${ctx.userId})`,
        })
        .where(eq(postSchema.id, input.post));

      return {
        success: true,
        message: "Post disliked and unliked successfully",
      };
    }),

  getCommentsByPostId: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input, ctx }) => {
      const results = await ctx.db
        .select()
        .from(commentSchema)
        .where(eq(commentSchema.post, input.postId))
        .orderBy(desc(commentSchema.createdAt))
        .leftJoin(userSchema, eq(userSchema.id, commentSchema.author));

      return results;
    }),

  addComments: protectedProcedure
    .input(z.object({ content: z.string(), postId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const comment = await ctx.db
        .insert(commentSchema)
        .values({
          content: input.content,
          post: input.postId,
          author: ctx.userId,
        })
        .returning({ id: commentSchema.id });

      await ctx.db
        .update(postSchema)
        .set({
          commentsCount: sql`comments_count + 1`,
        })
        .where(eq(postSchema.id, input.postId));

      return {
        success: true,
        message: "Comment added successfully",
        commentId: comment[0]!.id,
      };
    }),
});

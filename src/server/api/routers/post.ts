import { uploadPostSchema } from "@/lib/schemas";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { postSchema, userSchema } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

export const postRouter = createTRPCRouter({
  getUserPosts: publicProcedure.query(async ({ ctx }) => {
    const results = await ctx.db
      .select()
      .from(postSchema)
      .where(eq(postSchema.createdBy, "4f972bc7-9347-474b-bb09-90458c9cf46f"))
      .leftJoin(userSchema, eq(userSchema.id, postSchema.createdBy));

    return results.map((row) => ({
      ...row.posts,
      createdBy: row.users,
    }));
  }),

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

  createPost: publicProcedure
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
});

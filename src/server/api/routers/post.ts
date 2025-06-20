import { uploadPostSchema } from "@/lib/schemas";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { postSchema, userSchema } from "@/server/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { env } from "@/env";

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

  getUserPosts: publicProcedure.query(async ({ ctx }) => {
    const cookie = await cookies();
    const token = cookie.get("token")?.value;

    const decoded = jwt.verify(token!, env.JWT_SECRET) as {
      id: string;
    };

    const results = await ctx.db
      .select()
      .from(postSchema)
      .where(eq(postSchema.createdBy, decoded.id))
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
});

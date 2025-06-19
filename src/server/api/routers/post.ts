import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { postSchema, userSchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";
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
});

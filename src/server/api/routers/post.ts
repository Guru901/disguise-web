import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { postSchema, userSchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";

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
});

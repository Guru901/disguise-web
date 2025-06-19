import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { loginUser, registerUser } from "@/dal/user";
import { signInSchema, signUpSchema } from "@/lib/schemas";
import { postSchema, userSchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const postRouter = createTRPCRouter({
  getUserPosts: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(postSchema)
      .where(eq(postSchema.createdBy, "4f972bc7-9347-474b-bb09-90458c9cf46f"));
  }),
});

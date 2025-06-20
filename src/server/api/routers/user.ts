import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { userSchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  getUserData: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, ctx.userId))
      .then((rows) => rows[0]); // Because you only want one user

    return {
      user: user,
      success: true,
    };
  }),

  getLoggedInUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, ctx.userId));

    return {
      user: user,
      success: true,
    };
  }),
});

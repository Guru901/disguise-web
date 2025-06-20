import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { userSchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

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

  logOutUser: publicProcedure.mutation(async ({}) => {
    const cookie = await cookies();
    cookie.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 3600 * 1000),
    });
    return {
      success: true,
      message: "User logged out",
    };
  }),
});

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { loginUser, registerUser } from "@/dal/user";
import { signInSchema, signUpSchema } from "@/lib/schemas";
import { userSchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  registerUser: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input }) => {
      return await registerUser(input);
    }),

  loginUser: publicProcedure.input(signInSchema).mutation(async ({ input }) => {
    const data = await loginUser(input);

    return {
      success: data.success,
      message: data.message,
      status: data.status,
      error: data.error,
      data: data.data,
    };
  }),

  getUserData: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.username, "Admin"));
  }),

  getLoggedInUser: publicProcedure.query(async ({ ctx }) => {
    const user = await ctx.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.username, "Admin"));

    return {
      user: user,
      success: true,
    };
  }),
});

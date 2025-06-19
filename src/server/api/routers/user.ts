import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { loginUser, registerUser } from "@/dal/user";
import { userSchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { signInSchema, signUpSchema } from "@/lib/schemas";
import jwt from "jsonwebtoken";
import { env } from "@/env";

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
    const cookie = await cookies();
    const token = cookie.get("token")?.value;

    if (!token) {
      return {
        user: null,
        success: false,
        message: "No token found",
      };
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
    };

    if (!decoded) {
      return {
        user: null,
        success: false,
        message: "Invalid token",
      };
    }

    const user = await ctx.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, decoded.id));

    return {
      user: user,
      success: true,
    };
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

  logOutUser: publicProcedure.mutation(async ({ ctx }) => {
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

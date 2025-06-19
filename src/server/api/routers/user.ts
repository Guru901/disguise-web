import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { loginUser, registerUser } from "@/dal/user";
import { signInSchema, signUpSchema } from "@/lib/schemas";

export const userRouter = createTRPCRouter({
  registerUser: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input }) => {
      return await registerUser(input);
    }),

  loginUser: publicProcedure.input(signInSchema).mutation(async ({ input }) => {
    return await loginUser(input);
  }),
});

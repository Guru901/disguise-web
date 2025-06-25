import * as userDal from "@/dal/user";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import z from "zod";

export const userRouter = createTRPCRouter({
  getUserData: protectedProcedure.query(async ({ ctx }) => {
    const result = await userDal.getUserData(ctx.userId);
    return result;
  }),

  searchUsers: protectedProcedure.input(z.string()).query(async ({ input }) => {
    return await userDal.searchusers(input);
  }),

  getUserDataById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await userDal.getUserDataById(input.id);
    }),
  removeFriendById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await userDal.removeFriendById(ctx.userId, input.id);
    }),

  updateLastOnline: protectedProcedure
    .input(z.string())
    .query(async ({ ctx }) => {
      return await userDal.updateLastOnline(ctx.userId);
    }),

  getLastOnline: protectedProcedure.input(z.string()).query(async ({ ctx }) => {
    return await userDal.getLastOnline(ctx.userId);
  }),
});

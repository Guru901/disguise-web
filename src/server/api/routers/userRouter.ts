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

  getAllUsers: protectedProcedure
    .input(
      z.object({
        searchTerm: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      return await userDal.getAllUsers(input.searchTerm ?? "");
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
});

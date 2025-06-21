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
});

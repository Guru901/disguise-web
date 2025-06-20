import { getUserData } from "@/dal/user";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUserData: protectedProcedure.query(async ({ ctx }) => {
    const result = await getUserData(ctx.userId);
    return result;
  }),
});

import { createCommunitySchema } from "@/lib/schemas";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import * as communityDal from "@/dal/community";

export const communityRouter = createTRPCRouter({
  createCommunity: protectedProcedure
    .input(createCommunitySchema)
    .mutation(async ({ ctx, input }) => {
      return await communityDal.createCommunity(input, ctx.userId);
    }),

  getAllCommunities: protectedProcedure.query(async () => {
    return await communityDal.getAllCommunities();
  }),
});

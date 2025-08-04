import { createCommunitySchema } from "@/lib/schemas";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import * as communityDal from "@/dal/community";
import * as v from "valibot";

export const communityRouter = createTRPCRouter({
  createCommunity: protectedProcedure
    .input(createCommunitySchema)
    .mutation(async ({ ctx, input }) => {
      return await communityDal.createCommunity(input, ctx.userId);
    }),

  getAllCommunities: protectedProcedure.query(async () => {
    return await communityDal.getAllCommunities();
  }),
  getUserJoinedCommunitiesData: protectedProcedure.query(async ({ ctx }) => {
    return await communityDal.getUserJoinedCommunitiesData(ctx.userId);
  }),
  getUserJoinedCommunities: protectedProcedure.query(async ({ ctx }) => {
    return await communityDal.getUserJoinedCommunities(ctx.userId);
  }),
  getCommunity: protectedProcedure
    .input(
      v.object({
        id: v.string(),
      }),
    )
    .query(async ({ input }) => {
      return await communityDal.getCommunity(input.id);
    }),

  getPostsByCommunity: protectedProcedure
    .input(
      v.object({
        communityId: v.string(),
      }),
    )
    .query(async ({ input }) => {
      return await communityDal.getPostsByCommunity(input.communityId);
    }),

  getTrendingCommunities: protectedProcedure.query(async () => {
    return await communityDal.getTrendingCommunities();
  }),

  joinCommunityToggle: protectedProcedure
    .input(
      v.object({
        isJoined: v.boolean(),
        communityId: v.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await communityDal.joinCommunityToggle(
        input.communityId,
        input.isJoined,
        ctx.userId,
      );
    }),
});

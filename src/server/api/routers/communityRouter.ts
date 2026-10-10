import { createCommunitySchema } from "@/lib/schemas";
import {
  createTRPCRouter,
  optionalAuthProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import * as communityDal from "@/dal/community";
import * as v from "valibot";

export const communityRouter = createTRPCRouter({
  createCommunity: protectedProcedure
    .input(createCommunitySchema)
    .mutation(async ({ ctx, input }) => {
      return await communityDal.createCommunity(input, ctx.userId);
    }),

  getAllCommunities: publicProcedure.query(async () => {
    return await communityDal.getAllCommunities();
  }),
  getUserJoinedCommunitiesData: optionalAuthProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return {
        success: true,
        message: "No communities for anonymous visitors",
        data: [],
      };
    }
    return await communityDal.getUserJoinedCommunitiesData(ctx.userId);
  }),
  getUserJoinedCommunities: optionalAuthProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return {
        success: true,
        message: "No communities for anonymous visitors",
        data: new Set<string>(),
      };
    }
    return await communityDal.getUserJoinedCommunities(ctx.userId);
  }),
  getCommunity: publicProcedure
    .input(
      v.object({
        id: v.string(),
      }),
    )
    .query(async ({ input }) => {
      return await communityDal.getCommunity(input.id);
    }),

  getPostsByCommunity: publicProcedure
    .input(
      v.object({
        communityId: v.string(),
      }),
    )
    .query(async ({ input }) => {
      return await communityDal.getPostsByCommunity(input.communityId);
    }),

  getTrendingCommunities: publicProcedure.query(async () => {
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

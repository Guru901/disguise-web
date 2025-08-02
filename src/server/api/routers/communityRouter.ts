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
  getCommunity: protectedProcedure
    .input(
      v.object({
        id: v.string(),
      }),
    )
    .query(async ({ input }) => {
      return await communityDal.getCommunity(input.id);
    }),
});

import { createCommunitySchema } from "@/lib/schemas";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import * as v from "valibot";
import * as communityDal from "@/dal/community";

export const communityRouter = createTRPCRouter({
  createCommunity: protectedProcedure
    .input(createCommunitySchema)
    .mutation(async ({ ctx, input }) => {
      return await communityDal.createCommunity(input, ctx.userId);
    }),
});

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { topicSchema as zodTopicSchema } from "@/lib/schemas";
import * as topicDal from "@/dal/topic";

export const topicRouter = createTRPCRouter({
  getAllTopics: publicProcedure.query(async ({ ctx }) => {
    return await topicDal.getAllTopics();
  }),

  createTopic: protectedProcedure
    .input(zodTopicSchema)
    .mutation(async ({ input, ctx }) => {
      return await topicDal.createTopic(
        input.name,
        ctx.userId,
        input.description,
      );
    }),
});

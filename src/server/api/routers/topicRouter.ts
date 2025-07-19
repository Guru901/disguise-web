import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { topicSchema as valibotTopicSchema } from "@/lib/schemas";
import * as topicDal from "@/dal/topic";

export const topicRouter = createTRPCRouter({
  getAllTopics: publicProcedure.query(async () => {
    return await topicDal.getAllTopics();
  }),

  createTopic: protectedProcedure
    .input(valibotTopicSchema)
    .mutation(async ({ input, ctx }) => {
      return await topicDal.createTopic(
        input.name,
        ctx.userId,
        input.description,
      );
    }),
});

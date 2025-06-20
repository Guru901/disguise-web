import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { topicSchema } from "@/server/db/schema";

export const topicRouter = createTRPCRouter({
  getAllTopics: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(topicSchema);
  }),
});

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { topicSchema } from "@/server/db/schema";
import { topicSchema as zodTopicSchema } from "@/lib/schemas";

export const topicRouter = createTRPCRouter({
  getAllTopics: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(topicSchema);
  }),

  createTopic: protectedProcedure
    .input(zodTopicSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const topic = await ctx.db
          .insert(topicSchema)
          .values({
            name: input.name,
            createdBy: ctx.userId,
          })
          .returning({ name: topicSchema.name });

        return {
          success: true,
          message: "Topic created successfully",
          name: topic[0]?.name,
        };
      } catch (error) {
        console.error(error);
        return {
          success: false,
          message: "Error creating topic",
        };
      }
    }),
});

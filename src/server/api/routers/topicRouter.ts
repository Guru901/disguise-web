import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { topicSchema, userSchema } from "@/server/db/schema";
import { topicSchema as zodTopicSchema } from "@/lib/schemas";
import { desc, eq } from "drizzle-orm";

export const topicRouter = createTRPCRouter({
  getAllTopics: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        id: topicSchema.id,
        name: topicSchema.name,
        createdBy: topicSchema.createdBy,
        createdAt: topicSchema.createdAt,
        description: topicSchema.description,
        user: {
          id: userSchema.id,
          username: userSchema.username,
        },
      })
      .from(topicSchema)
      .leftJoin(userSchema, eq(topicSchema.createdBy, userSchema.id));
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
            description: input.description,
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

import { topicSchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { userSchema } from "@/server/db/schema";
import { db } from "@/server/db";

async function getAllTopics() {
  try {
    const results = await db
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

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function createTopic(name: string, userId: string, description: string) {
  try {
    const topic = await db
      .insert(topicSchema)
      .values({
        name: name,
        createdBy: userId,
        description: description,
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
}

export { getAllTopics, createTopic };

import type { TCreateCommunitySchema } from "@/lib/schemas";
import { db } from "@/server/db";
import { communitySchema } from "@/server/db/schema";

async function createCommunity(data: TCreateCommunitySchema, userId: string) {
  try {
    console.log(data);
    const result = await db
      .insert(communitySchema)
      .values({
        name: data.name,
        description: data.description,
        icon: data.icon,
        banner: data.banner,
        moderators: [userId],
      })
      .returning({
        id: communitySchema.id,
      });

    if (result) {
      return {
        success: true,
        message: "Community created successfully",
        id: result[0]?.id,
      };
    } else {
      return {
        success: false,
        message: "Failed to create community",
      };
    }
  } catch (error) {
    console.error("Error creating community:", error);
    return {
      success: false,
      message: error,
    };
  }
}

export { createCommunity };

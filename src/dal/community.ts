import type { TCreateCommunitySchema } from "@/lib/schemas";
import { db } from "@/server/db";
import { communitySchema, postSchema, userSchema } from "@/server/db/schema";
import { and, eq, or, not, sql, desc, inArray } from "drizzle-orm";

async function createCommunity(data: TCreateCommunitySchema, userId: string) {
  try {
    const tagsArr = data.tags.split(" ");
    const guidelinesArr =
      data.guidlines?.filter(
        (guideline) => guideline && guideline.trim() !== "",
      ) ?? [];

    const result = await db
      .insert(communitySchema)
      .values({
        name: data.name,
        description: data.description,
        icon: data.icon,
        banner: data.banner,
        moderators: [userId],
        members: [userId],
        memberCount: 1,
        createdBy: userId,
        tags: tagsArr,
        guidlines: guidelinesArr,
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

async function getAllCommunities() {
  try {
    const data = await db.select().from(communitySchema);

    if (data) {
      return {
        success: true,
        message: "Community data retrieved",
        data,
      };
    } else {
      return {
        success: false,
        message: "Error retrieving community data",
      };
    }
  } catch (error) {
    console.error("Error retrieving community data:", error);
    return {
      success: false,
      message: error,
    };
  }
}

async function getCommunity(id: string) {
  try {
    const communityData = await db
      .select({
        id: communitySchema.id,
        name: communitySchema.name,
        description: communitySchema.description,
        icon: communitySchema.icon,
        banner: communitySchema.banner,
        members: communitySchema.members,
        memberCount: communitySchema.memberCount,
        createdAt: communitySchema.createdAt,
        moderators: communitySchema.moderators,
        guidlines: communitySchema.guidlines,
      })
      .from(communitySchema)
      .where(eq(communitySchema.id, id))
      .limit(1)
      .then((res) => res[0]);

    if (!communityData) {
      return {
        success: false,
        message: "Community not found",
      };
    }

    // Fetch moderator data for all moderators
    let moderatorsData: Array<{
      id: string;
      username: string;
      avatar: string | null;
    }> = [];

    if (communityData.moderators && communityData.moderators.length > 0) {
      const moderatorsDataResult = await db
        .select({
          id: userSchema.id,
          username: userSchema.username,
          avatar: userSchema.avatar,
        })
        .from(userSchema)
        .where(inArray(userSchema.id, communityData.moderators));

      moderatorsData = moderatorsDataResult;
    }

    const data = {
      ...communityData,
      moderatorsData,
    };

    return {
      success: true,
      message: "Community data retrieved",
      data: data,
    };
  } catch (error) {
    console.error("Error retrieving community data:", error);
    return {
      success: false,
      message: error,
    };
  }
}

async function getUserJoinedCommunities(userId: string) {
  try {
    const results = await db
      .select()
      .from(communitySchema)
      .where(sql`${userId} = ANY(${communitySchema.members})`)
      .orderBy(communitySchema.name);

    return results;
  } catch (error) {
    console.error("Error retrieving community data:", error);
    return {
      success: false,
      message: error,
    };
  }
}

async function getPostsByCommunity(communityId: string) {
  try {
    const results = await db
      .select()
      .from(postSchema)
      .where(
        and(
          eq(postSchema.isPublic, true),
          eq(postSchema.community, communityId),
        ),
      )
      .leftJoin(userSchema, and(eq(userSchema.id, postSchema.createdBy)))
      .orderBy(desc(postSchema.createdAt));

    const posts = results.map((row) => ({
      ...row.posts,
      createdBy: row.users,
    }));

    return {
      success: true,
      message: "Posts retrieved",
      data: posts,
    };
  } catch (error) {
    console.error("Error retrieving posts by community:", error);
    return {
      success: false,
      message: error,
      data: [],
    };
  }
}

export {
  createCommunity,
  getAllCommunities,
  getCommunity,
  getPostsByCommunity,
};

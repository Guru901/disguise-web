import type { TCreateCommunitySchema } from "@/lib/schemas";
import { db } from "@/server/db";
import { communitySchema, postSchema, userSchema } from "@/server/db/schema";
import {
  and,
  eq,
  or,
  not,
  sql,
  desc,
  inArray,
  gte,
  isNotNull,
  asc,
} from "drizzle-orm";

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
    const data = await db
      .select()
      .from(communitySchema)
      .orderBy(desc(communitySchema.createdAt));

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

async function getUserJoinedCommunitiesData(userId: string) {
  try {
    const results = await db
      .select()
      .from(communitySchema)
      .where(sql`${userId} = ANY(${communitySchema.members})`)
      .orderBy(communitySchema.name);

    return {
      success: true,
      message: "User joined communities retrieved",
      data: results,
    };
  } catch (error) {
    console.error("Error retrieving community data:", error);
    return {
      success: false,
      message: error,
      data: [],
    };
  }
}

async function getUserJoinedCommunities(userId: string) {
  try {
    const results = await db
      .select({
        id: communitySchema.id,
      })
      .from(communitySchema)
      .where(sql`${userId} = ANY(${communitySchema.members})`);

    const joinedCommunityIds = new Set(results.map((result) => result.id));

    return {
      success: true,
      message: "User joined communities retrieved",
      data: joinedCommunityIds,
    };
  } catch (error) {
    console.error("Error retrieving community data:", error);
    return {
      success: false,
      message: error,
      data: new Set<String>(),
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

async function getTrendingCommunities() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get posts from the last 7 days with community data
    const posts = await db
      .select({
        communityId: postSchema.community,
      })
      .from(postSchema)
      .where(
        and(
          eq(postSchema.isPublic, true),
          gte(postSchema.createdAt, sevenDaysAgo),
          isNotNull(postSchema.community),
        ),
      );

    // Count posts per community
    const communityCountMap = new Map<string, number>();
    for (const post of posts) {
      const id = post.communityId!;
      communityCountMap.set(id, (communityCountMap.get(id) || 0) + 1);
    }

    // If no trending communities found
    if (communityCountMap.size === 0) {
      return {
        success: true,
        message: "No trending communities found in the last 7 days",
        data: [],
      };
    }

    // Get community details
    const communityIds = Array.from(communityCountMap.keys());
    const communities = await db
      .select()
      .from(communitySchema)
      .where(inArray(communitySchema.id, communityIds));

    // Create a map for quick community lookup
    const communityMap = new Map(
      communities.map((community) => [community.id, community]),
    );

    // Combine community data with post counts and sort by count descending
    const trendingCommunities = Array.from(communityCountMap.entries())
      .map(([communityId, postCount]) => {
        const community = communityMap.get(communityId);
        if (!community) {
          console.warn(`Community with ID ${communityId} not found`);
          return null;
        }
        return {
          ...community,
          postsInLast7Days: postCount,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.postsInLast7Days - a.postsInLast7Days);

    console.log(`Found ${trendingCommunities.length} trending communities`);

    return {
      success: true,
      message: "Trending communities retrieved successfully",
      data: trendingCommunities,
    };
  } catch (error) {
    console.error("Error retrieving trending communities:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      data: [],
    };
  }
}

export {
  createCommunity,
  getAllCommunities,
  getCommunity,
  getPostsByCommunity,
  getTrendingCommunities,
  getUserJoinedCommunitiesData,
  getUserJoinedCommunities,
};

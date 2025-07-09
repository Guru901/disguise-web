import type { TSignInSchema, TSignUpSchema } from "@/lib/schemas";
import { db } from "@/server/db";
import { notificationSchema, userSchema } from "@/server/db/schema";
import { eq, or, asc, ilike, sql, desc, and, inArray } from "drizzle-orm";
import { hash, compare } from "bcrypt";

async function registerUser(userData: TSignUpSchema) {
  try {
    const userFromDb = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.username, userData.username));

    if (userFromDb.length !== 0) {
      return {
        message: "Username taken, please use a different one",
        success: false,
        status: 400,
        error: null,
      };
    }

    const hashedPassword = await hash(userData.password, 10);

    const insertedUsers = await db
      .insert(userSchema)
      .values({
        password: hashedPassword,
        username: userData.username,
        avatar: userData.avatar,
      })
      .returning({ id: userSchema.id });

    const newUser = insertedUsers[0];

    if (newUser?.id) {
      return {
        message: "User created",
        success: true,
        status: 201,
        error: null,
        data: newUser.id,
      };
    } else {
      return {
        message: "Error creating user",
        status: 500,
        success: false,
        error: null,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      message: "Error creating user",
      status: 500,
      success: false,
      error,
    };
  }
}

async function loginUser(userData: TSignInSchema) {
  try {
    const userFromDb = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.username, userData.username));

    if (userFromDb[0]) {
      const passwordMatch = await compare(
        userData.password,
        userFromDb[0].password,
      );

      if (passwordMatch) {
        return {
          message: "User logged in",
          success: true,
          status: 200,
          data: userFromDb[0].id,
          error: null,
        };
      } else {
        return {
          message: "Incorrect password",
          success: false,
          status: 401,
          error: null,
        };
      }
    } else {
      return {
        message: "User not found",
        success: false,
        status: 404,
        error: null,
      };
    }
  } catch (error) {
    return {
      message: "Error logging in user",
      status: 500,
      success: false,
      error,
    };
  }
}

async function getUserData(userId: string) {
  try {
    const user = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, userId))
      .limit(1)
      .then((res) => res[0]);

    user!.password = "";

    return {
      user: user,
      message: "User data retrieved",
      success: true,
      status: 200,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Error getting user data",
      user: null,
      success: false,
      status: 500,
      error,
    };
  }
}

async function searchusers(searchTerm: string) {
  try {
    const users = await db
      .select({
        id: userSchema.id,
        username: userSchema.username,
        avatar: userSchema.avatar,
      })
      .from(userSchema)
      .where(ilike(userSchema.username, "%" + searchTerm + "%"))
      .orderBy(asc(userSchema.username))
      .limit(10);

    return {
      users,
      success: true,
      message: "Users retrieved successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      users: null,
      success: false,
      message: "Error retrieving users",
    };
  }
}

async function getFirstTenUsers() {
  try {
    const users = await db
      .select({
        id: userSchema.id,
        username: userSchema.username,
        avatar: userSchema.avatar,
      })
      .from(userSchema)
      .limit(10);

    return {
      users,
      success: true,
      message: "Users retrieved successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      users: null,
      success: false,
      message: "Error retrieving users",
    };
  }
}

async function getUserDataById(userId: string) {
  try {
    const isValidUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userId,
      );

    let user = await db
      .select()
      .from(userSchema)
      .where(
        or(
          eq(userSchema.username, userId),
          ...(isValidUuid ? [eq(userSchema.id, userId)] : []),
        ),
      )
      .limit(1)
      .then((res) => res[0]);

    // If not found, and userId contains '_', try with spaces
    if (!user && userId.includes("_")) {
      const usernameWithSpaces = userId.replace(/_/g, " ");
      user = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.username, usernameWithSpaces))
        .limit(1)
        .then((res) => res[0]);
    }

    if (user) {
      user.password = "";
      return {
        user: user,
        message: "User data retrieved",
        success: true,
        status: 200,
        error: null,
      };
    } else {
      return {
        message: "User not found",
        user: null,
        success: false,
        status: 404,
        error: null,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      message: "Error getting user data",
      user: null,
      success: false,
      status: 500,
      error,
    };
  }
}

async function removeFriendById(userId: string, friendId: string) {
  try {
    await db
      .update(userSchema)
      .set({
        friends: sql`array_remove
        (
        ${userSchema.friends},
        ${friendId}
        )`,
      })
      .where(eq(userSchema.id, userId));

    await db
      .update(userSchema)
      .set({
        friends: sql`array_remove
        (
        ${userSchema.friends},
        ${userId}
        )`,
      })
      .where(eq(userSchema.id, friendId));

    return {
      success: true,
      message: "Friend removed successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error removing friend",
    };
  }
}

async function sendFriendRequest(userId: string, friendId: string) {
  try {
    const { user: toBeFriend } = await getUserDataById(friendId);
    const { user: loggedInUser } = await getUserDataById(userId);

    await db.insert(notificationSchema).values({
      user: friendId,
      byUser: userId,
      type: "friend_request",
      read: false,
      content: "Friend request",
      message: `Hey ${toBeFriend?.username}, ${loggedInUser?.username} wants to be friends with you`,
    });

    return {
      success: true,
      message: "Friend Request sent successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error sending friend request",
    };
  }
}

async function acceptFriendRequest(userId: string, friendId: string) {
  try {
    const { user: toBeFriend } = await getUserDataById(friendId);
    const { user: loggedInUser } = await getUserDataById(userId);

    await db
      .update(userSchema)
      .set({
        friends: sql`array_append(
        ${userSchema.friends},
        ${friendId}
      )`,
      })
      .where(eq(userSchema.id, userId));

    await db
      .update(userSchema)
      .set({
        friends: sql`array_append(
        ${userSchema.friends},
        ${userId}
      )`,
      })
      .where(eq(userSchema.id, friendId));

    await db
      .update(notificationSchema)
      .set({
        read: true,
      })
      .where(
        and(
          eq(notificationSchema.user, userId),
          eq(notificationSchema.byUser, friendId),
          eq(notificationSchema.type, "friend_request"),
        ),
      );

    return {
      success: true,
      message: "Friend Request accepted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error accepting friend request",
    };
  }
}

async function isFriendNotificationSent(userId: string, friendId: string) {
  try {
    const data = await db
      .select()
      .from(notificationSchema)
      .where(
        and(
          eq(notificationSchema.user, userId),
          eq(notificationSchema.byUser, friendId),
          eq(notificationSchema.type, "friend_request"),
          eq(notificationSchema.read, false),
        ),
      );

    if (data.length > 0) {
      return {
        success: true,
        message: "Friend Request has been sent",
      };
    } else {
      return {
        success: false,
        message: "Friend Request has not been sent",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Error accepting friend request",
    };
  }
}

async function rejectFreindRequest(userId: string, friendId: string) {
  try {
    const { user: toBeFriend } = await getUserDataById(friendId);
    const { user: loggedInUser } = await getUserDataById(userId);

    await db
      .update(notificationSchema)
      .set({
        read: true,
      })
      .where(
        and(
          eq(notificationSchema.user, userId),
          eq(notificationSchema.byUser, friendId),
          eq(notificationSchema.type, "friend_request"),
        ),
      );

    return {
      success: true,
      message: "Friend Request rejected successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error rejecting friend request",
    };
  }
}

async function getAllUsers(searchTerm: string) {
  searchTerm = searchTerm.split("@")[1]!;

  if (!searchTerm) {
    return await db
      .select()
      .from(userSchema)
      .where(or(ilike(userSchema.username, "%" + searchTerm + "%")))
      .orderBy(asc(userSchema.username))
      .limit(10);
  } else {
    return await db
      .select()
      .from(userSchema)
      .where(or(ilike(userSchema.username, "%" + searchTerm + "%")))
      .orderBy(asc(userSchema.username));
  }
}

async function getNotifications(userId: string) {
  try {
    const results = await db
      .select()
      .from(notificationSchema)
      .where(
        and(
          eq(notificationSchema.user, userId),
          eq(notificationSchema.read, false),
        ),
      )
      .orderBy(desc(notificationSchema.createdAt))
      .limit(10);

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getAllNotifications(userId: string) {
  try {
    const results = await db
      .select({
        id: notificationSchema.id,
        type: notificationSchema.type,
        content: notificationSchema.content,
        read: notificationSchema.read,
        createdAt: notificationSchema.createdAt,
        byUserId: userSchema.id,
        byUsername: userSchema.username,
        byAvatar: userSchema.avatar,
        message: notificationSchema.message,
        post: notificationSchema.post,
      })
      .from(notificationSchema)
      .leftJoin(userSchema, eq(notificationSchema.byUser, userSchema.id))
      .where(
        and(
          eq(notificationSchema.user, userId),
          eq(notificationSchema.read, false),
        ),
      )
      .orderBy(desc(notificationSchema.createdAt));

    return results.map((row) => ({
      id: row.id,
      type: row.type,
      content: row.content,
      read: row.read,
      createdAt: row.createdAt,
      message: row.message,
      post: row.post,
      byUser: {
        id: row.byUserId,
        username: row.byUsername,
        avatar: row.byAvatar,
      },
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function markNotificationAsRead(userId: string, notificationId: string) {
  try {
    await db
      .update(notificationSchema)
      .set({
        read: true,
      })
      .where(
        and(
          eq(notificationSchema.id, notificationId),
          eq(notificationSchema.user, userId),
        ),
      );

    return {
      success: true,
      message: "Notifications marked as read",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error marking notification as read",
    };
  }
}

async function markNotificationsAsRead(
  userId: string,
  notificationId: string[],
) {
  try {
    await db
      .update(notificationSchema)
      .set({
        read: true,
      })
      .where(
        and(
          eq(notificationSchema.user, userId),
          inArray(notificationSchema.id, notificationId),
        ),
      );
    return {
      success: true,
      message: "Notifications marked as read",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error marking notification as read",
    };
  }
}

async function deleteNotification(userId: string, notificationId: string) {
  try {
    await db
      .delete(notificationSchema)
      .where(
        and(
          eq(notificationSchema.id, notificationId),
          eq(notificationSchema.user, userId),
        ),
      );

    return {
      success: true,
      message: "Notification deleted",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error deleting notification",
    };
  }
}

export {
  registerUser,
  loginUser,
  getUserData,
  searchusers,
  getUserDataById,
  removeFriendById,
  getAllUsers,
  getNotifications,
  getAllNotifications,
  markNotificationAsRead,
  deleteNotification,
  markNotificationsAsRead,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFreindRequest,
  isFriendNotificationSent,
  getFirstTenUsers,
};

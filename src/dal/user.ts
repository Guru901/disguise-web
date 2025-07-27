import type { TSignInSchema, TSignUpSchema } from "@/lib/schemas";
import { db } from "@/server/db";
import { notificationSchema, userSchema } from "@/server/db/schema";
import {
  eq,
  or,
  asc,
  ilike,
  sql,
  desc,
  and,
  inArray,
  arrayContains,
  not,
} from "drizzle-orm";
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
      .where(eq(userSchema.username, userData.username))
      .then((res) => res[0]);

    if (userFromDb?.isDeleted) {
      return {
        message: "Your account has been deleted",
        success: false,
        status: 401,
        error: null,
      };
    }

    const deactivatedTill = new Date(String(userFromDb?.deactivatedTill));

    if (userFromDb?.isDeactivated && new Date() < deactivatedTill) {
      return {
        message: `Your account is deactivated till ${deactivatedTill.toDateString()}`,
        success: false,
        status: 401,
        error: null,
      };
    }

    if (userFromDb) {
      const passwordMatch = await compare(
        userData.password,
        userFromDb.password,
      );

      if (passwordMatch) {
        return {
          message: "User logged in",
          success: true,
          status: 200,
          data: userFromDb.id,
          error: null,
        };
      } else {
        return {
          message: "Incorrect credentials",
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

async function searchusers(searchTerm: string, loggedInUserId: string) {
  try {
    const loggedInUser = await db
      .select({ blockedUsers: userSchema.blockedUsers })
      .from(userSchema)
      .where(eq(userSchema.id, loggedInUserId))
      .limit(1);

    const loggedInUserBlockedList = loggedInUser[0]?.blockedUsers ?? [];

    const users = await db
      .select({
        id: userSchema.id,
        username: userSchema.username,
        avatar: userSchema.avatar,
      })
      .from(userSchema)
      .where(
        and(
          ilike(userSchema.username, "%" + searchTerm + "%"),
          not(arrayContains(userSchema.blockedUsers, [loggedInUserId])),
          not(eq(userSchema.isDeleted, true)),
          loggedInUserBlockedList.length > 0
            ? not(inArray(userSchema.id, loggedInUserBlockedList))
            : sql`true`,
        ),
      )
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

async function getFirstTenUsers(loggedInUserId: string) {
  try {
    const loggedInUser = await db
      .select({ blockedUsers: userSchema.blockedUsers })
      .from(userSchema)
      .where(eq(userSchema.id, loggedInUserId))
      .limit(1);

    const loggedInUserBlockedList = loggedInUser[0]?.blockedUsers ?? [];

    const users = await db
      .select({
        id: userSchema.id,
        username: userSchema.username,
        avatar: userSchema.avatar,
      })
      .from(userSchema)
      .where(
        and(
          not(arrayContains(userSchema.blockedUsers, [loggedInUserId])),
          loggedInUserBlockedList.length > 0
            ? not(inArray(userSchema.id, loggedInUserBlockedList))
            : sql`true`,
          eq(userSchema.isDeleted, false),
        ),
      )
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
  let user;
  try {
    user = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.username, userId))
      .limit(1)
      .then((res) => res[0]);

    user ??= await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, userId))
      .limit(1)
      .then((res) => res[0]);

    if (user) {
      user.password = "";
    }

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
    console.error(error);
    return {
      success: false,
      message: "Error sending friend request",
    };
  }
}

async function acceptFriendRequest(userId: string, friendId: string) {
  try {
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
    console.error(error);
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
    console.error(error);
    return {
      success: false,
      message: "Error accepting friend request",
    };
  }
}

async function rejectFreindRequest(userId: string, friendId: string) {
  try {
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
    console.error(error);
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
      .select({
        id: userSchema.id,
        username: userSchema.username,
        avatar: userSchema.avatar,
        posts: userSchema.posts,
        friends: userSchema.friends,
        createdAt: userSchema.createdAt,
        lastOnline: userSchema.lastOnline,
      })
      .from(userSchema)
      .where(or(ilike(userSchema.username, "%" + searchTerm + "%")))
      .orderBy(asc(userSchema.username));
  } else {
    return await db
      .select({
        id: userSchema.id,
        username: userSchema.username,
        avatar: userSchema.avatar,
        posts: userSchema.posts,
        friends: userSchema.friends,
        createdAt: userSchema.createdAt,
        lastOnline: userSchema.lastOnline,
      })
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

async function updateLastOnline(userId: string) {
  try {
    await db
      .update(userSchema)
      .set({
        lastOnline: new Date(),
      })
      .where(eq(userSchema.id, userId));

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}

async function editAvatar(userId: string, newAvatar: string) {
  try {
    await db
      .update(userSchema)
      .set({
        avatar: newAvatar,
      })
      .where(eq(userSchema.id, userId));

    return {
      success: true,
      newAvatar,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}

async function changeAccountType(userId: string, isPrivate: boolean) {
  try {
    await db
      .update(userSchema)
      .set({
        accountType: isPrivate ? "private" : "public",
      })
      .where(eq(userSchema.id, userId));

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}

async function getBlockedUsers(userId: string) {
  try {
    const [user] = await db
      .select({
        blockedUsers: userSchema.blockedUsers,
      })
      .from(userSchema)
      .where(eq(userSchema.id, userId));

    if (!user?.blockedUsers || user.blockedUsers.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const blockedUsersInfo = await db
      .select({
        id: userSchema.id,
        username: userSchema.username,
        avatar: userSchema.avatar,
      })
      .from(userSchema)
      .where(inArray(userSchema.id, user.blockedUsers));

    return {
      success: true,
      data: blockedUsersInfo,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}

async function blockUser(
  loggedInUserId: string,
  userToBlockId: string,
  isFriend: boolean,
) {
  try {
    if (isFriend) {
      await removeFriendById(loggedInUserId, userToBlockId);
    }

    await db
      .update(userSchema)
      .set({
        blockedUsers: sql`array_append
      (
      ${userSchema.blockedUsers},
      ${userToBlockId}
      )`,
      })
      .where(eq(userSchema.id, loggedInUserId));

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}

async function unblockUser(
  loggedInUserId: string,
  userToUnblockId: string,
  userToUnblockUsername: string,
) {
  try {
    await db
      .update(userSchema)
      .set({
        blockedUsers: sql`array_remove
      (
      ${userSchema.blockedUsers},
      ${userToUnblockId}
      )`,
      })
      .where(eq(userSchema.id, loggedInUserId));

    return {
      success: true,
      username: userToUnblockUsername,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}

async function deactivateAccount(loggedInUserId: string, deactivateTill: Date) {
  try {
    await db
      .update(userSchema)
      .set({
        isDeactivated: true,
        deactivatedTill: deactivateTill,
      })
      .where(eq(userSchema.id, loggedInUserId));

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}

async function deleteAccount(loggedInUserId: string) {
  try {
    await db
      .update(userSchema)
      .set({
        isDeleted: true,
        username: "Deleted",
        avatar: "https://c.tenor.com/nGIjFH0F7N0AAAAd/tenor.gif",
      })
      .where(eq(userSchema.id, loggedInUserId));

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}

async function changePassword(
  currentPassword: string,
  newPassword: string,
  loggedInUserId: string,
) {
  try {
    const userFromDb = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, loggedInUserId))
      .then((res) => res[0]);

    if (!userFromDb) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const passwordMatch = await compare(currentPassword, userFromDb?.password);

    if (!passwordMatch) {
      return {
        success: false,
        message: "The current password you entered is incorrect",
      };
    }
    const newPasswordHashed = await hash(newPassword, 10);

    await db
      .update(userSchema)
      .set({ password: newPasswordHashed })
      .where(eq(userSchema.id, loggedInUserId))
      .then((res) => res[0]);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong on our side",
    };
  }
}

async function changeNotificationSettingsForPost(
  userId: string,
  pref: boolean,
) {
  try {
    await db
      .update(userSchema)
      .set({
        receiveNotificationsForFriendPost: pref,
      })
      .where(eq(userSchema.id, userId));

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}
async function changeNotificationSettingsForComment(
  userId: string,
  pref: boolean,
) {
  try {
    await db
      .update(userSchema)
      .set({
        receiveNotificationsForComment: pref,
      })
      .where(eq(userSchema.id, userId));

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}
async function changeNotificationSettingsForLike(
  userId: string,
  pref: boolean,
) {
  try {
    await db
      .update(userSchema)
      .set({
        receiveNotificationsForLike: pref,
      })
      .where(eq(userSchema.id, userId));

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}
async function changeNotificationSettingsForMention(
  userId: string,
  pref: boolean,
) {
  try {
    await db
      .update(userSchema)
      .set({
        receiveNotificationsForMention: pref,
      })
      .where(eq(userSchema.id, userId));

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}
async function changeNotificationSettingsForFriendRequest(
  userId: string,
  pref: boolean,
) {
  try {
    await db
      .update(userSchema)
      .set({
        receiveNotificationsForFriendRequest: pref,
      })
      .where(eq(userSchema.id, userId));

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
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
  updateLastOnline,
  editAvatar,
  changeAccountType,
  getBlockedUsers,
  blockUser,
  unblockUser,
  deactivateAccount,
  deleteAccount,
  changePassword,
  changeNotificationSettingsForPost,
  changeNotificationSettingsForComment,
  changeNotificationSettingsForLike,
  changeNotificationSettingsForFriendRequest,
  changeNotificationSettingsForMention,
};

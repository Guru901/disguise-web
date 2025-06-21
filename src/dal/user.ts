import type { TSignInSchema, TSignUpSchema } from "@/lib/schemas";
import { db } from "@/server/db";
import { userSchema } from "@/server/db/schema";
import { eq, asc, ilike } from "drizzle-orm";
import { hash, compare } from "bcrypt";

export async function registerUser(userData: TSignUpSchema) {
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

export async function loginUser(userData: TSignInSchema) {
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

export async function getUserData(userId: string) {
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

export async function searchusers(searchTerm: string) {
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

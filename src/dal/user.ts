import type { TSignInSchema, TSignUpSchema } from "@/lib/schemas";
import { db } from "@/server/db";
import { userSchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";
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

    await db.insert(userSchema).values({
      password: hashedPassword,
      username: userData.username,
      avatar: userData.avatar,
    });

    return {
      message: "User created",
      success: true,
      status: 201,
      error: null,
    };
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

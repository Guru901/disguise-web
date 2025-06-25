import { type NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/dal/user";
import { signInSchema } from "@/lib/schemas";
import jwt from "jsonwebtoken";
import { env } from "@/env";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = signInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input" },
        { status: 400 },
      );
    }

    const result = await loginUser(parsed.data);
    
    if (result.success) {
      const token = jwt.sign({ id: result.data }, env.JWT_SECRET);
      const cookie = await cookies();

      cookie.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(Date.now() + 3600 * 1000),
      });
      return NextResponse.json({ success: true, message: result.message });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status ?? 401 },
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

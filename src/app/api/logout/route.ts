import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = NextResponse.json({
      success: true,
    });

    response.cookies.delete("token");

    return response;
  } catch (error) {
    return NextResponse.json({ msg: "Error logging out" });
  }
}

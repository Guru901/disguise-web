import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value ?? "";

  const path = request.nextUrl.pathname;

  if (!token) {
    if (path !== "/login" && path !== "/") {
      return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
  } else {
    if (path === "/login" || path === "/") {
      return NextResponse.redirect(new URL("/me", request.nextUrl));
    }
  }
}

export const config = {
  matcher: [
    "/feed",
    "/p/:id",
    "/post/",
    "/me",
    "/login",
    "/register",
    "/chat",
    "/search",
    "/change__password",
    "/notifications",
    "/topic",
    "/createTopic",
    "/friends",
    "/settings",
    "/admin/dashboard",
    "/u/:id",
  ],
};

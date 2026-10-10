import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value ?? "";

  const path = request.nextUrl.pathname;

  const requiresAccount =
    path === "/post" ||
    path === "/me" ||
    path === "/settings" ||
    path.startsWith("/settings/") ||
    path === "/communities/create" ||
    path.startsWith("/communities/create/");

  if (!token && requiresAccount) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  if (token && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/feed", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/post",
    "/me",
    "/login",
    "/signup",
    "/settings",
    "/settings/:path*",
    "/communities",
    "/communities/:path*",
  ],
};

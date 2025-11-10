import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/profile", "/settings"]
const authRoutes = ["/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname === "/site-access") {
    return NextResponse.next()
  }

  const siteAccessToken = request.cookies.get("site-access-token")?.value

  if (!siteAccessToken) {
    // Try to validate from query param (for initial redirect after login)
    const url = new URL(request.url)
    const tokenFromQuery = url.searchParams.get("token")

    if (!tokenFromQuery) {
      return NextResponse.redirect(new URL("/site-access", request.url))
    }
  }

  // Session-based auth for protected routes (separate from site access)
  const sessionCookie = request.cookies.get("trade_session_id")
  const hasSession = !!sessionCookie?.value

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

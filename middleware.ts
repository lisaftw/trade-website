import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/profile", "/settings"]
const authRoutes = ["/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return NextResponse.next()
  }

  const sitePasswordCookie = request.cookies.get("site-access")
  const hasSiteAccess = sitePasswordCookie?.value === "granted"

  console.log("[v0] Middleware:", {
    pathname,
    hasCookie: !!sitePasswordCookie,
    cookieValue: sitePasswordCookie?.value,
    hasAccess: hasSiteAccess,
  })

  // Redirect to password page if no access
  if (!hasSiteAccess && pathname !== "/site-access") {
    console.log("[v0] Middleware: Redirecting to /site-access")
    return NextResponse.redirect(new URL("/site-access", request.url))
  }

  // Redirect to home if already has access and trying to visit password page
  if (pathname === "/site-access" && hasSiteAccess) {
    console.log("[v0] Middleware: Has access, redirecting to home")
    return NextResponse.redirect(new URL("/", request.url))
  }

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

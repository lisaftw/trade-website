import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/profile", "/settings"]
const authRoutes = ["/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const sitePasswordCookie = request.cookies.get("site_access")
  const hasSiteAccess = sitePasswordCookie?.value === "granted"

  if (!hasSiteAccess && pathname !== "/site-access") {
    return NextResponse.redirect(new URL("/site-access", request.url))
  }

  if (pathname === "/site-access" && hasSiteAccess) {
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

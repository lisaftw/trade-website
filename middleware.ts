import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { addMobileSecurityHeaders, validateMobileSession } from "@/lib/security/mobile-security"

const protectedRoutes = ["/dashboard", "/profile", "/settings"]
const authRoutes = ["/login"]

export async function middleware(request: NextRequest) {
  if (!validateMobileSession(request)) {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("trade_session_id")
    return response
  }

  const sessionCookie = request.cookies.get("trade_session_id")
  const hasSession = !!sessionCookie?.value
  const { pathname } = request.nextUrl

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

  let response = NextResponse.next()

  response = addMobileSecurityHeaders(response)

  if (hasSession) {
    const userAgent = request.headers.get("user-agent") || ""
    response.cookies.set("session_ua", userAgent, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    })
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

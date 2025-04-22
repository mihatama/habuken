import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  // Initialize Supabase Auth middleware client
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname from the URL
  const { pathname } = request.nextUrl

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Redirect logic
  if (!session && !isPublicRoute && pathname !== "/") {
    // Redirect to login if not authenticated and trying to access protected route
    const redirectUrl = new URL("/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (session && (pathname === "/login" || pathname === "/signup" || pathname === "/")) {
    // Redirect to dashboard if already authenticated and trying to access login/signup
    const redirectUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Add cache control headers for different types of resources
  const url = request.nextUrl.pathname

  // Static assets caching
  if (url.includes("/_next/static")) {
    res.headers.set("Cache-Control", "public, max-age=31536000, immutable")
  }
  // API routes - no caching
  else if (url.includes("/api/")) {
    res.headers.set("Cache-Control", "no-store, max-age=0")
  }
  // Dynamic pages - short cache
  else if (!isPublicRoute && !url.includes(".")) {
    res.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
  }

  return res
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, fonts (static assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|fonts).*)",
  ],
}

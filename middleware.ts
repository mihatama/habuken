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

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// ミドルウェア関数
export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  return NextResponse.next()
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    /*
     * 以下のパスにマッチする場合にミドルウェアを実行:
     * - /api/:path* (APIルート)
     * - /((?!api|_next/static|_next/image|favicon.ico).*)
     */
    "/api/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

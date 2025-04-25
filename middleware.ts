import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // セッションを取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 保護されたルートへのアクセスをチェック
  const protectedRoutes = ["/dashboard", "/admin", "/master", "/projects", "/staff", "/tools", "/reports", "/settings"]
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // ログインページへのアクセスをチェック
  const isLoginPage = req.nextUrl.pathname === "/login"

  // ユーザーがログインしていない場合、保護されたルートへのアクセスをリダイレクト
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // ユーザーがログインしている場合、ログインページへのアクセスをダッシュボードにリダイレクト
  if (isLoginPage && session) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 保護されたルートのリスト
const protectedRoutes = [
  "/dashboard",
  "/projects",
  "/tasks",
  "/staff",
  "/tools",
  "/reports",
  "/settings",
  "/profile",
  "/leave",
  "/shifts",
  "/master",
  "/admin",
  "/inspection",
  "/report",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // デモモード用のクッキーチェック
  const isLoggedIn = request.cookies.has("logged_in")

  // 開発環境ではログインチェックをスキップ
  const isDevelopment = process.env.NODE_ENV === "development"

  // ルートパスへのアクセスをログインページにリダイレクト
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 保護されたルートへのアクセスで、ログインしていない場合はログインページへリダイレクト
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isLoggedIn && !isDevelopment) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // ログイン済みでログインページにアクセスした場合はダッシュボードへリダイレクト
  if ((pathname === "/login" || pathname === "/signup") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

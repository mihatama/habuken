// 静的エクスポート用に一時的にミドルウェアを無効化
// Amplifyでのデプロイが成功したら、必要に応じて再度有効化してください

/*
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// 認証が必要なパス
const protectedPaths = [
  "/dashboard",
  "/projects",
  "/staff",
  "/tools",
  "/shifts",
  "/leave",
  "/reports",
  "/profile",
  "/settings",
  "/master",
  "/admin",
  "/report",
  "/inspection",
]

// 認証済みユーザーがアクセスできないパス
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"]

export async function middleware(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // 認証が必要なパスへのアクセスで未認証の場合
  const isProtectedPath = protectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
  )

  if (isProtectedPath && !session) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(redirectUrl)
  }

  // 認証済みユーザーが認証ページにアクセスした場合
  const isAuthRoute = authRoutes.some((route) => path === route || path.startsWith(`${route}/`))

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
*/

// 静的エクスポート用の空のミドルウェア
export function middleware() {}

export const config = {
  matcher: [],
}

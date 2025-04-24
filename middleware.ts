import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

// 認証が必要なパス
const protectedPaths = [
  "/dashboard",
  "/projects",
  "/staff",
  "/tools",
  "/reports",
  "/profile",
  "/settings",
  "/admin",
  "/master",
  "/leave",
  "/tasks",
  "/inspection",
  "/report",
]

// 管理者権限が必要なパス
const adminPaths = ["/admin"]

// このミドルウェアはすべてのリクエストに対して実行される
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 認証が必要なパスかどうかをチェック
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  // 管理者権限が必要なパスかどうかをチェック
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path))

  // 認証が必要ないパスの場合はそのまま次へ
  if (!isProtectedPath) {
    return NextResponse.next()
  }

  try {
    // Supabaseクライアントを初期化
    const supabase = createServerSupabaseClient()

    // セッションを取得
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // セッションがない場合はログインページにリダイレクト
    if (!session) {
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    // 管理者権限が必要なパスの場合は権限チェック
    if (isAdminPath) {
      // ユーザーロールを取得
      const { data: userRoles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id)

      // 管理者権限がない場合はダッシュボードにリダイレクト
      const isAdmin = userRoles?.some((role) => role.role === "admin")
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // 認証済みの場合は次へ
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // エラーが発生した場合はログインページにリダイレクト
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

// 特定のパスに対してのみミドルウェアを実行
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - login, signup, forgot-password, reset-password (auth pages)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|login|signup|forgot-password|reset-password).*)",
  ],
}

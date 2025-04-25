import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// 認証が必要なパス
const protectedPaths = [
  "/dashboard",
  "/projects",
  "/tasks",
  "/staff",
  "/reports",
  "/tools",
  "/shifts",
  "/leave",
  "/profile",
  "/settings",
  "/admin",
  "/master",
  "/inspection",
  "/report",
]

// 認証が不要なパス
const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/supabase-debug", "/debug"]

export async function middleware(req: NextRequest) {
  try {
    // リクエストURLを取得
    const url = req.nextUrl.clone()
    const path = url.pathname

    // デバッグ用ログ
    console.log(`Middleware: Path=${path}`)

    // 静的アセットやAPIルートはスキップ
    if (
      path.startsWith("/_next") ||
      path.startsWith("/api/") ||
      path.startsWith("/static/") ||
      path.includes(".") ||
      path === "/favicon.ico"
    ) {
      console.log(`Middleware: Skipping static asset or API route: ${path}`)
      return NextResponse.next()
    }

    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    // セッションを取得
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // デバッグ用ログ
    console.log(`Middleware: Session=${session ? "exists" : "null"}`)
    if (session) {
      console.log(`User authenticated in middleware: ${session.user.email}, User ID: ${session.user.id}`)
    } else {
      console.log("No active session found in middleware")
    }

    // 保護されたパスへのアクセスで認証されていない場合はログインページにリダイレクト
    const isProtectedPath = protectedPaths.some(
      (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
    )

    if (isProtectedPath && !session) {
      console.log(`Redirecting to login: Protected path=${path}, no session`)
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirect", path)
      return NextResponse.redirect(redirectUrl)
    }

    // 認証済みユーザーがログインページなどにアクセスした場合はダッシュボードにリダイレクト
    const isAuthPath = publicPaths.includes(path)

    if (isAuthPath && session && path !== "/" && !path.startsWith("/debug") && !path.startsWith("/supabase-debug")) {
      console.log(`Redirecting to dashboard: Auth path=${path}, has session`)
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Cookieを確実に設定するためにレスポンスを返す
    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // エラーが発生した場合でもアプリケーションを継続させる
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}

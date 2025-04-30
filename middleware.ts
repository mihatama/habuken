import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  // デバッグ用のログ（サーバーサイドのログなのでブラウザには表示されません）
  console.log("ミドルウェア実行:", req.nextUrl.pathname)

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // セッションを取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 認証が必要なパスのリスト
  const authRequiredPaths = ["/dashboard", "/master", "/reports", "/tools", "/settings", "/profile", "/leave"]

  // 現在のパス
  const path = req.nextUrl.pathname

  // 認証が必要なパスにアクセスしようとしていて、セッションがない場合はログインページにリダイレクト
  const isAuthRequired = authRequiredPaths.some((authPath) => path.startsWith(authPath))

  console.log("認証要件:", { path, isAuthRequired, hasSession: !!session })

  if (isAuthRequired && !session) {
    console.log("未認証アクセス、リダイレクト:", path)
    // Prevent redirect loop
    if (path !== "/login") {
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirect", path)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // ログイン済みでログインページやサインアップページにアクセスしようとしている場合はダッシュボードにリダイレクト
  if (session && (path === "/login" || path === "/signup")) {
    console.log("認証済みユーザーのログインページアクセス、リダイレクト")
    // Prevent redirect loop
    if (path !== "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Cookieを設定してセッション情報を保持
  const response = NextResponse.next()
  if (session) {
    response.cookies.set("authenticated", "true", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    })
  } else {
    response.cookies.set("authenticated", "false", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    })
  }

  return response
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

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
const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password"]

// デバッグパス（常にアクセス可能）
const debugPaths = ["/debug", "/api/debug"]

// 静的アセットパス（ミドルウェアをスキップ）
const staticPaths = ["/_next", "/api", "/static", "/favicon.ico", "/images"]

export async function middleware(req: NextRequest) {
  try {
    // リクエストURLを取得
    const url = req.nextUrl.clone()
    const path = url.pathname

    // デバッグ用ログ
    console.log(`Middleware実行: Path=${path}`)

    // 静的アセットやAPIルートはスキップ
    if (staticPaths.some((staticPath) => path.startsWith(staticPath)) || path.includes(".")) {
      return NextResponse.next()
    }

    // デバッグパスは常にアクセス可能
    if (debugPaths.some((debugPath) => path === debugPath || path.startsWith(`${debugPath}/`))) {
      console.log(`Middleware: Debug path, skipping auth check: ${path}`)
      return NextResponse.next()
    }

    // リダイレクトループ検出
    const redirectCount = Number.parseInt(req.headers.get("x-redirect-count") || "0")
    if (redirectCount > 5) {
      console.error(`リダイレクトループを検出しました: ${path}, カウント: ${redirectCount}`)
      // デバッグページにリダイレクト
      return NextResponse.redirect(new URL("/debug/supabase", req.url))
    }

    const res = NextResponse.next()

    // Supabaseクライアントを作成
    const supabase = createMiddlewareClient({ req, res })

    // セッションを取得
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // デバッグ用ログ
    console.log(`Middleware: Session=${session ? "exists" : "null"}`)
    if (session) {
      console.log(`User authenticated in middleware: ${session.user.email}`)
    } else {
      console.log("No active session found in middleware")
    }

    // 保護されたパスへのアクセスで認証されていない場合はログインページにリダイレクト
    const isProtectedPath = protectedPaths.some(
      (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
    )

    if (isProtectedPath && !session) {
      console.log(`Middleware: リダイレクト実行 - 保護されたパス(${path})にセッションなしでアクセス -> /login`)
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirect", path)
      const redirectRes = NextResponse.redirect(redirectUrl)
      // リダイレクトカウントを増やす
      redirectRes.headers.set("x-redirect-count", (redirectCount + 1).toString())
      return redirectRes
    }

    // 認証済みユーザーがログインページなどにアクセスした場合はダッシュボードにリダイレクト
    // ただし、ルートパス（/）へのアクセスはリダイレクトしない
    const isAuthPath = publicPaths.includes(path)

    if (isAuthPath && session && path !== "/") {
      console.log(`Middleware: リダイレクト実行 - 認証パス(${path})にセッションありでアクセス -> /dashboard`)
      // リダイレクトURLを設定
      const redirectUrl = new URL("/dashboard", req.url)
      // リダイレクトを実行
      const redirectRes = NextResponse.redirect(redirectUrl)
      // リダイレクトカウントを増やす
      redirectRes.headers.set("x-redirect-count", (redirectCount + 1).toString())
      return redirectRes
    }

    // Cookieを確実に設定するためにレスポンスを返す
    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // エラーが発生した場合でもアプリケーションを継続させる
    return NextResponse.next()
  }
}

// matcherを修正して、静的アセットを除外
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // リクエストURLを取得
  const url = request.nextUrl.clone()

  // セキュリティヘッダーを追加
  const response = NextResponse.next()

  // CSPヘッダーを設定
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;",
  )

  // 認証チェック（必要に応じてカスタマイズ）
  const isLoggedIn = request.cookies.has("supabase-auth-token")
  const isAuthPage =
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/signup") ||
    url.pathname.startsWith("/forgot-password") ||
    url.pathname.startsWith("/reset-password")

  // 認証が必要なページへの未認証アクセスをリダイレクト
  if (!isLoggedIn && !isAuthPage && url.pathname !== "/") {
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // 認証済みユーザーが認証ページにアクセスした場合はダッシュボードへリダイレクト
  if (isLoggedIn && isAuthPage) {
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return response
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    // 静的ファイルを除外
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$).*)",
  ],
}

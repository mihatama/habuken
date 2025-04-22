import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // セッションを取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  // 保護されたパスへのアクセスで認証されていない場合はログインページにリダイレクト
  const isProtectedPath = protectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
  )

  if (isProtectedPath && !session) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(redirectUrl)
  }

  // 認証済みユーザーがログインページなどにアクセスした場合はダッシュボードにリダイレクト
  const isAuthPath = publicPaths.some((publicPath) => path === publicPath || path.startsWith(`${publicPath}/`))

  if (isAuthPath && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
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
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// 静的アセットパス（ミドルウェアをスキップ）
const staticPaths = ["/_next", "/api", "/static", "/favicon.ico", "/images"]

export async function middleware(req: NextRequest) {
  try {
    // リクエストURLを取得
    const url = req.nextUrl.clone()
    const path = url.pathname

    // 静的アセットやAPIルートはスキップ
    if (staticPaths.some((staticPath) => path.startsWith(staticPath)) || path.includes(".")) {
      return NextResponse.next()
    }

    // ミドルウェアの処理を最小限に
    const res = NextResponse.next()

    // Supabaseクライアントを作成
    const supabase = createMiddlewareClient({ req, res })

    // セッションを取得するだけ（リダイレクトなし）
    await supabase.auth.getSession()

    // レスポンスを返す
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

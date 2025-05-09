import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { validateCsrfToken } from "@/lib/csrf-protection"

/**
 * CSRF保護のためのミドルウェア
 * POSTリクエストに対してCSRFトークンを検証する
 */
export function csrfMiddleware(req: NextRequest) {
  // POSTリクエストのみチェック
  if (req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
    // APIルートのみチェック
    if (req.nextUrl.pathname.startsWith("/api/")) {
      // CSRFトークンをヘッダーから取得
      const csrfToken = req.headers.get("X-CSRF-Token")

      // トークンがない場合は拒否
      if (!csrfToken) {
        return NextResponse.json({ error: "CSRF token missing" }, { status: 403 })
      }

      // トークンを検証
      if (!validateCsrfToken(csrfToken)) {
        return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
      }
    }
  }

  // 問題なければ次へ
  return NextResponse.next()
}

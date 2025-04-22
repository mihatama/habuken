import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 静的エクスポート用の最小限のミドルウェア実装
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// 静的エクスポートでは空のmatcherを使用
export const config = {
  matcher: [],
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 静的エクスポートではミドルウェアは機能しないため、
// 最小限の実装に変更

export function middleware(request: NextRequest) {
  // 静的エクスポートでは機能しないため、空の実装
  return NextResponse.next()
}

export const config = {
  matcher: [],
}

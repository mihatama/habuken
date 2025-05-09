"use client"

import { useEffect, useState } from "react"
import { generateCsrfToken, getCsrfToken } from "@/lib/csrf-protection"

/**
 * CSRF保護のためのフック
 * コンポーネントでCSRFトークンを使用するためのフック
 */
export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string>("")

  useEffect(() => {
    // コンポーネントマウント時にトークンを取得または生成
    const token = getCsrfToken() || generateCsrfToken()
    setCsrfToken(token)
  }, [])

  // フェッチリクエスト用のヘッダーを生成する関数
  const getCsrfHeader = () => ({
    "X-CSRF-Token": csrfToken,
  })

  return {
    csrfToken,
    getCsrfHeader,
  }
}

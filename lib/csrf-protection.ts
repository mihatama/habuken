// CSRFトークン生成と検証のためのユーティリティ

/**
 * CSRFトークンを生成する
 * @returns 生成されたCSRFトークン
 */
export function generateCsrfToken(): string {
  if (typeof window === "undefined") return ""

  // ランダムな文字列を生成
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  // セッションストレージに保存
  window.sessionStorage.setItem("csrf_token", token)

  return token
}

/**
 * 保存されているCSRFトークンを取得する
 * @returns 保存されているCSRFトークン
 */
export function getCsrfToken(): string {
  if (typeof window === "undefined") return ""

  // セッションストレージから取得
  const token = window.sessionStorage.getItem("csrf_token")

  // トークンがない場合は新しく生成
  if (!token) {
    return generateCsrfToken()
  }

  return token
}

/**
 * CSRFトークンを検証する
 * @param token 検証するトークン
 * @returns 検証結果
 */
export function validateCsrfToken(token: string): boolean {
  if (typeof window === "undefined") return false

  const storedToken = window.sessionStorage.getItem("csrf_token")

  // トークンが一致するか確認
  return storedToken === token
}

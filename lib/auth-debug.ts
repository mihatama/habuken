// 認証状態のデバッグ用ヘルパー関数

// タイムスタンプ付きのログ出力
export function logWithTimestamp(message: string, data?: any) {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0] // HH:MM:SS形式
  if (data) {
    console.log(`[${timestamp}] ${message}`, data)
  } else {
    console.log(`[${timestamp}] ${message}`)
  }
}

// 認証イベントのログ
export function logAuthEvent(event: string, session: any) {
  logWithTimestamp(`Auth Event: ${event}`)

  if (session) {
    logWithTimestamp("Session Details:", {
      user_id: session.user?.id,
      email: session.user?.email,
      session_id: session.access_token?.substring(0, 8) + "...",
      expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : "unknown",
    })
  } else {
    logWithTimestamp("Session Details: No session")
  }
}

// ナビゲーションのログ
export function logNavigation(action: string, destination: string) {
  logWithTimestamp(`Navigation ${action}: ${destination}`)
}

// 認証ストレージの状態確認
export function checkAuthStorage() {
  if (typeof window === "undefined") {
    return { localStorageKeys: [], cookies: "" }
  }

  try {
    // ローカルストレージの認証関連キーを取得
    const localStorageKeys = Object.keys(localStorage).filter(
      (key) => key.includes("supabase") || key.includes("auth") || key.includes("habuken"),
    )

    // Cookieを取得
    const cookies = document.cookie

    logWithTimestamp("Auth Storage Check:", {
      localStorageKeys,
      cookies: cookies.split(";").map((c) => c.trim()),
    })

    return {
      localStorageKeys,
      cookies,
    }
  } catch (error) {
    console.error("Error checking auth storage:", error)
    return { localStorageKeys: [], cookies: "" }
  }
}

// 認証診断情報の収集
export function collectAuthDiagnostics() {
  if (typeof window === "undefined") {
    return { error: "Server-side execution" }
  }

  try {
    const storage = checkAuthStorage()

    // セッションストレージの認証関連キーを取得
    const sessionStorageKeys = Object.keys(sessionStorage).filter(
      (key) => key.includes("auth") || key.includes("supabase") || key.includes("habuken"),
    )

    // セッションストレージの値を取得
    const sessionStorageValues = sessionStorageKeys.reduce(
      (acc, key) => {
        acc[key] = sessionStorage.getItem(key)
        return acc
      },
      {} as Record<string, string | null>,
    )

    const diagnostics = {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      localStorage: storage.localStorageKeys,
      sessionStorage: sessionStorageValues,
      cookies: storage.cookies.split(";").map((c) => c.trim()),
      userAgent: navigator.userAgent,
    }

    logWithTimestamp("Auth Diagnostics:", diagnostics)
    return diagnostics
  } catch (error) {
    console.error("Error collecting auth diagnostics:", error)
    return { error: String(error) }
  }
}

// セッションの有効期限チェック
export function checkSessionExpiry(expiresAt: number | null | undefined) {
  if (!expiresAt) return { valid: false, message: "No expiry time" }

  const now = Date.now() / 1000 // 現在のUNIXタイムスタンプ（秒）
  const timeUntilExpiry = expiresAt - now

  // 有効期限切れかどうかを確認
  const isExpired = timeUntilExpiry <= 0

  // 残り時間を計算
  let remainingTime = ""
  if (timeUntilExpiry > 0) {
    if (timeUntilExpiry > 3600) {
      remainingTime = `${Math.floor(timeUntilExpiry / 3600)}時間${Math.floor((timeUntilExpiry % 3600) / 60)}分`
    } else {
      remainingTime = `${Math.floor(timeUntilExpiry / 60)}分${Math.floor(timeUntilExpiry % 60)}秒`
    }
  }

  const result = {
    valid: !isExpired,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
    timeUntilExpiry: isExpired ? "期限切れ" : remainingTime,
    timestamp: new Date().toISOString(),
  }

  logWithTimestamp("Session Expiry Check:", result)
  return result
}

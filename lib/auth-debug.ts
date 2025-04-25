// 認証状態とページ遷移のタイミングをデバッグするためのユーティリティ

// タイムスタンプ付きのログ出力
export function logWithTimestamp(message: string, data?: any) {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0] // HH:MM:SS形式
  if (data) {
    console.log(`[${timestamp}] ${message}`, data)
  } else {
    console.log(`[${timestamp}] ${message}`)
  }
}

// 認証イベントの詳細をログに記録
export function logAuthEvent(event: string, session: any) {
  logWithTimestamp(`Auth Event: ${event}`)

  if (session) {
    const { user, expires_at } = session
    const expiresDate = expires_at ? new Date(expires_at * 1000).toISOString() : "unknown"

    logWithTimestamp("Session Details:", {
      user_id: user?.id,
      email: user?.email,
      expires_at: expiresDate,
      session_id: session.id?.substring(0, 8) + "...", // セキュリティのため一部のみ表示
    })
  } else {
    logWithTimestamp("Session: null")
  }
}

// ページ遷移のタイミングをログに記録
export function logNavigation(action: string, destination: string) {
  logWithTimestamp(`Navigation ${action}: ${destination}`)
}

// 認証状態のローカルストレージ/Cookieの状態をチェック
export function checkAuthStorage() {
  logWithTimestamp("Checking auth storage:")

  // ローカルストレージのキーを確認
  const localStorageKeys = Object.keys(localStorage).filter(
    (key) => key.includes("supabase") || key.includes("auth") || key.includes("session"),
  )

  logWithTimestamp("LocalStorage auth keys:", localStorageKeys)

  // Cookieの確認
  logWithTimestamp("Cookies:", document.cookie)

  return {
    localStorageKeys,
    cookies: document.cookie,
  }
}

// 認証状態とページ遷移の詳細な診断情報を収集
export function collectAuthDiagnostics() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    storage: checkAuthStorage(),
    userAgent: navigator.userAgent,
    referrer: document.referrer || "none",
  }

  logWithTimestamp("Auth Diagnostics Collected:", diagnostics)
  return diagnostics
}

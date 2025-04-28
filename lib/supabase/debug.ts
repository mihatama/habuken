/**
 * デバッグログを出力する関数
 * @param message ログメッセージ
 */
export function debugLog(message: string): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Supabase Debug] ${message}`)
  }
}

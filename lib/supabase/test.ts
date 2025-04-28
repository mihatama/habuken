"use client"

import { getClientSupabase } from "./singleton"
import { debugLog } from "./debug"

/**
 * Supabaseクライアントの初期化をテストする関数
 * この関数は、複数回呼び出されても同じインスタンスを返すことを確認します
 */
export function testSupabaseClientInitialization() {
  debugLog("Testing Supabase client initialization")

  // 1回目の初期化
  const client1 = getClientSupabase()
  debugLog("First client initialized")

  // 2回目の初期化
  const client2 = getClientSupabase()
  debugLog("Second client initialized")

  // 同じインスタンスかどうかを確認
  const isSameInstance = client1 === client2
  debugLog(`Is same instance: ${isSameInstance}`)

  return isSameInstance
}

/**
 * テストを実行する関数
 * この関数は、ページロード時に自動的に実行されます
 */
export function runTests() {
  if (typeof window !== "undefined") {
    debugLog("Running Supabase client tests")

    // クライアント初期化のテスト
    const isSameInstance = testSupabaseClientInitialization()

    if (isSameInstance) {
      console.log("✅ Supabase client initialization test passed")
    } else {
      console.error("❌ Supabase client initialization test failed")
    }
  }
}

// テストを自動実行
if (typeof window !== "undefined") {
  // ページロード後にテストを実行
  window.addEventListener("load", runTests)
}

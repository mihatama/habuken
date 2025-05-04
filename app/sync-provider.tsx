"use client"

import type React from "react"

import { useSyncManager } from "@/lib/sync-manager"
import { useEffect } from "react"

export function SyncProvider({ children }: { children: React.ReactNode }) {
  // 自動同期機能を使用
  const { isOnline } = useSyncManager()

  // デバッグ用のログ
  useEffect(() => {
    console.log(`ネットワーク状態: ${isOnline ? "オンライン" : "オフライン"}`)
  }, [isOnline])

  return <>{children}</>
}

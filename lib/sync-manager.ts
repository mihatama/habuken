"use client"

import { offlineStorage } from "./offline-storage"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useEffect, useState } from "react"

export class SyncManager {
  private syncInProgress = false

  // 日報データの同期
  async syncDailyReports() {
    if (this.syncInProgress || !offlineStorage) return

    try {
      this.syncInProgress = true

      // 未同期の日報データを取得
      const unsyncedReports = await offlineStorage.getUnsyncedData("dailyReports")

      if (unsyncedReports.length === 0) return

      console.log(`${unsyncedReports.length}件の未同期日報データを同期します`)

      for (const report of unsyncedReports) {
        try {
          // サーバーにデータを送信
          const response = await fetch("/api/daily-reports", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(report),
          })

          if (response.ok) {
            // 同期成功したらマークを更新
            await offlineStorage.markAsSynced("dailyReports", report.id)
            console.log(`日報データ ${report.id} の同期に成功しました`)
          } else {
            console.error(`日報データ ${report.id} の同期に失敗しました:`, await response.text())
          }
        } catch (error) {
          console.error(`日報データ ${report.id} の同期中にエラーが発生しました:`, error)
        }
      }
    } finally {
      this.syncInProgress = false
    }
  }

  // 安全パトロールデータの同期
  async syncSafetyInspections() {
    if (this.syncInProgress || !offlineStorage) return

    try {
      this.syncInProgress = true

      // 未同期の安全パトロールデータを取得
      const unsyncedInspections = await offlineStorage.getUnsyncedData("safetyInspections")

      if (unsyncedInspections.length === 0) return

      console.log(`${unsyncedInspections.length}件の未同期安全パトロールデータを同期します`)

      for (const inspection of unsyncedInspections) {
        try {
          // サーバーにデータを送信
          const response = await fetch("/api/safety-inspections", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(inspection),
          })

          if (response.ok) {
            // 同期成功したらマークを更新
            await offlineStorage.markAsSynced("safetyInspections", inspection.id)
            console.log(`安全パトロールデータ ${inspection.id} の同期に成功しました`)
          } else {
            console.error(`安全パトロールデータ ${inspection.id} の同期に失敗しました:`, await response.text())
          }
        } catch (error) {
          console.error(`安全パトロールデータ ${inspection.id} の同期中にエラーが発生しました:`, error)
        }
      }
    } finally {
      this.syncInProgress = false
    }
  }

  // すべてのデータを同期
  async syncAll() {
    await this.syncDailyReports()
    await this.syncSafetyInspections()
    // 他の同期処理があれば追加
  }
}

// シングルトンインスタンスをエクスポート
export const syncManager = typeof window !== "undefined" ? new SyncManager() : null

// 自動同期のためのReactフック
export function useSyncManager() {
  const isOnline = useOnlineStatus()
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // オンラインに戻った時に自動同期
  useEffect(() => {
    if (isOnline && syncManager) {
      syncManager.syncAll().then(() => {
        setLastSyncTime(new Date())
      })
    }
  }, [isOnline])

  return {
    isOnline,
    lastSyncTime,
    syncAll: syncManager ? () => syncManager.syncAll() : () => Promise.resolve(),
  }
}

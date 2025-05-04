"use client"

import { openDB, type IDBPDatabase } from "idb"

const DB_NAME = "habuken-offline-db"
const DB_VERSION = 1

interface OfflineData {
  id: string
  data: any
  timestamp: number
  syncStatus: number
}

class OfflineStorage {
  private dbPromise: Promise<IDBPDatabase> | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.initDB()
    }
  }

  private initDB() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 日報データ用のオブジェクトストア
        if (!db.objectStoreNames.contains("dailyReports")) {
          const dailyReportsStore = db.createObjectStore("dailyReports", { keyPath: "id" })
          dailyReportsStore.createIndex("syncStatus", "syncStatus") // syncedの代わりにsyncStatusを使用
          dailyReportsStore.createIndex("timestamp", "timestamp")
        }

        // 安全パトロールデータ用のオブジェクトストア
        if (!db.objectStoreNames.contains("safetyInspections")) {
          const safetyStore = db.createObjectStore("safetyInspections", { keyPath: "id" })
          safetyStore.createIndex("syncStatus", "syncStatus") // syncedの代わりにsyncStatusを使用
          safetyStore.createIndex("timestamp", "timestamp")
        }

        // ユーザー設定用のオブジェクトストア
        if (!db.objectStoreNames.contains("userSettings")) {
          db.createObjectStore("userSettings", { keyPath: "id" })
        }
      },
    })
  }

  // データの保存
  async saveData(storeName: string, data: any): Promise<string> {
    if (!this.dbPromise) return Promise.reject("データベースが初期化されていません")

    const db = await this.dbPromise
    const id = data.id || crypto.randomUUID()
    const offlineData: OfflineData = {
      id,
      data,
      timestamp: Date.now(),
      syncStatus: 0, // 0 = 未同期, 1 = 同期済み
    }

    await db.put(storeName, offlineData)
    return id
  }

  // データの取得
  async getData(storeName: string, id: string): Promise<any> {
    if (!this.dbPromise) return Promise.reject("データベースが初期化されていません")

    const db = await this.dbPromise
    const result = await db.get(storeName, id)
    return result ? result.data : null
  }

  // 全データの取得
  async getAllData(storeName: string): Promise<any[]> {
    if (!this.dbPromise) return Promise.reject("データベースが初期化されていません")

    const db = await this.dbPromise
    const results = await db.getAll(storeName)
    return results.map((item) => item.data)
  }

  // 未同期データの取得
  async getUnsyncedData(storeName: string): Promise<any[]> {
    if (!this.dbPromise) return Promise.reject("データベースが初期化されていません")

    const db = await this.dbPromise
    const tx = db.transaction(storeName, "readonly")
    const index = tx.store.index("syncStatus")
    try {
      // 0 = 未同期のデータを取得
      const results = await index.getAll(IDBKeyRange.only(0))
      return results.map((item) => item.data)
    } catch (error) {
      console.error("未同期データの取得中にエラーが発生しました:", error)
      // エラーが発生した場合は、すべてのデータを取得してフィルタリング
      const store = tx.objectStore(storeName)
      const allItems = await store.getAll()
      const unsyncedItems = allItems.filter((item) => item.syncStatus === 0)
      return unsyncedItems.map((item) => item.data)
    }
  }

  // データを同期済みとしてマーク
  async markAsSynced(storeName: string, id: string): Promise<void> {
    if (!this.dbPromise) return Promise.reject("データベースが初期化されていません")

    const db = await this.dbPromise
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    const item = await store.get(id)

    if (item) {
      item.syncStatus = 1 // 1 = 同期済み
      await store.put(item)
    }
  }

  // データの削除
  async deleteData(storeName: string, id: string): Promise<void> {
    if (!this.dbPromise) return Promise.reject("データベースが初期化されていません")

    const db = await this.dbPromise
    await db.delete(storeName, id)
  }

  // ユーザー設定の保存
  async saveUserSettings(settings: any): Promise<void> {
    return this.saveData("userSettings", { id: "userSettings", ...settings })
  }

  // ユーザー設定の取得
  async getUserSettings(): Promise<any> {
    const result = await this.getData("userSettings", "userSettings")
    return result || {}
  }
}

// シングルトンインスタンスをエクスポート
export const offlineStorage = typeof window !== "undefined" ? new OfflineStorage() : null

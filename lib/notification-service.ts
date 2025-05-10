"use client"

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  data?: any
  onClick?: () => void
}

class NotificationService {
  private static instance: NotificationService

  private constructor() {
    // シングルトンパターン
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  /**
   * 通知がサポートされているか確認
   */
  public isSupported(): boolean {
    return "Notification" in window
  }

  /**
   * 現在の通知権限を取得
   */
  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return "denied"
    return Notification.permission
  }

  /**
   * 通知権限をリクエスト
   */
  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false

    try {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    } catch (error) {
      console.error("通知権限のリクエストに失敗しました:", error)
      return false
    }
  }

  /**
   * 通知を送信
   */
  public async sendNotification(options: NotificationOptions): Promise<boolean> {
    if (!this.isSupported()) return false
    if (Notification.permission !== "granted") return false

    try {
      const { title, body, icon, tag, data, onClick } = options

      const notification = new Notification(title, {
        body,
        icon: icon || "/icons/icon-192x192.png",
        tag,
        data,
      })

      if (onClick) {
        notification.onclick = () => {
          notification.close()
          onClick()
        }
      }

      return true
    } catch (error) {
      console.error("通知の送信に失敗しました:", error)
      return false
    }
  }
}

export const notificationService = NotificationService.getInstance()

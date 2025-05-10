"use client"

/**
 * 通知デバッグユーティリティ
 * 通知機能のテストとデバッグに使用します
 */
export const debugNotification = {
  /**
   * 通知のサポート状況を確認
   */
  checkSupport(): boolean {
    const isSupported = "Notification" in window
    console.log("[通知デバッグ] 通知サポート状況:", isSupported)
    return isSupported
  },

  /**
   * 現在の通知権限を確認
   */
  checkPermission(): NotificationPermission {
    if (!this.checkSupport()) {
      console.log("[通知デバッグ] 通知がサポートされていません")
      return "denied"
    }

    const permission = Notification.permission
    console.log("[通知デバッグ] 現在の通知権限:", permission)
    return permission
  },

  /**
   * 通知権限をリクエスト
   */
  async requestPermission(): Promise<boolean> {
    if (!this.checkSupport()) {
      console.log("[通知デバッグ] 通知がサポートされていないため権限をリクエストできません")
      return false
    }

    try {
      console.log("[通知デバッグ] 通知権限をリクエストします")
      const result = await Notification.requestPermission()
      console.log("[通知デバッグ] 通知権限リクエスト結果:", result)
      return result === "granted"
    } catch (error) {
      console.error("[通知デバッグ] 通知権限のリクエストに失敗しました:", error)
      return false
    }
  },

  /**
   * テスト通知を送信
   */
  async sendTestNotification(title = "テスト通知", body = "これはテスト通知です"): Promise<boolean> {
    console.log("[通知デバッグ] テスト通知を送信します")

    if (!this.checkSupport()) {
      console.log("[通知デバッグ] 通知がサポートされていないためテスト通知を送信できません")
      return false
    }

    const permission = this.checkPermission()
    if (permission !== "granted") {
      console.log("[通知デバッグ] 通知権限がないためテスト通知を送信できません")
      return false
    }

    try {
      console.log("[通知デバッグ] 通知を作成します:", { title, body })
      const notification = new Notification(title, {
        body,
        icon: "/icons/icon-192x192.png",
        tag: "test-notification",
      })

      notification.onclick = () => {
        console.log("[通知デバッグ] テスト通知がクリックされました")
        notification.close()
      }

      console.log("[通知デバッグ] テスト通知を送信しました")
      return true
    } catch (error) {
      console.error("[通知デバッグ] テスト通知の送信に失敗しました:", error)
      return false
    }
  },

  /**
   * 通知機能の全体チェック
   */
  async checkAll(): Promise<{
    supported: boolean
    permission: NotificationPermission
    granted: boolean
    testSent: boolean
  }> {
    console.log("[通知デバッグ] 通知機能の全体チェックを開始します")

    const supported = this.checkSupport()
    const permission = this.checkPermission()

    let granted = false
    let testSent = false

    if (supported) {
      if (permission === "default") {
        granted = await this.requestPermission()
      } else {
        granted = permission === "granted"
      }

      if (granted) {
        testSent = await this.sendTestNotification()
      }
    }

    const result = { supported, permission, granted, testSent }
    console.log("[通知デバッグ] 通知機能の全体チェック結果:", result)
    return result
  },
}

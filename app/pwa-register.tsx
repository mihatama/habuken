"use client"

import { useEffect, useState } from "react"

export function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)

  useEffect(() => {
    // beforeinstallpromptイベントをキャプチャ
    const handleBeforeInstallPrompt = (e: Event) => {
      // デフォルトの動作を防止
      e.preventDefault()
      // 後で使用するためにイベントを保存
      setInstallPrompt(e)
      console.log("[PWA] インストールプロンプトが利用可能です")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any)

    // プロダクション環境でのみService Workerを登録
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      const registerServiceWorker = async () => {
        try {
          // 通常のService Worker登録（プロダクション環境用）
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          })
          console.log("[PWA] Service Worker 登録成功:", registration.scope)
        } catch (error) {
          console.error("[PWA] Service Worker 登録失敗:", error)
          // エラーが発生しても致命的にならないよう、アプリは通常通り動作させる
        }
      }

      // ページ読み込み完了後にService Workerを登録
      if (document.readyState === "complete") {
        registerServiceWorker()
      } else {
        window.addEventListener("load", registerServiceWorker)
        return () => window.removeEventListener("load", registerServiceWorker)
      }
    } else {
      // 開発環境またはService Workerがサポートされていない場合
      console.log("[PWA] 開発環境またはService Workerがサポートされていないため、登録をスキップします")
    }

    // クリーンアップ
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any)
    }
  }, [])

  // インストールプロンプトをグローバルに公開（他のコンポーネントで使用するため）
  if (typeof window !== "undefined") {
    ;(window as any).deferredPrompt = installPrompt
  }

  return null
}

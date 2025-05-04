"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    // すでにPWAとして実行されているか確認
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsPWA(true)
      return
    }

    // インストールプロンプトイベントを保存
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // PWAのインストール状態を確認
    const checkInstallState = () => {
      // iOS Safari用の判定（ホーム画面から起動されたかどうか）
      if (navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) {
        setIsPWA(true)
        return
      }

      // PWAがインストール可能かどうかの判定
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => {
            if (registrations.length > 0) {
              setIsInstallable(true)
            }
          })
          .catch(() => {
            // エラーが発生しても致命的にならないよう無視
          })
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", () => {
      setInstallPrompt(null)
      setIsInstallable(false)
      setIsPWA(true)
    })

    // 初期状態をチェック
    checkInstallState()

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  // インストールプロンプトが表示されない場合のフォールバック
  const handleManualInstall = () => {
    // インストールプロンプトがある場合はそれを使用
    if (installPrompt) {
      installPrompt.prompt()
      return
    }

    // インストールガイドページへ移動
    window.location.href = "/install-guide"
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    // ローカルストレージに保存して一定期間表示しないようにする
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString())
  }

  // すでにPWAとして実行されている場合や、プロンプトが非表示の場合は何も表示しない
  if (isPWA || isDismissed || !isInstallable) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <div className="flex items-center">
        <div className="mr-3">
          <Download className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h3 className="font-medium">アプリをインストール</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">より快適にご利用いただけます</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleDismiss} className="flex items-center">
          <X className="h-4 w-4 mr-1" />
          閉じる
        </Button>
        <Button onClick={handleManualInstall} size="sm" className="flex items-center">
          <Download className="h-4 w-4 mr-1" />
          インストール
        </Button>
      </div>
    </div>
  )
}

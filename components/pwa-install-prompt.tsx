"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

declare global {
  interface Window {
    deferredPrompt: BeforeInstallPromptEvent | null
  }
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [manualPrompt, setManualPrompt] = useState(false)

  useEffect(() => {
    // PWAがすでにインストールされているかチェック
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
      setIsInstalled(true)
      return
    }

    // インストールプロンプトイベントをキャプチャ
    const handler = (e: Event) => {
      // イベントをキャンセルして後で使用するために保存
      e.preventDefault()
      // グローバルに保存してデバッグしやすくする
      window.deferredPrompt = e as BeforeInstallPromptEvent
      console.log("beforeinstallprompt イベントが発火しました", e)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // 5秒後に手動プロンプトを表示（イベントが発火しない場合のフォールバック）
    const timer = setTimeout(() => {
      if (!showPrompt && !isInstalled) {
        setManualPrompt(true)
      }
    }, 5000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      clearTimeout(timer)
    }
  }, [showPrompt, isInstalled])

  const handleInstallClick = async () => {
    if (window.deferredPrompt) {
      try {
        window.deferredPrompt.prompt()
        const { outcome } = await window.deferredPrompt.userChoice
        console.log(`ユーザーの選択: ${outcome}`)

        if (outcome === "accepted") {
          console.log("アプリがインストールされました")
          setIsInstalled(true)
        }

        // プロンプトは一度しか使えないので、使用後はnullに設定
        window.deferredPrompt = null
      } catch (error) {
        console.error("インストールプロンプトエラー:", error)
      }
    } else {
      // 手動インストール手順を表示
      window.location.href = "/install-guide"
    }

    setShowPrompt(false)
    setManualPrompt(false)
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
    setManualPrompt(false)
  }

  if (isInstalled) return null

  if (showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium">現助アプリをインストール</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">ホーム画面に追加してオフラインでも使用できます</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={dismissPrompt}>
            <X className="h-4 w-4 mr-1" />
            後で
          </Button>
          <Button size="sm" onClick={handleInstallClick}>
            <Download className="h-4 w-4 mr-1" />
            インストール
          </Button>
        </div>
      </div>
    )
  }

  if (manualPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50">
        <div className="flex-1 mb-3">
          <p className="font-medium">現助アプリをインストールしませんか？</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chromeメニュー(⋮)から「アプリをインストール」を選択するか、下のボタンをクリックしてください。
          </p>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={dismissPrompt}>
            <X className="h-4 w-4 mr-1" />
            閉じる
          </Button>
          <Button size="sm" onClick={handleInstallClick}>
            <Download className="h-4 w-4 mr-1" />
            インストール方法を表示
          </Button>
        </div>
      </div>
    )
  }

  return null
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useRouter } from "next/navigation"

export function InstallButton() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // PWAがすでにインストールされているかチェック
    const checkIfInstalled = () => {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true)
      }
    }

    // インストール可能かチェック
    const checkIfInstallable = () => {
      setIsInstallable(!!window.deferredPrompt)
    }

    // beforeinstallpromptイベントをキャプチャ
    const handleBeforeInstallPrompt = () => {
      setIsInstallable(true)
    }

    // appinstalledイベントをキャプチャ
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
    }

    checkIfInstalled()
    checkIfInstallable()

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    // 定期的にチェック（プロンプトが遅れて利用可能になる場合があるため）
    const intervalId = setInterval(checkIfInstallable, 3000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      clearInterval(intervalId)
    }
  }, [])

  const handleInstallClick = async () => {
    const deferredPrompt = (window as any).deferredPrompt

    if (deferredPrompt) {
      // インストールプロンプトを表示
      deferredPrompt.prompt()

      // ユーザーの選択を待つ
      const { outcome } = await deferredPrompt.userChoice
      console.log(`ユーザーの選択: ${outcome}`)(
        // プロンプトは一度しか使用できないため、nullに設定
        window as any,
      ).deferredPrompt = null
      setIsInstallable(false)
    } else {
      // インストールプロンプトが利用できない場合は、インストールガイドページに移動
      router.push("/install-guide")
    }
  }

  // インストール済みの場合は表示しない
  if (isInstalled) {
    return null
  }

  return (
    <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleInstallClick}>
      <Download className="mr-2 h-4 w-4" />
      アプリをインストール
    </Button>
  )
}

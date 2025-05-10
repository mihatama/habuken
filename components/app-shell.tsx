"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { OfflineIndicator } from "@/components/offline-indicator"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // PWAモードで実行されているかチェック
    const checkStandalone = () => {
      const isInStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true

      setIsStandalone(isInStandaloneMode)

      // PWAモードの場合はbodyにクラスを追加
      if (isInStandaloneMode) {
        document.body.classList.add("pwa-mode")
      } else {
        document.body.classList.remove("pwa-mode")
      }
    }

    checkStandalone()

    // display-modeの変更を監視
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    const handleChange = () => checkStandalone()

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
    } else {
      // 古いブラウザ向け
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange)
      } else {
        // 古いブラウザ向け
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  // ログイン画面などでヘッダーを表示しない
  const hideHeaderPaths = ["/login", "/signup", "/forgot-password", "/reset-password"]
  const showHeader = !hideHeaderPaths.includes(pathname)

  return (
    <div className={`relative flex min-h-screen w-full flex-col ${isStandalone ? "pwa-container" : "mobile-no-wrap"}`}>
      {showHeader && <Header />}
      <OfflineIndicator />
      <div className={`flex-1 w-full overflow-x-auto ${showHeader ? "pt-16 sm:pt-20 pb-4" : ""}`}>{children}</div>
    </div>
  )
}

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { OfflineIndicator } from "@/components/offline-indicator"
import { useOnlineStatus } from "@/hooks/use-online-status"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const isOnline = useOnlineStatus()
  const [isPWA, setIsPWA] = useState(false)

  // PWAモードの検出
  useEffect(() => {
    // スタンドアロンモード（ホーム画面から起動）の場合はPWAとして扱う
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    // iOS Safariでは別の方法で検出
    const isIOSStandalone =
      window.navigator.standalone ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches

    setIsPWA(isStandalone || isIOSStandalone)

    // PWAモードの場合、bodyにクラスを追加
    if (isStandalone || isIOSStandalone) {
      document.body.classList.add("pwa-mode")
    }
  }, [])

  // ログイン画面ではヘッダーを表示しない
  const hideHeader = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(pathname)

  return (
    <div className={isPWA ? "pwa-container" : "min-h-screen"}>
      {!hideHeader && <Header />}
      {!isOnline && <OfflineIndicator />}
      <main className="pt-16 pb-4 px-2 sm:px-4 w-full max-w-[1600px] mx-auto">{children}</main>
    </div>
  )
}

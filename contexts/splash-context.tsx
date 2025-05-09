"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface SplashContextType {
  showSplash: boolean
  hideSplash: () => void
}

const SplashContext = createContext<SplashContextType | undefined>(undefined)

// セッション期間（24時間 = 86400000ミリ秒）
const SESSION_DURATION = 86400000

export function SplashProvider({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // ローカルストレージからスプラッシュ表示状態を取得
    const splashShown = localStorage.getItem("splashShown")
    const currentPath = window.location.pathname

    // 初回訪問時またはセッションが切れた場合のみスプラッシュを表示
    // ただし、ログインページ(/login)では表示しない
    if ((!splashShown || Date.now() - Number.parseInt(splashShown) > SESSION_DURATION) && currentPath !== "/login") {
      setShowSplash(true)
      localStorage.setItem("splashShown", Date.now().toString())
    } else {
      setShowSplash(false)
    }
  }, [])

  const hideSplash = () => setShowSplash(false)

  return <SplashContext.Provider value={{ showSplash, hideSplash }}>{children}</SplashContext.Provider>
}

export function useSplash() {
  const context = useContext(SplashContext)
  if (context === undefined) {
    throw new Error("useSplash must be used within a SplashProvider")
  }
  return context
}

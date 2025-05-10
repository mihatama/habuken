"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface SplashContextType {
  showSplash: boolean
  hideSplash: () => void
}

const SplashContext = createContext<SplashContextType | undefined>(undefined)

export function SplashProvider({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    // クライアントサイドでしか動かないようチェック
    if (typeof window !== "undefined") {
      // ローカルストレージからスプラッシュ表示状態を取得
      const splashShown = localStorage.getItem("splashShown")
      const currentPath = window.location.pathname

      // 初回訪問時のみスプラッシュを表示
      // ただし、ログインページ(/login)では表示しない
      if (!splashShown && currentPath !== "/login") {
        setShowSplash(true)
        localStorage.setItem("splashShown", "true")
      } else {
        setShowSplash(false)
      }
    }
  }, [])

  const hideSplash = () => {
    setShowSplash(false)
    localStorage.setItem("splashShown", "true") // スプラッシュを非表示にしたことを記録
  }

  return <SplashContext.Provider value={{ showSplash, hideSplash }}>{children}</SplashContext.Provider>
}

export function useSplash() {
  const context = useContext(SplashContext)
  if (context === undefined) {
    throw new Error("useSplash must be used within a SplashProvider")
  }
  return context
}

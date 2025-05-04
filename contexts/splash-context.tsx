"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface SplashContextType {
  showSplash: boolean
  hideSplash: () => void
}

const SplashContext = createContext<SplashContextType | undefined>(undefined)

export function SplashProvider({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // スプラッシュ画面を4秒後に自動的に非表示にする
    // (アニメーションが3.5秒なので、少し余裕を持たせる)
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 4000)

    return () => clearTimeout(timer)
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

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSplash } from "@/contexts/splash-context"
import Image from "next/image"
// auth contextからユーザー情報を取得
import { useAuth } from "@/contexts/auth-context"

export function SplashScreen() {
  const { isVisible, setIsVisible } = useSplash()
  const { user } = useAuth()

  // ユーザーがログインしている場合はスプラッシュスクリーンを表示しない
  if (!isVisible || user) {
    return null
  }

  const { showSplash, hideSplash } = useSplash()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)

    // 現在のパスを取得
    const currentPath = window.location.pathname

    // ログインページの場合は即座に非表示にする
    if (currentPath === "/login") {
      hideSplash()
      return
    }

    // 3秒後に自動的に非表示にする
    const timer = setTimeout(() => {
      hideSplash()
    }, 3000)

    return () => clearTimeout(timer)
  }, [hideSplash])

  // タップでスキップする機能
  const handleSkip = () => {
    hideSplash()
  }

  if (!showSplash) return null

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleSkip}
        >
          <div className="text-center">
            <div className="relative w-64 h-64 mx-auto mb-8 animate-fade-in-blur">
              <Image src="/habukensetsu-togo.png" alt="羽布建設" fill className="object-contain" priority />
            </div>
            <p className="text-muted-foreground animate-fade-in-blur" style={{ animationDelay: "0.5s" }}>
              タップしてスキップ
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

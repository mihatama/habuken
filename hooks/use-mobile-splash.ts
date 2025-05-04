"use client"

import { useState, useEffect } from "react"
import { useSplash } from "@/contexts/splash-context"

export function useMobileSplash() {
  const [isMobile, setIsMobile] = useState(false)
  const { showSplash, hideSplash } = useSplash()

  useEffect(() => {
    // モバイルデバイスかどうかを検出
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // 初期チェック
    checkIfMobile()

    // リサイズイベントのリスナーを追加
    window.addEventListener("resize", checkIfMobile)

    // クリーンアップ
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // デスクトップではスプラッシュ画面を表示しない
  useEffect(() => {
    if (!isMobile) {
      hideSplash()
    }
  }, [isMobile, hideSplash])

  return {
    isMobile,
    showSplash: isMobile && showSplash,
  }
}

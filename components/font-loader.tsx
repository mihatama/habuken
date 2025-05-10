"use client"

import { useEffect, useState } from "react"

export function FontLoader() {
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    // フォントが既に読み込まれているか確認
    if (document.querySelector('link[href*="Noto+Serif+JP"]')) {
      setFontsLoaded(true)
      return
    }

    // フォントを動的に読み込む（必要な場合のみ）
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&display=swap"
    link.rel = "stylesheet"

    // フォント読み込みの最適化
    link.media = "print" // 初期状態では非表示
    link.onload = () => {
      link.media = "all" // 読み込み完了後に表示
      setFontsLoaded(true)
    }

    document.head.appendChild(link)

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  return null
}

"use client"

import { useEffect } from "react"

export function FontLoader() {
  useEffect(() => {
    // フォントを動的に読み込む
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  return null
}

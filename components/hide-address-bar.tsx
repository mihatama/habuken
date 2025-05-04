"use client"

import { useEffect } from "react"

export function HideAddressBar() {
  useEffect(() => {
    // アドレスバーを隠す関数
    const hideAddressBar = () => {
      // モバイルデバイスかどうかを確認
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      if (isMobile) {
        // iOS Safariの場合
        if (/iPhone|iPad|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent)) {
          window.scrollTo(0, 1)
        }

        // Androidの場合
        else if (/Android/.test(navigator.userAgent)) {
          // フルスクリーンAPIが利用可能な場合
          if (document.documentElement.requestFullscreen) {
            // ユーザージェスチャーが必要なため、ここでは直接呼び出さない
            // 代わりにCSSでビューポートを調整
            document.body.style.minHeight = "100vh"
            document.body.style.overscrollBehavior = "none"
          }
        }
      }
    }

    // ページ読み込み時とリサイズ時にアドレスバーを隠す
    window.addEventListener("load", hideAddressBar)
    window.addEventListener("resize", hideAddressBar)

    // スクロール時にアドレスバーを隠す（モバイルブラウザ向け）
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        hideAddressBar()
      }
    })

    // クリーンアップ関数
    return () => {
      window.removeEventListener("load", hideAddressBar)
      window.removeEventListener("resize", hideAddressBar)
      window.removeEventListener("scroll", hideAddressBar)
    }
  }, [])

  return null
}

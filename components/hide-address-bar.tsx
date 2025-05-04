"use client"

import { useEffect } from "react"

export function HideAddressBar() {
  useEffect(() => {
    // アドレスバーを隠す関数
    const hideAddressBar = () => {
      if (document.documentElement.scrollTop === 0) {
        // iOSの場合は1pxスクロールする
        window.scrollTo(0, 1)
      }

      // フルスクリーンAPIが利用可能な場合は使用する
      const docElm = document.documentElement
      if (docElm.requestFullscreen) {
        // 標準
        docElm.requestFullscreen().catch(() => {
          // エラーは無視
        })
      } else if ((docElm as any).mozRequestFullScreen) {
        // Firefox
        ;(docElm as any).mozRequestFullScreen()
      } else if ((docElm as any).webkitRequestFullscreen) {
        // Chrome, Safari
        ;(docElm as any).webkitRequestFullscreen()
      } else if ((docElm as any).msRequestFullscreen) {
        // IE/Edge
        ;(docElm as any).msRequestFullscreen()
      }
    }

    // ページ読み込み時とリサイズ時にアドレスバーを隠す
    window.addEventListener("load", hideAddressBar)
    window.addEventListener("resize", hideAddressBar)
    window.addEventListener("orientationchange", hideAddressBar)

    // 初回実行
    setTimeout(hideAddressBar, 300)

    return () => {
      window.removeEventListener("load", hideAddressBar)
      window.removeEventListener("resize", hideAddressBar)
      window.removeEventListener("orientationchange", hideAddressBar)
    }
  }, [])

  return null
}

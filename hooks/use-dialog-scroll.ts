"use client"

import { useEffect } from "react"

/**
 * ダイアログが開いているときのスクロール動作を制御するフック
 *
 * @param isOpen ダイアログが開いているかどうか
 * @param allowBackgroundScroll 背景のスクロールを許可するかどうか（デフォルト: false）
 * @param scrollToTopOnOpen ダイアログが開いたときに先頭にスクロールするかどうか（デフォルト: true）
 */
export function useDialogScroll(isOpen: boolean, allowBackgroundScroll = false, scrollToTopOnOpen = true): void {
  useEffect(() => {
    if (typeof document === "undefined") return

    const body = document.body
    const originalStyle = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    }

    if (isOpen) {
      // ダイアログが開いたとき
      if (!allowBackgroundScroll) {
        // スクロールバーの幅を計算して、その分だけpaddingを追加
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
        body.style.overflow = "hidden"
        body.style.paddingRight = `${scrollbarWidth}px`
      }

      // ダイアログ内のスクロール可能な要素を探して先頭にスクロール
      if (scrollToTopOnOpen) {
        setTimeout(() => {
          const dialogContent = document.querySelector(".dialog-content-scroll")
          if (dialogContent) {
            dialogContent.scrollTop = 0
          }
        }, 10)
      }
    } else {
      // ダイアログが閉じたとき
      if (!allowBackgroundScroll) {
        // 元のスタイルに戻す
        body.style.overflow = originalStyle.overflow
        body.style.paddingRight = originalStyle.paddingRight
      }
    }

    // クリーンアップ関数
    return () => {
      if (!allowBackgroundScroll) {
        body.style.overflow = originalStyle.overflow
        body.style.paddingRight = originalStyle.paddingRight
      }
    }
  }, [isOpen, allowBackgroundScroll, scrollToTopOnOpen])
}

"use client"

import { useEffect, useRef } from "react"

/**
 * ダイアログのスクロール問題を解決するためのカスタムフック
 * @param isOpen ダイアログが開いているかどうか
 * @param allowBackgroundScroll 背景のスクロールを許可するかどうか
 */
export function useDialogScroll(isOpen: boolean, allowBackgroundScroll = false) {
  const previousBodyPosition = useRef<string>("")
  const previousBodyOverflow = useRef<string>("")
  const previousScrollY = useRef<number>(0)

  useEffect(() => {
    if (typeof document === "undefined") return

    if (isOpen) {
      // ダイアログが開いたときの処理
      if (allowBackgroundScroll) {
        // 背景のスクロールを許可する場合は何もしない
        return
      }

      // 現在の状態を保存
      previousBodyPosition.current = document.body.style.position
      previousBodyOverflow.current = document.body.style.overflow
      previousScrollY.current = window.scrollY

      // スクロールをロック
      document.body.style.position = "fixed"
      document.body.style.top = `-${previousScrollY.current}px`
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"
    } else {
      // ダイアログが閉じたときの処理
      if (document.body.style.position === "fixed") {
        // 元の状態に戻す
        document.body.style.position = previousBodyPosition.current
        document.body.style.top = ""
        document.body.style.width = ""
        document.body.style.overflow = previousBodyOverflow.current

        // スクロール位置を復元
        window.scrollTo(0, previousScrollY.current)
      }
    }

    return () => {
      // コンポーネントのアンマウント時にクリーンアップ
      if (document.body.style.position === "fixed") {
        document.body.style.position = previousBodyPosition.current
        document.body.style.top = ""
        document.body.style.width = ""
        document.body.style.overflow = previousBodyOverflow.current
        window.scrollTo(0, previousScrollY.current)
      }
    }
  }, [isOpen, allowBackgroundScroll])
}

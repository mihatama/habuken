import type React from "react"
/**
 * ダイアログのスクロール問題を解決するためのユーティリティ関数
 */

/**
 * ダイアログが開いたときに背景のスクロールをロックするかどうかを制御する
 * @param lock スクロールをロックするかどうか
 */
export function controlBodyScroll(lock: boolean): void {
  if (typeof document === "undefined") return

  const body = document.body

  if (lock) {
    // スクロール位置を保存
    const scrollY = window.scrollY
    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.width = "100%"
  } else {
    // スクロール位置を復元
    const scrollY = body.style.top ? Number.parseInt(body.style.top.replace("-", "")) : 0
    body.style.position = ""
    body.style.top = ""
    body.style.width = ""
    window.scrollTo(0, scrollY)
  }
}

/**
 * ダイアログ内のコンテンツが長い場合にスクロールを有効にする
 * @param dialogRef ダイアログのRef
 */
export function enableDialogScroll(dialogRef: React.RefObject<HTMLDivElement>): void {
  if (!dialogRef.current) return

  const dialogContent = dialogRef.current.querySelector('[role="dialog"]')
  if (dialogContent) {
    dialogContent.classList.add("dialog-content-scroll")
  }
}

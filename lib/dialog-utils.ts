/**
 * ダイアログ関連のユーティリティ関数
 */

/**
 * ダイアログが開いているときに背景のスクロールを制御する
 * @param allow 背景のスクロールを許可するかどうか
 */
export function allowBackgroundScroll(allow: boolean): void {
  if (typeof document === "undefined") return

  const body = document.body

  if (allow) {
    // スクロールを許可
    body.style.removeProperty("overflow")
    body.style.removeProperty("padding-right")
  } else {
    // スクロールを禁止
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = "hidden"
    body.style.paddingRight = `${scrollbarWidth}px`
  }
}

/**
 * ダイアログのコンテンツ部分にスクロール可能なスタイルを適用する
 * @param dialogContentElement ダイアログのコンテンツ要素
 * @param maxHeight 最大高さ（デフォルト: 90vh）
 */
export function makeDialogScrollable(dialogContentElement: HTMLElement | null, maxHeight = "90vh"): void {
  if (!dialogContentElement) return

  dialogContentElement.style.maxHeight = maxHeight
  dialogContentElement.style.overflow = "auto"
  dialogContentElement.classList.add("dialog-content-scroll")
}

/**
 * ダイアログが画面からはみ出さないように位置を調整する
 * @param dialogElement ダイアログ要素
 */
export function adjustDialogPosition(dialogElement: HTMLElement | null): void {
  if (!dialogElement) return

  const rect = dialogElement.getBoundingClientRect()
  const windowHeight = window.innerHeight

  if (rect.height > windowHeight) {
    dialogElement.style.height = `${windowHeight - 40}px`
    dialogElement.style.top = "20px"
  }
}

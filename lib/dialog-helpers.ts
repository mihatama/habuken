/**
 * ダイアログのスクロール問題を解決するためのヘルパー関数
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
    body.style.overflow = "hidden"
  } else {
    // スクロール位置を復元
    const scrollY = body.style.top ? Number.parseInt(body.style.top.replace("-", "")) : 0
    body.style.position = ""
    body.style.top = ""
    body.style.width = ""
    body.style.overflow = ""
    window.scrollTo(0, scrollY)
  }
}

/**
 * ダイアログが開いているときに背景のスクロールを許可する
 * @param allow 背景のスクロールを許可するかどうか
 */
export function allowBackgroundScroll(allow: boolean): void {
  if (typeof document === "undefined") return

  const body = document.body

  if (allow) {
    body.classList.add("dialog-allow-bg-scroll")
  } else {
    body.classList.remove("dialog-allow-bg-scroll")
  }
}

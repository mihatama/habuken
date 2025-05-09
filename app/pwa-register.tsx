"use client"

import { useEffect } from "react"

// ログイン後の処理を遅延させないように調整
export function PWARegister() {
  useEffect(() => {
    // PWA登録処理を低優先度で実行
    const registerSW = () => {
      if ("serviceWorker" in navigator) {
        window.requestIdleCallback(() => {
          navigator.serviceWorker.register("/sw.js").then(
            (registration) => {
              console.log("Service Worker registration successful with scope: ", registration.scope)
            },
            (err) => {
              console.log("Service Worker registration failed: ", err)
            },
          )
        })
      }
    }

    // ページロード完了後に実行
    if (document.readyState === "complete") {
      registerSW()
    } else {
      window.addEventListener("load", registerSW)
      return () => window.removeEventListener("load", registerSW)
    }
  }, [])

  return null
}

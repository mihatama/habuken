"use client"

import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker 登録成功:", registration.scope)
          })
          .catch((error) => {
            console.log("Service Worker 登録失敗:", error)
          })
      })
    } else {
      console.log("このブラウザはService Workerをサポートしていません")
    }
  }, [])

  return null
}

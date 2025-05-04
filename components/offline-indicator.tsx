"use client"

import { useOnlineStatus } from "@/hooks/use-online-status"
import { WifiOff } from "lucide-react"
import { useEffect, useState } from "react"

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const [showIndicator, setShowIndicator] = useState(false)

  // オフラインになった時だけ表示し、一定時間後に自動的に非表示にする
  useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true)
    } else {
      // オンラインに戻った場合は少し遅延させて非表示にする
      const timer = setTimeout(() => {
        setShowIndicator(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  if (!showIndicator) return null

  return (
    <div
      className={`fixed top-16 inset-x-0 z-50 flex justify-center pointer-events-none transition-opacity duration-300 ${isOnline ? "opacity-0" : "opacity-100"}`}
    >
      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-md shadow-md flex items-center">
        <WifiOff className="h-4 w-4 mr-2" />
        {isOnline ? "オンラインに戻りました" : "オフラインモードです"}
      </div>
    </div>
  )
}

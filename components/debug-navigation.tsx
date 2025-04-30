"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function DebugNavigation() {
  const pathname = usePathname()
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])

  useEffect(() => {
    console.log(`Navigation changed to: ${pathname}`)
    setNavigationHistory((prev) => [...prev, pathname])
  }, [pathname])

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm p-4 bg-black/80 text-white rounded-lg text-xs">
      <h4 className="font-bold mb-2">Navigation Debug</h4>
      <p>Current: {pathname}</p>
      <p className="mt-2 font-bold">History:</p>
      <ul className="mt-1 max-h-32 overflow-auto">
        {navigationHistory.slice(-10).map((path, i) => (
          <li key={i}>{path}</li>
        ))}
      </ul>
    </div>
  )
}

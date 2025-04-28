"use client"

import { useEffect } from "react"
import { useRouter } from "next/router"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // ダッシュボードにリダイレクト
    router.replace("/dashboard")
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <p>リダイレクト中...</p>
    </div>
  )
}

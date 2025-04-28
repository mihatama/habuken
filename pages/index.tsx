"use client"

import { useRouter } from "next/router"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard")
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <p>リダイレクト中...</p>
    </div>
  )
}

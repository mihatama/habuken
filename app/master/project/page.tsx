"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function ProjectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/deals/register")
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">リダイレクト中...</span>
    </div>
  )
}

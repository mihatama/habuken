"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Lock, Mail } from "lucide-react"

export function InlineLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = getClientSupabase()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // ログイン成功
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("ログインエラー:", error)
      setError("ログインできませんでした。メールアドレスとパスワードを確認してくださいね。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col md:flex-row gap-2 items-end">
      <div className="relative">
        <Mail className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="pl-8 h-9 w-full md:w-auto"
        />
      </div>
      <div className="relative">
        <Lock className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="pl-8 h-9 w-full md:w-auto"
        />
      </div>
      <Button type="submit" disabled={loading} size="sm">
        {loading ? "ログイン中..." : "システムに入る"}
      </Button>
      {error && <p className="text-xs text-red-500 absolute top-full left-0 mt-1">{error}</p>}
    </form>
  )
}

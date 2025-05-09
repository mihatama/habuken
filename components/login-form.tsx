"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getClientSupabase } from "@/lib/supabase-utils"
import { useCsrf } from "@/hooks/use-csrf"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { csrfToken } = useCsrf()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = getClientSupabase()

      // CSRFトークンをヘッダーに追加
      const { error } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        },
      )

      if (error) {
        throw error
      }

      // ログイン成功
      setLoading(false) // 先にローディング状態を解除
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("ログインエラー:", error)
      setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">ログイン</h1>
        <p className="text-gray-500">アカウントにログインしてください</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            メールアドレス
          </label>
          <Input
            id="email"
            type="email"
            placeholder="info@mihatama.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium">
              パスワード
            </label>
            <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">
              パスワードをお忘れですか？
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white">
          {loading ? "ログイン中..." : "ログイン"}
        </Button>
      </form>
    </div>
  )
}

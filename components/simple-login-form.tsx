"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock } from "lucide-react"
import { getClientSupabase } from "@/lib/supabase-utils"

export function SimpleLoginForm() {
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
      setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleLogin} className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Mail size={18} />
          </div>
          <input
            type="email"
            id="email"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Lock size={18} />
          </div>
          <input
            type="password"
            id="password"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="text-white bg-[#0f172a] hover:bg-[#1e293b] font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full sm:w-auto whitespace-nowrap"
        >
          {loading ? "ログイン中..." : "システムにアクセス"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

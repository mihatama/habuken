import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default function Home() {
  // クライアントサイドでのリダイレクトを避けるため、
  // クッキーベースでの簡易的な認証チェック
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.has("logged_in") || process.env.NODE_ENV === "development"

  // 開発環境またはログイン済みの場合はダッシュボードへ
  if (isLoggedIn) {
    redirect("/dashboard")
  } else {
    // それ以外はログインページへ
    redirect("/login")
  }

  // リダイレクトが機能しない場合のフォールバック
  // 実際にはこのコードは実行されない
  return (
    <div className="flex h-screen items-center justify-center">
      <p>リダイレクト中...</p>
    </div>
  )
}

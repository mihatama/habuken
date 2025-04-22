import { redirect } from "next/navigation"

export const dynamic = "force-static"

export default function Home() {
  // 静的エクスポートでは cookies() は使用できないため、
  // 単純なリダイレクトに変更
  redirect("/login")

  // リダイレクトが機能しない場合のフォールバック
  // 実際にはこのコードは実行されない
  return (
    <div className="flex h-screen items-center justify-center">
      <p>リダイレクト中...</p>
    </div>
  )
}

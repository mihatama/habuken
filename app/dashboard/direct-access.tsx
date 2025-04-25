"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function DirectAccess() {
  const router = useRouter()

  useEffect(() => {
    // ページが直接アクセスされたことをコンソールに記録
    console.log("ダッシュボードに直接アクセスされました", {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
    })
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleClearAndRefresh = () => {
    // ローカルストレージとセッションストレージをクリア
    try {
      localStorage.clear()
      sessionStorage.clear()
      console.log("ストレージをクリアしました")
    } catch (e) {
      console.error("ストレージのクリアに失敗しました:", e)
    }

    // ページをリロード
    window.location.reload()
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>ダッシュボードへのアクセスに問題があります</AlertTitle>
        <AlertDescription>認証状態に問題がある可能性があります。以下のオプションをお試しください。</AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Button onClick={handleRefresh} className="w-full">
          ページを再読み込み
        </Button>

        <Button onClick={handleClearAndRefresh} variant="outline" className="w-full">
          ストレージをクリアして再読み込み
        </Button>

        <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
          ログインページに戻る
        </Button>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>問題が解決しない場合は、ブラウザのキャッシュをクリアするか、別のブラウザでお試しください。</p>
      </div>
    </div>
  )
}

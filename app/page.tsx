import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-4xl font-bold">現助 - プロジェクト管理システム</h1>
        <p className="text-xl text-gray-600">建設現場の業務を効率化するプロジェクト管理ツール</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              ログイン
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              システムにアクセス
            </Button>
          </Link>
        </div>
        <div className="mt-8 text-sm text-gray-500">
          <p>管理者アカウント: info@mihatama.com / 123456!</p>
        </div>
      </div>
    </div>
  )
}

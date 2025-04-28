import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold">現助 - プロジェクト管理システム</h1>
        <p className="text-xl text-gray-600">建設現場の業務を効率化するプロジェクト管理ツール</p>
        <div className="mt-8">
          <Link href="/dashboard">
            <Button size="lg" className="px-8 py-6 text-lg">
              システムにアクセス
            </Button>
          </Link>
        </div>
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">主な機能</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <li className="bg-white p-4 rounded-lg shadow-sm">
              <span className="font-medium">プロジェクト管理</span>: 建設プロジェクトの計画と進捗管理
            </li>
            <li className="bg-white p-4 rounded-lg shadow-sm">
              <span className="font-medium">リソース割り当て</span>: 人員、機材、車両の効率的な配置
            </li>
            <li className="bg-white p-4 rounded-lg shadow-sm">
              <span className="font-medium">日報・安全管理</span>: 日次報告と安全パトロール記録
            </li>
            <li className="bg-white p-4 rounded-lg shadow-sm">
              <span className="font-medium">スケジュール管理</span>: カレンダーベースの視覚的なスケジュール
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

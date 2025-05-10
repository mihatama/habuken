import { Suspense } from "react"
import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardClient } from "./dashboard-client"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "一覧表示 | 工事管理システム",
  description: "現場カレンダーと割り当て状況を一目で確認できるダッシュボード",
}

export default function DashboardPage() {
  return (
    <DashboardLayout title="一覧表示" description="現場カレンダーと割り当て状況を一目で確認できます">
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-xl" />
            ))}
            <Skeleton className="col-span-full h-[300px] rounded-xl" />
            <Skeleton className="col-span-full md:col-span-2 h-[300px] rounded-xl" />
            <Skeleton className="col-span-full md:col-span-2 h-[300px] rounded-xl" />
          </div>
        }
      >
        <DashboardClient />
      </Suspense>
    </DashboardLayout>
  )
}
// ダッシュボードページのローディング状態を最適化して、ログイン後のローディングを最小化します

// ダッシュボードページのコンポーネントが即座に表示されるように、必要に応じて修正します
// 具体的な修正内容はファイルの内容によって異なりますが、
// Suspense や loading.tsx の使用を最適化して、ログイン後のローディングを最小化します

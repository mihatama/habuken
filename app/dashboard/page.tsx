import { NavMenu } from "@/components/nav-menu"
import { FontLoader } from "@/components/font-loader"

export default function DashboardPage() {
  return (
    <>
      <FontLoader />
      <div className="min-h-screen flex flex-col">
        <NavMenu />
        <main className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>
          {/* ダッシュボードの内容 */}
        </main>
      </div>
    </>
  )
}

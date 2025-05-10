import { StorageSetup } from "@/components/storage-setup"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "ストレージ管理",
}

export default function StorageManagementPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">ストレージ管理</h1>
      <p className="mb-6 text-gray-600">
        このページでは、アプリケーションで使用するストレージバケットとフォルダの設定を管理できます。
      </p>

      <StorageSetup />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">ストレージ機能をテスト</h2>
        <p className="mb-4 text-gray-600">
          ストレージのセットアップが完了したら、ファイルアップロード機能が正常に動作するかテストできます。
        </p>
        <Link href="/admin/storage/test">
          <Button variant="outline">アップロードテストページへ</Button>
        </Link>
      </div>
    </div>
  )
}

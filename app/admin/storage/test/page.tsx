import { FileUploadTest } from "@/components/file-upload-test"

export const metadata = {
  title: "ファイルアップロードテスト",
}

export default function FileUploadTestPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">ファイルアップロードテスト</h1>
      <p className="mb-6 text-gray-600">
        このページでは、Supabaseストレージへのファイルアップロード機能をテストできます。
        ファイルを選択してアップロードし、正常に機能するか確認してください。
      </p>

      <FileUploadTest />

      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h3 className="font-medium text-blue-800">テスト手順</h3>
        <ol className="mt-2 ml-5 list-decimal text-blue-700">
          <li>「ファイルを選択」ボタンをクリックして、テスト用のファイルを選択します</li>
          <li>アップロードが自動的に開始されます</li>
          <li>アップロードが成功すると、ファイルのURLが表示されます</li>
          <li>URLをクリックして、ファイルが正しくアクセスできることを確認します</li>
        </ol>
      </div>
    </div>
  )
}

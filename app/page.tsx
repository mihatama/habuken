export const dynamic = "force-static"

export default function Home() {
  // 静的エクスポートでは、このリダイレクトは実際には機能しませんが、
  // フォールバックとして残しておきます
  // 実際のリダイレクトはpublic/index.htmlで行います
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">リダイレクト中...</h1>
      <p className="mb-4">自動的にログインページにリダイレクトされます。</p>
      <a href="/login/" className="text-blue-600 hover:underline">
        リダイレクトされない場合はこちらをクリック
      </a>
    </div>
  )
}

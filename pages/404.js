export default function Custom404() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-4 text-2xl font-bold">404 - ページが見つかりません</h2>
      <p className="mb-6 max-w-md text-gray-600">お探しのページは存在しないか、移動された可能性があります。</p>
      <a
        href="/"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        ホームに戻る
      </a>
    </div>
  )
}

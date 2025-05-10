import { NotificationDebug } from "@/components/notification-debug"

export default function NotificationDebugPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">通知デバッグツール</h1>
      <p className="mb-6 text-gray-600">
        通知機能の問題を診断するためのツールです。通知が来ない場合は、このページで診断を実行してください。
      </p>
      <NotificationDebug />

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">通知が来ない場合のチェックリスト</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>ブラウザが通知をサポートしているか確認してください</li>
          <li>通知権限が「許可」になっているか確認してください</li>
          <li>ブラウザの設定で通知がブロックされていないか確認してください</li>
          <li>Service Workerが正しく登録されているか確認してください</li>
          <li>リア��タイムサブスクリプションが正しく機能しているか確認してください</li>
          <li>コンソールログでエラーが発生していないか確認してください</li>
        </ul>
      </div>
    </div>
  )
}

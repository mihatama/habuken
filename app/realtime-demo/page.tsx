import { RealtimeDataExample } from "@/components/realtime-data-example"

export default function RealtimeDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Supabaseリアルタイムデモ</h1>
      <p className="mb-6">
        このページでは、Supabaseのリアルタイム機能のデモを表示しています。
        データベースの変更がリアルタイムで反映されます。
      </p>

      <div className="grid gap-6">
        <RealtimeDataExample />
      </div>
    </div>
  )
}

import { SupportedLanguagesV0 } from "@/components/supported-languages-v0"

export default function V0Page() {
  return (
    <main className="space-y-4 p-4">
      <h1 className="text-xl font-bold">バージョン0でサポートされている自然言語</h1>
      <SupportedLanguagesV0 />
      {/* ここに他の v0 固有の UI を追加 */}
    </main>
  )
}

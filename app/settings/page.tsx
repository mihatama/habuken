import { Header } from "@/components/header"
import { SettingsTabs } from "@/components/settings-tabs"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">設定</h1>
          <SettingsTabs />
        </div>
      </main>
    </div>
  )
}

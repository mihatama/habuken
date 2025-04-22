import { Header } from "@/components/header"
import { SettingsTabs } from "@/components/settings-tabs"

export default function SettingsPage() {
  // 設定タブのアイテムを定義
  const settingsTabItems = [
    { title: "一般設定", href: "/settings/general" },
    { title: "アカウント", href: "/settings/account" },
    { title: "通知", href: "/settings/notifications" },
    { title: "セキュリティ", href: "/settings/security" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">設定</h1>
          <SettingsTabs items={settingsTabItems} />
        </div>
      </main>
    </div>
  )
}

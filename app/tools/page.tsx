import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ToolList } from "@/components/tool-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToolCalendar } from "@/components/tool-calendar"

export const metadata: Metadata = {
  title: "備品管理 | 建設業務管理システム",
  description: "備品・工具の登録、編集、使用状況管理を行います",
}

export default function ToolsPage() {
  return (
    <DashboardLayout
      title="備品管理"
      description="備品・工具の登録、編集、使用状況管理を行います。備品の貸出状況や予約が確認できます。"
      isAdmin={false}
    >
      <div className="flex flex-col space-y-6">
        <Tabs defaultValue="list" className="mb-6">
          <TabsList>
            <TabsTrigger value="list">リスト表示</TabsTrigger>
            <TabsTrigger value="calendar">カレンダー表示</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-4">
            <ToolList />
          </TabsContent>
          <TabsContent value="calendar" className="mt-4">
            <ToolCalendar />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

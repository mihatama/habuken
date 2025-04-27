import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StaffList } from "@/components/staff-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StaffCalendar } from "@/components/staff-calendar"
import { VacationList } from "@/components/vacation-list"

export const metadata: Metadata = {
  title: "スタッフ管理 | 建設業務管理システム",
  description: "スタッフの登録、編集、シフト管理を行います",
}

export default function StaffPage() {
  return (
    <DashboardLayout
      title="スタッフ管理"
      description="スタッフの登録、編集、シフト管理を行います。スタッフの情報更新や休暇申請の確認ができます。"
      isAdmin={true}
    >
      <div className="flex flex-col space-y-6">
        <Tabs defaultValue="list" className="mb-6">
          <TabsList>
            <TabsTrigger value="list">リスト表示</TabsTrigger>
            <TabsTrigger value="calendar">カレンダー表示</TabsTrigger>
            <TabsTrigger value="vacation">年休一覧</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-4">
            <StaffList />
          </TabsContent>
          <TabsContent value="calendar" className="mt-4">
            <StaffCalendar />
          </TabsContent>
          <TabsContent value="vacation" className="mt-4">
            <VacationList />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

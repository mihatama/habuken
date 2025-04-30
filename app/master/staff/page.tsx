import type { Metadata } from "next"
import { StaffList } from "@/components/staff-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StaffCalendar } from "@/components/staff-calendar"
import { VacationList } from "@/components/vacation-list"

export const metadata: Metadata = {
  title: "スタッフ管理 | 建設業務管理システム",
  description: "スタッフの登録、編集、休暇管理を行います",
}

export default function StaffPage() {
  return (
    <div className="container mx-auto p-6 pt-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">スタッフ管理</h1>
        <p className="text-muted-foreground">
          スタッフの登録、編集、休暇管理を行います。スタッフの情報更新や休暇申請の確認ができます。
        </p>
      </div>

      <div className="flex flex-col space-y-6">
        <Tabs defaultValue="list" className="mb-6">
          <TabsList>
            <TabsTrigger value="list">リスト表示</TabsTrigger>
            <TabsTrigger value="calendar">休暇カレンダー</TabsTrigger>
            <TabsTrigger value="vacation">休暇一覧</TabsTrigger>
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
    </div>
  )
}

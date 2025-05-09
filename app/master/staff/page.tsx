import type { Metadata } from "next"
import { StaffList } from "@/components/staff-list"
import { SortableStaffList } from "@/components/sortable-staff-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "スタッフ管理 | 建設業務管理システム",
  description: "スタッフの登録、編集、休暇管理を行います",
}

export default function StaffPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">スタッフ管理</h1>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">一覧</TabsTrigger>
          <TabsTrigger value="sort">並び替え</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <StaffList />
        </TabsContent>

        <TabsContent value="sort">
          <SortableStaffList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

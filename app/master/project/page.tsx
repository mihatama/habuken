import type { Metadata } from "next"
import { ProjectList } from "@/components/project-list"
import { SortableProjectList } from "@/components/sortable-project-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "案件管理 | 工事管理システム",
  description: "案件の登録や編集ができます",
}

export default function ProjectPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">プロジェクト管理</h1>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">一覧</TabsTrigger>
          <TabsTrigger value="sort">並び替え</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <ProjectList />
        </TabsContent>

        <TabsContent value="sort">
          <SortableProjectList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

import type { Metadata } from "next"
import ToolsPageClient from "./tools-page-client"
import { SortableToolList } from "@/components/sortable-tool-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Box } from "lucide-react"

export const metadata: Metadata = {
  title: "備品管理 | 建設業務管理システム",
  description: "備品・工具の登録、編集、使用状況管理を行います",
}

export default function ToolsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Box className="h-6 w-6" />
        工具管理
      </h1>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">一覧</TabsTrigger>
          <TabsTrigger value="sort">並び替え</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <ToolsPageClient />
        </TabsContent>

        <TabsContent value="sort">
          <SortableToolList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

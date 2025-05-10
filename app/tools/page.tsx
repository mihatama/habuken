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

      <Tabs defaultValue="list">

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

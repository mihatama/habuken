import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToolList } from "@/components/tool-list"
import { ToolCalendar } from "@/components/tool-calendar"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function ToolsPage({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams.category || "all"

  // カテゴリーに基づいてページタイトルを取得する関数を修正
  const getPageTitle = () => {
    if (category === "tool") return "工具一覧"
    if (category === "vehicle") return "車両一覧"
    if (category === "machinery") return "重機一覧"
    return "機材一覧"
  }

  return (
    <DashboardLayout title={getPageTitle()}>
      <div className="container mx-auto py-6">
        <Tabs defaultValue="list">
          <TabsList className="mb-4">
            <TabsTrigger value="list">リスト表示</TabsTrigger>
            <TabsTrigger value="calendar">カレンダー表示</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <ToolList />
          </TabsContent>
          <TabsContent value="calendar">
            <ToolCalendar />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

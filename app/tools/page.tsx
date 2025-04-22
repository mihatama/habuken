import { Header } from "@/components/header"
import { ToolList } from "@/components/tool-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ToolsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">工具一覧</h1>
          <Tabs defaultValue="list" className="mb-6">
            <TabsList>
              <TabsTrigger value="list">リスト表示</TabsTrigger>
              <TabsTrigger value="calendar">カレンダー表示</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-4">
              <ToolList />
            </TabsContent>
            <TabsContent value="calendar" className="mt-4">
              {/* ToolCalendarコンポーネントがあれば表示 */}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

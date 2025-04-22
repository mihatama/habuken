import { Header } from "@/components/header"
import { StaffList } from "@/components/staff-list"
import { StaffCalendar } from "@/components/staff-calendar"
import { VacationList } from "@/components/vacation-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StaffPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">スタッフ一覧</h1>

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
      </main>
    </div>
  )
}

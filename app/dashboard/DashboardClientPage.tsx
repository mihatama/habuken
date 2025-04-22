"use client"
import { Header } from "@/components/header"
import { CalendarView } from "@/components/calendar-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShiftManagement } from "@/components/shift-management"

export default function DashboardClientPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">スケジュール管理</h1>

          <Tabs defaultValue="calendar" className="mb-6">
            <TabsList>
              <TabsTrigger value="calendar">カレンダー表示</TabsTrigger>
              <TabsTrigger value="shift">シフト管理</TabsTrigger>
            </TabsList>
            <TabsContent value="calendar" className="mt-4">
              <CalendarView />
            </TabsContent>
            <TabsContent value="shift" className="mt-4">
              <ShiftManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

"use client"
import { Header } from "@/components/header"
import { CalendarView } from "@/components/calendar-view"

export default function DashboardClientPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">スケジュール管理</h1>
          <CalendarView />
        </div>
      </main>
    </div>
  )
}

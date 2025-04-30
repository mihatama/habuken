"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToolCalendar } from "@/components/tool-calendar"
import { ToolList } from "@/components/tool-list"
import { CreateToolReservationsTable } from "@/components/create-tool-reservations-table"

export default function ToolsPageClient() {
  const [activeTab, setActiveTab] = useState("list")

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">備品管理</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">備品一覧</TabsTrigger>
          <TabsTrigger value="calendar">カレンダー</TabsTrigger>
          <TabsTrigger value="admin">管理</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <ToolList />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <ToolCalendar />
        </TabsContent>

        <TabsContent value="admin" className="mt-6">
          <CreateToolReservationsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}

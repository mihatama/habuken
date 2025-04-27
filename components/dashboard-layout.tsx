"use client"

import type { ReactNode } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StaffList } from "@/components/staff-list"
import { VacationList } from "@/components/vacation-list"
import { ToolList } from "@/components/tool-list"

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function DashboardLayout({ children, title = "ダッシュボード", description }: DashboardLayoutProps) {
  return (
    <div className="container">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        {description && <p className="text-muted-foreground">{description}</p>}
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">カレンダー</TabsTrigger>
            <TabsTrigger value="staff">スタッフ</TabsTrigger>
            <TabsTrigger value="vacation">休暇</TabsTrigger>
            <TabsTrigger value="tools">工具</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="space-y-4">
            {children}
          </TabsContent>
          <TabsContent value="staff" className="space-y-4">
            <StaffList />
          </TabsContent>
          <TabsContent value="vacation" className="space-y-4">
            <VacationList />
          </TabsContent>
          <TabsContent value="tools" className="space-y-4">
            <ToolList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

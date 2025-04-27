"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectCalendar } from "@/components/project-calendar"
import { StaffCalendar } from "@/components/staff-calendar"
import { ToolCalendar } from "./tool-calendar"

type CalendarViewProps = {
  activeView?: string
  timeframe?: string
}

export function CalendarView({ activeView = "project", timeframe = "month" }: CalendarViewProps) {
  const [view, setView] = useState(activeView)

  return (
    <Card>
      <CardContent className="p-0 sm:p-6">
        <Tabs defaultValue={view} onValueChange={setView}>
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="project">案件別</TabsTrigger>
            <TabsTrigger value="staff">スタッフ別</TabsTrigger>
            <TabsTrigger value="machinery">重機</TabsTrigger>
            <TabsTrigger value="vehicle">車両</TabsTrigger>
            <TabsTrigger value="equipment">備品</TabsTrigger>
          </TabsList>
          <TabsContent value="project">
            <ProjectCalendar timeframe={timeframe} />
          </TabsContent>
          <TabsContent value="staff">
            <StaffCalendar timeframe={timeframe} />
          </TabsContent>
          <TabsContent value="machinery">
            <ToolCalendar timeframe={timeframe} category="machinery" />
          </TabsContent>
          <TabsContent value="vehicle">
            <ToolCalendar timeframe={timeframe} category="vehicle" />
          </TabsContent>
          <TabsContent value="equipment">
            <ToolCalendar timeframe={timeframe} category="equipment" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

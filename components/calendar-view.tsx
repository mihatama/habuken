"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectCalendar } from "@/components/project-calendar"
import { StaffCalendar } from "@/components/staff-calendar"
import { ToolCalendar } from "@/components/tool-calendar"
import type { CalendarViewType, TimeframeType } from "@/types/calendar"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

type CalendarViewProps = {
  activeView?: CalendarViewType
  timeframe?: TimeframeType
}

export function CalendarView({ activeView = "project", timeframe = "month" }: CalendarViewProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [view, setView] = useState<CalendarViewType>((searchParams.get("view") as CalendarViewType) || activeView)
  const [currentTimeframe, setCurrentTimeframe] = useState<TimeframeType>(
    (searchParams.get("timeframe") as TimeframeType) || timeframe,
  )

  // URLパラメータが変更されたときにステートを更新
  useEffect(() => {
    const viewParam = searchParams.get("view") as CalendarViewType
    const timeframeParam = searchParams.get("timeframe") as TimeframeType

    if (viewParam && viewParam !== view) {
      setView(viewParam)
    }

    if (timeframeParam && timeframeParam !== currentTimeframe) {
      setCurrentTimeframe(timeframeParam)
    }
  }, [searchParams, view, currentTimeframe])

  // ビューが変更されたときにURLパラメータを更新
  const handleViewChange = (newView: CalendarViewType) => {
    setView(newView)

    // URLパラメータを更新
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", newView)
    router.push(`${pathname}?${params.toString()}`)
  }

  // タイムフレームが変更されたときにURLパラメータを更新
  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    setCurrentTimeframe(newTimeframe)

    // URLパラメータを更新
    const params = new URLSearchParams(searchParams.toString())
    params.set("timeframe", newTimeframe)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>カレンダー</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={view} value={view} onValueChange={(value) => handleViewChange(value as CalendarViewType)}>
          <TabsList className="mb-4">
            <TabsTrigger value="project">案件別</TabsTrigger>
            <TabsTrigger value="staff">スタッフ別</TabsTrigger>
            <TabsTrigger value="tool">機材</TabsTrigger>
          </TabsList>
          <TabsContent value="project">
            <ProjectCalendar timeframe={currentTimeframe} />
          </TabsContent>
          <TabsContent value="staff">
            <StaffCalendar timeframe={currentTimeframe} />
          </TabsContent>
          <TabsContent value="tool">
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">すべて</TabsTrigger>
                <TabsTrigger value="machinery">重機</TabsTrigger>
                <TabsTrigger value="vehicle">車両</TabsTrigger>
                <TabsTrigger value="equipment">備品</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <ToolCalendar timeframe={currentTimeframe} />
              </TabsContent>
              <TabsContent value="machinery">
                <ToolCalendar timeframe={currentTimeframe} category="machinery" />
              </TabsContent>
              <TabsContent value="vehicle">
                <ToolCalendar timeframe={currentTimeframe} category="vehicle" />
              </TabsContent>
              <TabsContent value="equipment">
                <ToolCalendar timeframe={currentTimeframe} category="equipment" />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

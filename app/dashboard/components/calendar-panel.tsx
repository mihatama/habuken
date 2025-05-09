"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectCalendar } from "@/components/project-calendar"
import { StaffCalendar } from "@/components/staff-calendar"
import { HeavyMachineryCalendar } from "@/components/heavy-machinery-calendar"
import { VehicleCalendar } from "@/components/vehicle-calendar"
import { ToolCalendar } from "@/components/tool-calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CalendarPanel() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>カレンダー</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="project">
          <TabsList className="mb-4">
            <TabsTrigger value="project">案件</TabsTrigger>
            <TabsTrigger value="staff">スタッフ</TabsTrigger>
            <TabsTrigger value="machinery">重機</TabsTrigger>
            <TabsTrigger value="vehicle">車両</TabsTrigger>
            <TabsTrigger value="tool">工具</TabsTrigger>
          </TabsList>

          <TabsContent value="project">
            <ProjectCalendar />
          </TabsContent>

          <TabsContent value="staff">
            <StaffCalendar />
          </TabsContent>

          <TabsContent value="machinery">
            <HeavyMachineryCalendar />
          </TabsContent>

          <TabsContent value="vehicle">
            <VehicleCalendar />
          </TabsContent>

          <TabsContent value="tool">
            <ToolCalendar />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

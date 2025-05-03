"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectCalendar } from "@/components/project-calendar"
import { StaffCalendar } from "@/components/staff-calendar"
import { HeavyMachineryCalendar } from "@/components/heavy-machinery-calendar"
import { VehicleCalendar } from "@/components/vehicle-calendar"
import { ToolCalendar } from "@/components/tool-calendar"

export function CalendarPanel() {
  return (
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
  )
}

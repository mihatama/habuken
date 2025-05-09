"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StaffCalendar } from "@/components/staff-calendar"
import { HeavyMachineryCalendar } from "@/components/heavy-machinery-calendar"
import { VehicleCalendar } from "@/components/vehicle-calendar"
import { ToolCalendar } from "@/components/tool-calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DealResourceCalendar } from "@/components/deal-resource-calendar"

export function CalendarPanel() {
  const [activeTab, setActiveTab] = useState("deals")

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>カレンダー</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deals" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="deals">案件</TabsTrigger>
            <TabsTrigger value="machinery">重機</TabsTrigger>
            <TabsTrigger value="vehicle">車両</TabsTrigger>
            <TabsTrigger value="staff">スタッフ</TabsTrigger>
            <TabsTrigger value="tool">工具</TabsTrigger>
          </TabsList>

          <TabsContent value="deals">
            <DealResourceCalendar embedded={true} />
          </TabsContent>

          <TabsContent value="machinery">
            <HeavyMachineryCalendar embedded={true} />
          </TabsContent>

          <TabsContent value="vehicle">
            <VehicleCalendar embedded={true} />
          </TabsContent>

          <TabsContent value="staff">
            <StaffCalendar />
          </TabsContent>

          <TabsContent value="tool">
            <ToolCalendar />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

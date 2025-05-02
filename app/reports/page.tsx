"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyWorkReportList } from "@/components/daily-work-report-list"
import { SafetyPatrolLog } from "@/components/safety-patrol-log"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("daily")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">現場報告</h1>
        <p className="text-muted-foreground">
          日報や安全パトロール記録などの現場報告を管理します。報告書の作成や閲覧ができます。
        </p>
      </div>

      <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="daily">日報作成</TabsTrigger>
          <TabsTrigger value="safety">安全・環境巡視日誌</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <DailyWorkReportList />
        </TabsContent>
        <TabsContent value="safety">
          <SafetyPatrolLog />
        </TabsContent>
      </Tabs>
    </div>
  )
}

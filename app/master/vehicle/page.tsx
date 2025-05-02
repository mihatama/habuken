"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleManagement } from "@/components/vehicle-management"
import { VehicleCostAnalysis } from "@/components/vehicle-cost-analysis"

export default function VehiclePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">車両管理</h1>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">一覧表示</TabsTrigger>
          <TabsTrigger value="cost">コスト分析</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <VehicleManagement />
        </TabsContent>

        <TabsContent value="cost">
          <VehicleCostAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  )
}

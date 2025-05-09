"use client"

import { SortableVehicleList } from "@/components/sortable-vehicle-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleManagement } from "@/components/vehicle-management"

export default function VehiclePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">車両管理</h1>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">一覧</TabsTrigger>
          <TabsTrigger value="sort">並び替え</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <VehicleManagement />
        </TabsContent>

        <TabsContent value="sort">
          <SortableVehicleList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

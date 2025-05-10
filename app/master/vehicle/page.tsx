"use client"

import { VehicleManagement } from "@/components/vehicle-management"

export default function VehiclePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">車両管理</h1>
      <VehicleManagement />
    </div>
  )
}

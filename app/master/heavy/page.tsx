"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HeavyMachineryManagement } from "@/components/heavy-machinery-management"
import { HeavyMachineryCostAnalysis } from "@/components/heavy-machinery-cost-analysis"

export default function HeavyMachineryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">重機管理</h1>
          </div>

          <Tabs defaultValue="list" className="mb-6">
            <TabsList>
              <TabsTrigger value="list">一覧表示</TabsTrigger>
              <TabsTrigger value="cost">コスト分析</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-4">
              <HeavyMachineryManagement />
            </TabsContent>
            <TabsContent value="cost" className="mt-4">
              <HeavyMachineryCostAnalysis />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

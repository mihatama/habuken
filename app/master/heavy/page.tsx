"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { PenToolIcon as Tool, Calendar } from "lucide-react"
import { HeavyMachineryManagement } from "@/components/heavy-machinery-management"
import { HeavyMachineryCostAnalysis } from "@/components/heavy-machinery-cost-analysis"

export default function HeavyMachineryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">重機管理</h1>

          <Tabs defaultValue="list" className="mb-6">
            <TabsList>
              <TabsTrigger value="list">一覧表示</TabsTrigger>
              <TabsTrigger value="calendar">カレンダー表示</TabsTrigger>
              <TabsTrigger value="cost">コスト分析</TabsTrigger>
              <TabsTrigger value="maintenance">整備スケジュール</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-4">
              <HeavyMachineryManagement />
            </TabsContent>
            <TabsContent value="calendar" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    <div className="text-center p-12">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">重機カレンダー</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        重機の稼働スケジュールをカレンダー形式で表示します。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="cost" className="mt-4">
              <HeavyMachineryCostAnalysis />
            </TabsContent>
            <TabsContent value="maintenance" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    <div className="text-center p-12">
                      <Tool className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">整備スケジュール</h3>
                      <p className="mt-2 text-sm text-muted-foreground">重機の点検・整備スケジュールを管理します。</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

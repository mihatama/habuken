"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DealRegistrationForm } from "@/components/deal-registration-form"
import { EnhancedDealsList } from "@/components/enhanced-deals-list"
import { DealResourceCalendar } from "@/components/deal-resource-calendar"
import { FileText, List, Calendar } from "lucide-react"

export function DealRegistrationTabs() {
  const [activeTab, setActiveTab] = useState("register")

  return (
    <Tabs defaultValue="register" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="register" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>案件登録</span>
        </TabsTrigger>
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          <span>案件リスト</span>
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>カレンダー</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="register" className="mt-0">
        <DealRegistrationForm />
      </TabsContent>

      <TabsContent value="list" className="mt-0">
        <EnhancedDealsList />
      </TabsContent>

      <TabsContent value="calendar" className="mt-0">
        <DealResourceCalendar />
      </TabsContent>
    </Tabs>
  )
}

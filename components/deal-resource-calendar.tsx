"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { EnhancedCalendar } from "@/components/enhanced-calendar"
import { Users, Truck, Car, Key } from "lucide-react"

// サンプルイベントデータ
const sampleEvents = [
  {
    id: "1",
    title: "東京オフィスビル改修工事",
    start: new Date(2023, 5, 1),
    end: new Date(2023, 7, 31),
    resourceType: "deal",
    resourceId: "1",
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "大阪マンション新築工事",
    start: new Date(2023, 6, 15),
    end: new Date(2024, 0, 20),
    resourceType: "deal",
    resourceId: "2",
    color: "#10b981",
  },
  {
    id: "3",
    title: "名古屋商業施設リノベーション",
    start: new Date(2023, 4, 10),
    end: new Date(2023, 8, 30),
    resourceType: "deal",
    resourceId: "3",
    color: "#f59e0b",
  },
  // スタッフのイベント
  {
    id: "s1",
    title: "山田太郎",
    start: new Date(2023, 5, 1),
    end: new Date(2023, 5, 15),
    resourceType: "staff",
    resourceId: "s1",
    dealId: "1",
    color: "#60a5fa",
  },
  {
    id: "s2",
    title: "佐藤次郎",
    start: new Date(2023, 5, 10),
    end: new Date(2023, 6, 10),
    resourceType: "staff",
    resourceId: "s2",
    dealId: "1",
    color: "#60a5fa",
  },
  // 重機のイベント
  {
    id: "h1",
    title: "バックホウ #1",
    start: new Date(2023, 5, 5),
    end: new Date(2023, 6, 5),
    resourceType: "heavy",
    resourceId: "h1",
    dealId: "1",
    color: "#f97316",
  },
  // 車両のイベント
  {
    id: "v1",
    title: "トラック #1",
    start: new Date(2023, 5, 1),
    end: new Date(2023, 7, 31),
    resourceType: "vehicle",
    resourceId: "v1",
    dealId: "1",
    color: "#84cc16",
  },
  // 備品のイベント
  {
    id: "t1",
    title: "電動ドリル #3",
    start: new Date(2023, 5, 1),
    end: new Date(2023, 5, 20),
    resourceType: "tool",
    resourceId: "t1",
    dealId: "1",
    color: "#8b5cf6",
  },
]

// リソースタイプのオプション
const resourceTypeOptions = [
  { value: "all", label: "すべて" },
  { value: "staff", label: "スタッフ", icon: Users },
  { value: "heavy", label: "重機", icon: Truck },
  { value: "vehicle", label: "車両", icon: Car },
  { value: "tool", label: "備品", icon: Key },
]

// サンプルリソースデータ
const sampleResources = {
  staff: [
    { id: "s1", name: "山田太郎" },
    { id: "s2", name: "佐藤次郎" },
    { id: "s3", name: "鈴木三郎" },
  ],
  heavy: [
    { id: "h1", name: "バックホウ #1" },
    { id: "h2", name: "クレーン #1" },
  ],
  vehicle: [
    { id: "v1", name: "トラック #1" },
    { id: "v2", name: "軽トラック #1" },
  ],
  tool: [
    { id: "t1", name: "電動ドリル #3" },
    { id: "t2", name: "安全ヘルメット #10" },
  ],
}

export function DealResourceCalendar() {
  const [resourceType, setResourceType] = useState("all")
  const [selectedResource, setSelectedResource] = useState("")

  // フィルタリングされたイベントを取得
  const filteredEvents = sampleEvents.filter((event) => {
    if (resourceType === "all") return true
    if (event.resourceType === resourceType) {
      if (selectedResource === "" || selectedResource === "all") return true
      return event.resourceId === selectedResource
    }
    return false
  })

  // 選択されたリソースタイプに基づいてリソースオプションを取得
  const getResourceOptions = () => {
    if (resourceType === "all" || resourceType === "") return []
    return sampleResources[resourceType as keyof typeof sampleResources] || []
  }

  const resourceOptions = getResourceOptions()

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="resource-type">リソースタイプ</Label>
              <Select value={resourceType} onValueChange={setResourceType}>
                <SelectTrigger id="resource-type" className="w-full">
                  <SelectValue placeholder="リソースタイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        {option.icon && <option.icon className="h-4 w-4 mr-2" />}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {resourceType !== "all" && resourceOptions.length > 0 && (
              <div>
                <Label htmlFor="resource">リソース</Label>
                <Select value={selectedResource} onValueChange={setSelectedResource}>
                  <SelectTrigger id="resource" className="w-full">
                    <SelectValue placeholder="リソースを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {resourceOptions.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EnhancedCalendar
        events={filteredEvents}
        readOnly={true}
        onEventClick={(event) => {
          console.log("イベントがクリックされました:", event)
        }}
      />
    </div>
  )
}

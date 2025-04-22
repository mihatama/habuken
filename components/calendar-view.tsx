"use client"

import { useState } from "react"
import { CalendarViewSelector, type ViewType, type TimeframeType } from "./calendar-view-selector"
import { ProjectCalendar } from "./project-calendar"
import { StaffCalendar } from "./staff-calendar"
import { ToolCalendar } from "./tool-calendar"

// モックデータ
const events = [
  {
    id: 1,
    title: "案件A（1名）",
    date: new Date(2025, 3, 15),
    startTime: "09:00",
    endTime: "12:00",
    staff: ["石川", "エル", "A.スコット"],
    location: "東京都品川区上大崎2丁目-21 KOHSHIN HOUSE 1B号室",
    tools: ["プロジェクター"],
    color: "bg-blue-100 border-blue-300",
  },
  {
    id: 2,
    title: "案件B（16名）",
    date: new Date(2025, 3, 15),
    startTime: "10:00",
    endTime: "14:45",
    staff: ["A.スコット", "参宮池沙希", "石川", "エル", "大谷"],
    location: "東京都品川区上大崎2丁目-21 KOHSHIN HOUSE 1B号室",
    tools: ["AppleWatch"],
    color: "bg-red-100 border-red-300",
  },
  {
    id: 3,
    title: "案件C（2名）",
    date: new Date(2025, 3, 16),
    startTime: "09:00",
    endTime: "15:00",
    staff: ["エル", "大谷"],
    location: "東京都品川区上大崎2丁目-21 KOHSHIN HOUSE 1B号室",
    tools: ["プロジェクター"],
    color: "bg-green-100 border-green-300",
  },
]

// イベントの型定義
interface CalendarEvent {
  id: number
  title: string
  date: Date
  startTime: string
  endTime: string
  staff: string[]
  location: string
  tools: string[]
  color: string
}

// 日本語の曜日配列をメモ化
const DAYS_OF_WEEK = ["日", "月", "火", "水", "木", "金", "土"]

// インターフェースを追加
interface CalendarViewProps {
  activeView?: ViewType
  timeframe?: TimeframeType
}

export function CalendarView({
  activeView: initialView = "project",
  timeframe: initialTimeframe = "month",
}: CalendarViewProps) {
  const [activeView, setActiveView] = useState<ViewType>(initialView)
  const [timeframe, setTimeframe] = useState<TimeframeType>(initialTimeframe)

  return (
    <div className="space-y-4">
      <CalendarViewSelector
        activeView={activeView}
        setActiveView={setActiveView}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
      />

      <div className="mt-4">
        {activeView === "project" && <ProjectCalendar timeframe={timeframe} />}
        {activeView === "staff" && <StaffCalendar timeframe={timeframe} />}
        {activeView === "resource" && <ToolCalendar timeframe={timeframe} />}
        {activeView === "timeline" && (
          <div className="p-8 text-center border rounded-lg">
            <h3 className="text-lg font-medium">タイムラインビュー</h3>
            <p className="text-muted-foreground">開発中の機能です。近日公開予定。</p>
          </div>
        )}
      </div>
    </div>
  )
}

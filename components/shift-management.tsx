"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/ja"
import "react-big-calendar/lib/css/react-big-calendar.css"

// 日本語ロケールを設定
moment.locale("ja")
const localizer = momentLocalizer(moment)

// シフトの型定義
interface Shift {
  id: number
  title: string
  start: Date
  end: Date
  staffId: string
  staffName: string
  projectId?: number
  projectName?: string
}

// サンプルシフトデータ
const sampleShifts: Shift[] = [
  {
    id: 1,
    title: "山田太郎: 現場A",
    start: new Date(2023, 2, 1, 8, 0),
    end: new Date(2023, 2, 1, 17, 0),
    staffId: "1",
    staffName: "山田太郎",
    projectId: 1,
    projectName: "現場A",
  },
  {
    id: 2,
    title: "佐藤次郎: 現場B",
    start: new Date(2023, 2, 2, 8, 0),
    end: new Date(2023, 2, 2, 17, 0),
    staffId: "2",
    staffName: "佐藤次郎",
    projectId: 2,
    projectName: "現場B",
  },
  {
    id: 3,
    title: "鈴木三郎: 現場C",
    start: new Date(2023, 2, 3, 8, 0),
    end: new Date(2023, 2, 3, 17, 0),
    staffId: "3",
    staffName: "鈴木三郎",
    projectId: 3,
    projectName: "現場C",
  },
]

export function ShiftManagement() {
  const [shifts, setShifts] = useState<Shift[]>(sampleShifts)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "agenda">("week")
  const [currentDate, setCurrentDate] = useState(new Date())

  // イベントのスタイルをカスタマイズ
  const eventStyleGetter = (event: Shift) => {
    // スタッフIDに基づいて色を変更
    let backgroundColor = "#3174ad"

    if (event.staffId) {
      const staffIndex = Number.parseInt(event.staffId) % 5
      const colors = ["#3174ad", "#ff8c00", "#008000", "#9932cc", "#ff4500"]
      backgroundColor = colors[staffIndex]
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>シフト管理</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <TabsList>
                <TabsTrigger value="month">月表示</TabsTrigger>
                <TabsTrigger value="week">週表示</TabsTrigger>
                <TabsTrigger value="day">日表示</TabsTrigger>
                <TabsTrigger value="agenda">リスト</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              今日
            </Button>
          </div>

          <Button variant="default" size="sm">
            シフト追加
          </Button>
        </div>

        <div style={{ height: 700 }}>
          <Calendar
            localizer={localizer}
            events={shifts}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={["month", "week", "day", "agenda"]}
            view={viewMode}
            onView={(view) => setViewMode(view as any)}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            eventPropGetter={eventStyleGetter}
            messages={{
              today: "今日",
              previous: "前へ",
              next: "次へ",
              month: "月",
              week: "週",
              day: "日",
              agenda: "リスト",
              date: "日付",
              time: "時間",
              event: "イベント",
              allDay: "終日",
              showMore: (total) => `他 ${total} 件`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

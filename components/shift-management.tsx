"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"

// モックデータ
const staffShifts = [
  {
    id: 1,
    name: "目黒太郎",
    shifts: [
      { day: 3, type: "日勤" },
      { day: 5, type: "夜勤" },
      { day: 6, type: "日勤" },
      { day: 8, type: "日勤" },
      { day: 9, type: "日勤" },
      { day: 11, type: "夜勤" },
    ],
  },
  {
    id: 2,
    name: "駒方孝市",
    shifts: [
      { day: 1, type: "夜勤" },
      { day: 2, type: "夜勤" },
      { day: 3, type: "日勤" },
      { day: 4, type: "日勤" },
      { day: 7, type: "日勤" },
      { day: 8, type: "日勤" },
      { day: 9, type: "夜勤" },
      { day: 11, type: "夜勤" },
    ],
  },
  {
    id: 3,
    name: "石川遼",
    shifts: [
      { day: 1, type: "夜勤" },
      { day: 3, type: "日勤" },
      { day: 5, type: "日勤" },
      { day: 6, type: "夜勤" },
      { day: 8, type: "日勤" },
      { day: 10, type: "夜勤" },
      { day: 12, type: "日勤" },
    ],
  },
  {
    id: 4,
    name: "フィル",
    shifts: [
      { day: 4, type: "有給" },
      { day: 6, type: "日勤" },
      { day: 8, type: "夜勤" },
      { day: 10, type: "日勤" },
      { day: 12, type: "夜勤" },
    ],
  },
  {
    id: 5,
    name: "エル",
    shifts: [
      { day: 2, type: "夜勤" },
      { day: 6, type: "夜勤" },
      { day: 8, type: "夜勤" },
      { day: 10, type: "有給" },
    ],
  },
  {
    id: 6,
    name: "A.スコット",
    shifts: [
      { day: 3, type: "夜勤" },
      { day: 4, type: "夜勤" },
      { day: 7, type: "日勤" },
      { day: 11, type: "夜勤" },
    ],
  },
  {
    id: 7,
    name: "参宮池沙希",
    shifts: [
      { day: 3, type: "有給" },
      { day: 5, type: "有給" },
      { day: 7, type: "有給" },
    ],
  },
]

export function ShiftManagement() {
  const [currentDate, setCurrentDate] = useState(new Date(2023, 6, 1))
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStaff = staffShifts.filter((staff) => staff.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getShiftType = (staffId: number, day: number) => {
    const staff = staffShifts.find((s) => s.id === staffId)
    if (!staff) return null

    const shift = staff.shifts.find((s) => s.day === day)
    return shift ? shift.type : null
  }

  const renderShiftCell = (staffId: number, day: number) => {
    const shiftType = getShiftType(staffId, day)

    if (!shiftType) return <div className="h-10 border-b border-r"></div>

    let bgColor = ""
    let textColor = ""

    switch (shiftType) {
      case "日勤":
        bgColor = "bg-amber-100"
        textColor = "text-amber-800"
        break
      case "夜勤":
        bgColor = "bg-blue-100"
        textColor = "text-blue-800"
        break
      case "有給":
        bgColor = "bg-green-100"
        textColor = "text-green-800"
        break
    }

    return (
      <div
        className={cn(
          "h-10 border-b border-r flex items-center justify-center text-xs font-medium",
          bgColor,
          textColor,
        )}
      >
        {shiftType}
      </div>
    )
  }

  // 日付の配列を生成（1日から12日まで）
  const days = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="テキスト・数値で検索"
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button>シフトを確定</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[200px_repeat(12,1fr)]">
              {/* ヘッダー行 */}
              <div className="font-medium p-2 border-b border-r">スタッフ</div>
              {days.map((day) => (
                <div key={day} className="font-medium p-2 text-center border-b border-r">
                  <div>{day}日</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString("ja-JP", {
                      weekday: "short",
                    })}
                  </div>
                </div>
              ))}

              {/* スタッフ行 */}
              {filteredStaff.map((staff) => (
                <React.Fragment key={staff.id}>
                  <div className="p-2 border-b border-r flex items-center">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-2">
                      {staff.name.charAt(0)}
                    </div>
                    <span>{staff.name}</span>
                  </div>
                  {days.map((day) => (
                    <div key={`${staff.id}-${day}`}>{renderShiftCell(staff.id, day)}</div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

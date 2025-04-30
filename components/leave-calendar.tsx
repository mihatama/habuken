"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedCalendar, type CalendarEvent } from "./enhanced-calendar"
import { useToast } from "@/components/ui/use-toast"
import { getLeaveTypeName } from "@/lib/supabase-utils"

type LeaveRequest = {
  id: string
  staff_id: string
  staff_name?: string
  start_date: string
  end_date: string
  leave_type: string | null
  reason: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  is_half_day?: boolean
  half_day_type?: "AM" | "PM"
}

export function LeaveCalendar() {
  const { toast } = useToast()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // APIエンドポイントを使用してデータを取得
      const response = await fetch("/api/leave-requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("休暇申請データの取得に失敗しました")
      }

      const data = await response.json()
      console.log("Fetched leave requests for calendar:", data.data)
      setLeaveRequests(data.data)

      // 休暇申請データをカレンダーイベント形式に変換
      const events = convertLeaveRequestsToEvents(data.data)
      setCalendarEvents(events)
    } catch (error: any) {
      console.error("休暇カレンダーデータ取得エラー:", error)
      setError(error.message || "休暇申請データの取得に失敗しました")
      toast({
        title: "エラー",
        description: "休暇カレンダーデータの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 休暇申請データをカレンダーイベント形式に変換する関数
  const convertLeaveRequestsToEvents = (requests: LeaveRequest[]): CalendarEvent[] => {
    // 承認済みの休暇申請のみをカレンダーに表示
    const approvedRequests = requests.filter((request) => request.status === "approved")

    return approvedRequests.map((request) => {
      const startDate = new Date(request.start_date)
      const endDate = new Date(request.end_date)

      // 終了日の23:59:59に設定（終日表示のため）
      endDate.setHours(23, 59, 59)

      // 半日休暇の場合は時間を調整
      if (request.is_half_day) {
        if (request.half_day_type === "AM") {
          startDate.setHours(9, 0, 0)
          endDate.setHours(12, 0, 0)
        } else if (request.half_day_type === "PM") {
          startDate.setHours(13, 0, 0)
          endDate.setHours(17, 0, 0)
        }
      }

      const leaveTypeName = getLeaveTypeName(request.leave_type || "")
      const halfDayText = request.is_half_day ? `（${request.half_day_type === "AM" ? "午前" : "午後"}）` : ""

      return {
        id: request.id,
        title: `${request.staff_name || "スタッフ"} - ${leaveTypeName}${halfDayText}`,
        start: startDate,
        end: endDate,
        description: request.reason,
        category: "leave",
        staff_id: request.staff_id,
        allDay: !request.is_half_day, // 半日休暇でない場合は終日イベント
      }
    })
  }

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  // カレンダーのカテゴリー定義
  const categories = [{ value: "leave", label: "休暇" }]

  return (
    <Card>
      <CardHeader>
        <CardTitle>休暇カレンダー</CardTitle>
        <CardDescription>承認済みの休暇申請をカレンダー形式で表示します</CardDescription>
      </CardHeader>
      <CardContent>
        <EnhancedCalendar
          events={calendarEvents}
          isLoading={isLoading}
          error={error}
          categories={categories}
          onRefresh={fetchLeaveRequests}
          readOnly={true} // 閲覧専用モード
        />
      </CardContent>
    </Card>
  )
}

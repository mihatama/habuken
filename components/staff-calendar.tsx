"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { EnhancedCalendar, type CalendarEvent } from "@/components/enhanced-calendar"

export function StaffCalendar() {
  const { toast } = useToast()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStaffVacationData()
  }, [])

  const fetchStaffVacationData = async () => {
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
        throw new Error("休暇データの取得に失敗しました")
      }

      const data = await response.json()

      // 承認済みのデータのみをフィルタリング
      const approvedLeaves = data.data.filter((leave: any) => leave.status === "approved")
      console.log("承認済み休暇データ (カレンダー用):", approvedLeaves)

      // Map approved leave data to calendar events
      const leaveEvents = approvedLeaves.map((leave: any) => {
        // 休暇時間帯に基づいてタイトルと時間を調整
        let title = `${leave.staff_name || "スタッフ"}: 休暇`
        const start = new Date(leave.start_date)
        const end = new Date(leave.end_date)
        const allDay = true

        // 休暇時間帯に応じてタイトルを変更
        if (leave.leave_duration === "am_only") {
          title = `${leave.staff_name || "スタッフ"}: 午前休`
        } else if (leave.leave_duration === "pm_only") {
          title = `${leave.staff_name || "スタッフ"}: 午後休`
        }

        return {
          id: `leave-${leave.id}`,
          title: title,
          start: start,
          end: end,
          staff_id: leave.staff_id,
          description: leave.reason || "",
          category: "holiday",
          allDay: allDay,
          leave_duration: leave.leave_duration || "full_day",
        }
      })

      setEvents(leaveEvents)
    } catch (error: any) {
      console.error("休暇データの取得に失敗しました:", error)
      setError(error.message || "休暇データの取得に失敗しました")
      toast({
        title: "エラー",
        description: "休暇データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Staff categories - only show approved vacations
  const staffCategories = [{ value: "holiday", label: "承認済み休暇" }]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            このカレンダーはスタッフの承認済み休暇情報を表示するための閲覧専用カレンダーです。休暇の申請や変更は休暇申請フォームから行ってください。
          </p>
        </div>
        <EnhancedCalendar
          events={events}
          // Pass null for these handlers to make the calendar read-only
          onEventAdd={null}
          onEventUpdate={null}
          onEventDelete={null}
          isLoading={isLoading}
          error={error}
          categories={staffCategories}
          onRefresh={fetchStaffVacationData}
          readOnly={true} // Add this prop to indicate it's read-only
        />
      </CardContent>
    </Card>
  )
}

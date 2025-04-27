"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"
import { ja } from "date-fns/locale"

// Supabaseクライアントの作成
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

// カレンダーイベントの型定義
interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: "shift" | "vacation" | "holiday"
  staffId?: string
  staffName?: string
}

export function StaffCalendar() {
  const [date, setDate] = useState<Date>(new Date())
  const { toast } = useToast()

  // スタッフシフトとイベントを取得するクエリ
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["staff-calendar", date.getFullYear(), date.getMonth()],
    queryFn: async () => {
      try {
        // 月の開始日と終了日を計算
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()

        // シフトデータを取得
        const { data: shifts, error: shiftsError } = await supabase
          .from("shifts")
          .select("id, staff_id, shift_date, shift_type")
          .gte("shift_date", startOfMonth)
          .lte("shift_date", endOfMonth)

        if (shiftsError) throw shiftsError

        // スタッフデータを取得
        const staffIds = [...new Set(shifts?.map((shift) => shift.staff_id).filter(Boolean) || [])]
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("id, full_name")
          .in("id", staffIds.length > 0 ? staffIds : ["no-staff"])

        if (staffError) throw staffError

        // スタッフIDをキーとしたマップを作成
        const staffMap = new Map()
        staffData?.forEach((staff) => {
          staffMap.set(staff.id, staff.full_name)
        })

        // 休暇データを取得
        const { data: vacations, error: vacationsError } = await supabase
          .from("leave_requests")
          .select("id, staff_id, start_date, end_date")
          .or(`start_date.lte.${endOfMonth},end_date.gte.${startOfMonth}`)
          .eq("status", "approved")

        if (vacationsError) throw vacationsError

        // 休暇申請のスタッフIDを取得
        const vacationStaffIds = [...new Set(vacations?.map((vacation) => vacation.staff_id).filter(Boolean) || [])]

        // まだ取得していないスタッフIDがあれば追加で取得
        const newStaffIds = vacationStaffIds.filter((id) => !staffMap.has(id))
        if (newStaffIds.length > 0) {
          const { data: additionalStaffData, error: additionalStaffError } = await supabase
            .from("staff")
            .select("id, full_name")
            .in("id", newStaffIds)

          if (additionalStaffError) throw additionalStaffError

          additionalStaffData?.forEach((staff) => {
            staffMap.set(staff.id, staff.full_name)
          })
        }

        // シフトデータをイベント形式に変換
        const shiftEvents: CalendarEvent[] = (shifts || []).map((shift) => ({
          id: `shift-${shift.id}`,
          title: `${staffMap.get(shift.staff_id) || "不明"}: ${shift.shift_type || "シフト"}`,
          date: new Date(shift.shift_date),
          type: "shift",
          staffId: shift.staff_id,
          staffName: staffMap.get(shift.staff_id),
        }))

        // 休暇データをイベント形式に変換（日付範囲を展開）
        const vacationEvents: CalendarEvent[] = []
        ;(vacations || []).forEach((vacation) => {
          const startDate = new Date(vacation.start_date)
          const endDate = new Date(vacation.end_date)

          // 開始日から終了日までの各日をイベントとして追加
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            // 当月のみ表示
            if (d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()) {
              vacationEvents.push({
                id: `vacation-${vacation.id}-${d.toISOString()}`,
                title: `${staffMap.get(vacation.staff_id) || "不明"}: 休暇`,
                date: new Date(d),
                type: "vacation",
                staffId: vacation.staff_id,
                staffName: staffMap.get(vacation.staff_id),
              })
            }
          }
        })

        // 祝日データ（実際のアプリではAPIから取得）
        const holidays: CalendarEvent[] = [
          {
            id: "holiday-1",
            title: "元日",
            date: new Date(date.getFullYear(), 0, 1),
            type: "holiday",
          },
          {
            id: "holiday-2",
            title: "成人の日",
            date: new Date(date.getFullYear(), 0, 8), // 1月第2月曜日（簡略化）
            type: "holiday",
          },
          // 他の祝日も同様に追加
        ].filter(
          (holiday) => holiday.date.getMonth() === date.getMonth() && holiday.date.getFullYear() === date.getFullYear(),
        )

        // すべてのイベントを結合
        return [...shiftEvents, ...vacationEvents, ...holidays]
      } catch (error) {
        console.error("カレンダーデータ取得エラー:", error)
        toast({
          title: "エラー",
          description: "カレンダーデータの取得に失敗しました",
          variant: "destructive",
        })
        return []
      }
    },
  })

  // 特定の日付のイベントを取得
  const getEventsForDay = (day: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === day.getDate() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getFullYear() === day.getFullYear(),
    )
  }

  // カレンダーの日付セルをカスタマイズ
  const renderDay = (day: Date) => {
    const dayEvents = getEventsForDay(day)
    const hasShift = dayEvents.some((e) => e.type === "shift")
    const hasVacation = dayEvents.some((e) => e.type === "vacation")
    const isHoliday = dayEvents.some((e) => e.type === "holiday")

    return (
      <div className="relative w-full h-full min-h-[40px] p-1">
        <div className={`text-sm ${isHoliday ? "text-red-500" : ""}`}>{day.getDate()}</div>
        {hasShift && <div className="absolute bottom-1 left-1 w-2 h-2 bg-blue-500 rounded-full"></div>}
        {hasVacation && <div className="absolute bottom-1 left-4 w-2 h-2 bg-green-500 rounded-full"></div>}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>スタッフカレンダー</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              locale={ja}
              className="rounded-md border"
              components={{
                Day: ({ day }) => renderDay(day),
              }}
            />

            <div className="mt-4">
              <h3 className="text-lg font-medium">
                {date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}のイベント
              </h3>
              <div className="mt-2 space-y-2">
                {getEventsForDay(date).length > 0 ? (
                  getEventsForDay(date).map((event) => (
                    <div
                      key={event.id}
                      className={`p-2 rounded-md ${
                        event.type === "shift"
                          ? "bg-blue-100"
                          : event.type === "vacation"
                            ? "bg-green-100"
                            : "bg-red-100"
                      }`}
                    >
                      {event.title}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">イベントはありません</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

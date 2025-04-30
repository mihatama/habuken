"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import { EnhancedCalendar, type CalendarEvent } from "@/components/enhanced-calendar"

export function StaffCalendar() {
  const { toast } = useToast()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staffMembers, setStaffMembers] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchStaffVacationData()
  }, [])

  // Rename the function to better reflect its purpose
  const fetchStaffVacationData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = getClientSupabase()

      // First, fetch all staff members to have their data available
      const { data: staffData, error: staffError } = await supabase.from("staff").select("id, full_name")

      if (staffError) throw staffError

      // Create a lookup object for staff data
      const staffLookup: Record<string, any> = {}
      staffData?.forEach((staff) => {
        staffLookup[staff.id] = staff
      })
      setStaffMembers(staffLookup)

      // Fetch leave requests only - we're not showing shifts anymore
      const { data: leaveData, error: leaveError } = await supabase
        .from("leave_requests")
        .select("*")
        .in("status", ["approved", "pending"])
        .order("start_date", { ascending: true })

      if (leaveError) throw leaveError

      // Map leave data and manually add staff information
      const leaveEvents = (leaveData || []).map((leave) => {
        const staffMember = staffLookup[leave.staff_id] || {}
        return {
          id: `leave-${leave.id}`,
          title: `${staffMember.full_name || "スタッフ"}: ${leave.status === "approved" ? "休暇" : "休暇申請中"}`,
          start: new Date(leave.start_date),
          end: new Date(leave.end_date),
          staff_id: leave.staff_id,
          description: leave.reason || "",
          category: leave.status === "approved" ? "holiday" : "other",
          allDay: true,
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

  // Remove the event handlers since we're making the calendar read-only
  // We'll pass null for these functions to the EnhancedCalendar

  // Staff categories - simplified to just show vacation statuses
  const staffCategories = [
    { value: "holiday", label: "承認済み休暇" },
    { value: "other", label: "申請中休暇" },
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            このカレンダーはスタッフの休暇情報を表示するための閲覧専用カレンダーです。休暇の申請や変更は休暇申請フォームから行ってください。
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

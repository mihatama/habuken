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
    fetchStaffCalendarData()
  }, [])

  const fetchStaffCalendarData = async () => {
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

      // Now fetch shifts without the join
      const { data: shiftsData, error: shiftsError } = await supabase
        .from("shifts")
        .select("*")
        .eq("event_type", "staff")
        .order("start_time", { ascending: true })

      if (shiftsError) throw shiftsError

      // Map the shifts data and manually add staff information
      const formattedEvents = (shiftsData || []).map((event) => {
        const staffMember = staffLookup[event.staff_id] || {}
        return {
          id: event.id,
          title: staffMember.full_name ? `${staffMember.full_name}: ${event.title}` : event.title,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          staff_id: event.staff_id,
          description: event.notes || "",
          category: "staff",
          allDay: false,
        }
      })

      // Fetch leave requests separately
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

      setEvents([...formattedEvents, ...leaveEvents])
    } catch (error: any) {
      console.error("カレンダーデータの取得に失敗しました:", error)
      setError(error.message || "カレンダーデータの取得に失敗しました")
      toast({
        title: "エラー",
        description: "カレンダーデータの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      const supabase = getClientSupabase()

      const { data, error } = await supabase
        .from("shifts")
        .insert({
          title: event.title,
          start_time: event.start.toISOString(),
          end_time: event.end.toISOString(),
          staff_id: event.staff_id || null,
          notes: event.description || null,
          event_type: "staff",
        })
        .select()

      if (error) throw error

      // Add the new event with staff information
      if (data && data[0]) {
        const staffMember = staffMembers[data[0].staff_id] || {}
        const newEvent = {
          ...event,
          id: data[0].id,
          title: staffMember.full_name ? `${staffMember.full_name}: ${event.title}` : event.title,
        }
        setEvents((prev) => [...prev, newEvent])
      }

      return data?.[0] || { id: Date.now() }
    } catch (error) {
      console.error("スタッフシフトの追加に失敗しました:", error)
      toast({
        title: "エラー",
        description: "スタッフシフトの追加に失敗しました",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleEventUpdate = async (event: CalendarEvent) => {
    try {
      // Handle leave events
      if (typeof event.id === "string" && event.id.startsWith("leave-")) {
        const leaveId = event.id.replace("leave-", "")
        const supabase = getClientSupabase()

        const { error } = await supabase
          .from("leave_requests")
          .update({
            start_date: event.start.toISOString(),
            end_date: event.end.toISOString(),
            reason: event.description || null,
          })
          .eq("id", leaveId)

        if (error) throw error
      } else {
        // Handle shift events
        const supabase = getClientSupabase()

        const { error } = await supabase
          .from("shifts")
          .update({
            title: event.title,
            start_time: event.start.toISOString(),
            end_time: event.end.toISOString(),
            staff_id: event.staff_id || null,
            notes: event.description || null,
          })
          .eq("id", event.id)

        if (error) throw error
      }

      // Update the event in the state
      setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)))

      return event
    } catch (error) {
      console.error("イベントの更新に失敗しました:", error)
      toast({
        title: "エラー",
        description: "イベントの更新に失敗しました",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleEventDelete = async (eventId: string | number) => {
    try {
      // Handle leave events
      if (typeof eventId === "string" && eventId.startsWith("leave-")) {
        const leaveId = eventId.replace("leave-", "")
        const supabase = getClientSupabase()

        const { error } = await supabase.from("leave_requests").delete().eq("id", leaveId)

        if (error) throw error
      } else {
        // Handle shift events
        const supabase = getClientSupabase()

        const { error } = await supabase.from("shifts").delete().eq("id", eventId)

        if (error) throw error
      }

      // Remove the event from the state
      setEvents((prev) => prev.filter((e) => e.id !== eventId))

      return { success: true }
    } catch (error) {
      console.error("イベントの削除に失敗しました:", error)
      toast({
        title: "エラー",
        description: "イベントの削除に失敗しました",
        variant: "destructive",
      })
      throw error
    }
  }

  // Staff categories
  const staffCategories = [
    { value: "staff", label: "シフト" },
    { value: "holiday", label: "休暇" },
    { value: "training", label: "研修" },
    { value: "other", label: "その他" },
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <EnhancedCalendar
          events={events}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          isLoading={isLoading}
          error={error}
          categories={staffCategories}
          onRefresh={fetchStaffCalendarData}
        />
      </CardContent>
    </Card>
  )
}

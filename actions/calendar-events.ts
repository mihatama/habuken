"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// 型定義
export interface CalendarEvent {
  id: string
  title: string
  start_time: Date | string
  end_time: Date | string
  notes?: string
  project_id?: string
  staff_id?: string
  resource_id?: string
  event_type: "project" | "staff" | "tool" | "general"
  created_at?: string
  updated_at?: string
}

// イベント作成
export async function createCalendarEvent(eventData: Omit<CalendarEvent, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("shifts")
      .insert({
        title: eventData.title,
        start_time: new Date(eventData.start_time).toISOString(),
        end_time: new Date(eventData.end_time).toISOString(),
        notes: eventData.notes || null,
        project_id: eventData.project_id || null,
        staff_id: eventData.staff_id || null,
        resource_id: eventData.resource_id || null,
        event_type: eventData.event_type,
      })
      .select()

    if (error) throw new Error(`イベント作成エラー: ${error.message}`)

    revalidatePath("/dashboard")
    return { success: true, data: data[0] }
  } catch (error) {
    console.error("イベント作成エラー:", error)
    return { success: false, error: error instanceof Error ? error.message : "不明なエラー" }
  }
}

// イベント更新
export async function updateCalendarEvent(
  eventId: string,
  eventData: Partial<Omit<CalendarEvent, "id" | "created_at" | "updated_at">>,
) {
  try {
    const supabase = createServerSupabaseClient()

    const updateData: any = {}

    if (eventData.title !== undefined) updateData.title = eventData.title
    if (eventData.start_time !== undefined) updateData.start_time = new Date(eventData.start_time).toISOString()
    if (eventData.end_time !== undefined) updateData.end_time = new Date(eventData.end_time).toISOString()
    if (eventData.notes !== undefined) updateData.notes = eventData.notes
    if (eventData.project_id !== undefined) updateData.project_id = eventData.project_id
    if (eventData.staff_id !== undefined) updateData.staff_id = eventData.staff_id
    if (eventData.resource_id !== undefined) updateData.resource_id = eventData.resource_id
    if (eventData.event_type !== undefined) updateData.event_type = eventData.event_type

    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase.from("shifts").update(updateData).eq("id", eventId)

    if (error) throw new Error(`イベント更新エラー: ${error.message}`)

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("イベント更新エラー:", error)
    return { success: false, error: error instanceof Error ? error.message : "不明なエラー" }
  }
}

// イベント削除
export async function deleteCalendarEvent(eventId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("shifts").delete().eq("id", eventId)

    if (error) throw new Error(`イベント削除エラー: ${error.message}`)

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("イベント削除エラー:", error)
    return { success: false, error: error instanceof Error ? error.message : "不明なエラー" }
  }
}

// イベント取得
export async function getCalendarEvents(filters?: {
  startDate?: string
  endDate?: string
  projectId?: string
  staffId?: string
  resourceId?: string
  eventType?: "project" | "staff" | "tool" | "general"
}) {
  try {
    const supabase = createServerSupabaseClient()

    let query = supabase.from("shifts").select(`
      *,
      projects(*),
      staff(*),
      resources(*)
    `)

    // フィルター適用
    if (filters) {
      if (filters.startDate) {
        query = query.gte("start_time", filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte("end_time", filters.endDate)
      }
      if (filters.projectId) {
        query = query.eq("project_id", filters.projectId)
      }
      if (filters.staffId) {
        query = query.eq("staff_id", filters.staffId)
      }
      if (filters.resourceId) {
        query = query.eq("resource_id", filters.resourceId)
      }
      if (filters.eventType) {
        query = query.eq("event_type", filters.eventType)
      }
    }

    const { data, error } = await query.order("start_time", { ascending: true })

    if (error) throw new Error(`イベント取得エラー: ${error.message}`)

    return { success: true, data }
  } catch (error) {
    console.error("イベント取得エラー:", error)
    return { success: false, error: error instanceof Error ? error.message : "不明なエラー", data: [] }
  }
}

// 複数スタッフ・リソースのイベント作成
export async function createMultipleAssignmentEvent(
  eventData: Omit<CalendarEvent, "id" | "created_at" | "updated_at" | "staff_id" | "resource_id"> & {
    staff_ids?: string[]
    resource_ids?: string[]
  },
) {
  try {
    const supabase = createServerSupabaseClient()
    const { staff_ids, resource_ids, ...baseEventData } = eventData

    // スタッフごとにイベントを作成
    if (staff_ids && staff_ids.length > 0) {
      for (const staffId of staff_ids) {
        await supabase.from("shifts").insert({
          ...baseEventData,
          staff_id: staffId,
          start_time: new Date(baseEventData.start_time).toISOString(),
          end_time: new Date(baseEventData.end_time).toISOString(),
        })
      }
    }

    // リソースごとにイベントを作成
    if (resource_ids && resource_ids.length > 0) {
      for (const resourceId of resource_ids) {
        await supabase.from("shifts").insert({
          ...baseEventData,
          resource_id: resourceId,
          start_time: new Date(baseEventData.start_time).toISOString(),
          end_time: new Date(baseEventData.end_time).toISOString(),
        })
      }
    }

    // スタッフもリソースも指定されていない場合は1つだけイベントを作成
    if ((!staff_ids || staff_ids.length === 0) && (!resource_ids || resource_ids.length === 0)) {
      await supabase.from("shifts").insert({
        ...baseEventData,
        start_time: new Date(baseEventData.start_time).toISOString(),
        end_time: new Date(baseEventData.end_time).toISOString(),
      })
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("複数割り当てイベント作成エラー:", error)
    return { success: false, error: error instanceof Error ? error.message : "不明なエラー" }
  }
}

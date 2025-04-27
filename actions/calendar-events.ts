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

    // リレーションシップを使わずに基本的なイベントデータを取得
    let query = supabase.from("shifts").select("*")

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

    const { data: shiftsData, error: shiftsError } = await query.order("start_time", { ascending: true })

    if (shiftsError) throw new Error(`イベント取得エラー: ${shiftsError.message}`)

    // 関連データを個別に取得
    const staffIds = shiftsData
      .filter((shift) => shift.staff_id)
      .map((shift) => shift.staff_id)
      .filter((value, index, self) => self.indexOf(value) === index) // 重複を削除

    const projectIds = shiftsData
      .filter((shift) => shift.project_id)
      .map((shift) => shift.project_id)
      .filter((value, index, self) => self.indexOf(value) === index) // 重複を削除

    const resourceIds = shiftsData
      .filter((shift) => shift.resource_id)
      .map((shift) => shift.resource_id)
      .filter((value, index, self) => self.indexOf(value) === index) // 重複を削除

    // スタッフデータを取得
    let staffData: any[] = []
    if (staffIds.length > 0) {
      const { data, error } = await supabase.from("staff").select("*").in("id", staffIds)
      if (error) throw new Error(`スタッフデータ取得エラー: ${error.message}`)
      staffData = data || []
    }

    // プロジェクトデータを取得
    let projectsData: any[] = []
    if (projectIds.length > 0) {
      const { data, error } = await supabase.from("projects").select("*").in("id", projectIds)
      if (error) throw new Error(`プロジェクトデータ取得エラー: ${error.message}`)
      projectsData = data || []
    }

    // リソースデータを取得
    let resourcesData: any[] = []
    if (resourceIds.length > 0) {
      const { data, error } = await supabase.from("resources").select("*").in("id", resourceIds)
      if (error) throw new Error(`リソースデータ取得エラー: ${error.message}`)
      resourcesData = data || []
    }

    // データを結合
    const enrichedData = shiftsData.map((shift) => {
      const staff = staffData.find((s) => s.id === shift.staff_id) || null
      const project = projectsData.find((p) => p.id === shift.project_id) || null
      const resource = resourcesData.find((r) => r.id === shift.resource_id) || null

      return {
        ...shift,
        staff,
        projects: project,
        resources: resource,
      }
    })

    return { success: true, data: enrichedData }
  } catch (error) {
    console.error("イベント取得エラー:", error)
    return { success: false, error: error instanceof Error ? error.message : "不明なエラー", data: [] }
  }
}

// 複数スタッフ・リソースのイベント作成
export async function createMultipleAssignmentEvent({
  title,
  start_time,
  end_time,
  notes,
  project_id,
  staff_ids,
  resource_ids,
  heavy_machinery_ids,
  vehicle_ids,
  tool_ids,
  event_type = "general",
}: {
  title: string
  start_time: Date
  end_time: Date
  notes?: string
  project_id?: string
  staff_ids?: string[]
  resource_ids?: string[]
  heavy_machinery_ids?: string[]
  vehicle_ids?: string[]
  tool_ids?: string[]
  event_type?: "project" | "staff" | "tool" | "general"
}) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "ユーザーが認証されていません" }
    }

    // 基本イベントデータ
    const baseEventData = {
      title,
      start_time: new Date(start_time).toISOString(),
      end_time: new Date(end_time).toISOString(),
      notes,
      project_id: project_id || null,
      created_by: user.id,
      event_type,
    }

    // スタッフの割り当てがある場合
    if (staff_ids && staff_ids.length > 0) {
      for (const staff_id of staff_ids) {
        await supabase.from("shifts").insert({
          ...baseEventData,
          staff_id,
        })
      }
    }

    // リソースの割り当てがある場合
    if (resource_ids && resource_ids.length > 0) {
      for (const resource_id of resource_ids) {
        await supabase.from("shifts").insert({
          ...baseEventData,
          resource_id,
        })
      }
    }

    // 重機の割り当てがある場合
    if (heavy_machinery_ids && heavy_machinery_ids.length > 0) {
      for (const heavy_machinery_id of heavy_machinery_ids) {
        await supabase.from("shifts").insert({
          ...baseEventData,
          heavy_machinery_id,
        })
      }
    }

    // 車両の割り当てがある場合
    if (vehicle_ids && vehicle_ids.length > 0) {
      for (const vehicle_id of vehicle_ids) {
        await supabase.from("shifts").insert({
          ...baseEventData,
          vehicle_id,
        })
      }
    }

    // 備品の割り当てがある場合
    if (tool_ids && tool_ids.length > 0) {
      for (const tool_id of tool_ids) {
        await supabase.from("shifts").insert({
          ...baseEventData,
          tool_id,
        })
      }
    }

    // 何も割り当てがない場合は一般的なイベントとして作成
    if (
      (!staff_ids || staff_ids.length === 0) &&
      (!resource_ids || resource_ids.length === 0) &&
      (!heavy_machinery_ids || heavy_machinery_ids.length === 0) &&
      (!vehicle_ids || vehicle_ids.length === 0) &&
      (!tool_ids || tool_ids.length === 0)
    ) {
      await supabase.from("shifts").insert(baseEventData)
    }

    revalidatePath("/dashboard")
    return { success: true, id: crypto.randomUUID() }
  } catch (error) {
    console.error("イベント作成エラー:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "イベントの作成に失敗しました",
    }
  }
}

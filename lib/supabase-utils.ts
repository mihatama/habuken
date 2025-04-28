import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"

// サーバーサイドのSupabaseクライアントを取得する関数
export function getServerSupabase(type?: "admin") {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  if (type === "admin") {
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// クライアントサイドのSupabaseクライアントを取得する関数
export function getClientSupabase() {
  return createClientComponentClient()
}

// テーブルからデータを取得する関数
export async function fetchClientData<T = any>(
  tableName: string,
  options: {
    filters?: Record<string, any>
    order?: { column: string; ascending: boolean }
    select?: string
    limit?: number
  } = {},
): Promise<T[]> {
  const { filters = {}, order, select = "*", limit } = options
  const supabase = getClientSupabase()

  let query = supabase.from(tableName).select(select)

  // フィルターの適用
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query = query.eq(key, value)
    }
  })

  // 並び順の適用
  if (order && order.column) {
    query = query.order(order.column, { ascending: order.ascending })
  }

  // 件数制限の適用
  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching data from ${tableName}:`, error)
    throw error
  }

  return (data || []) as T[]
}

// 重機データを取得する関数
export async function getHeavyMachineryList() {
  try {
    const supabase = getClientSupabase()
    const { data, error } = await supabase.from("heavy_machinery").select("*").order("name")

    if (error) {
      console.error("重機データの取得エラー:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("重機データ取得エラー:", error)
    throw error
  }
}

// スタッフデータを取得する関数
export async function getStaffList() {
  try {
    const supabase = getClientSupabase()
    const { data, error } = await supabase.from("staff").select("*").order("full_name")

    if (error) {
      console.error("スタッフデータの取得エラー:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("スタッフデータ取得エラー:", error)
    throw error
  }
}

// 車両データを取得する関数
export async function getVehiclesData() {
  try {
    const supabase = getClientSupabase()
    const { data, error } = await supabase.from("vehicles").select("*").order("name")

    if (error) {
      console.error("車両データの取得エラー:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("車両データ取得エラー:", error)
    throw error
  }
}

// 工具データを取得する関数
export async function getToolsData() {
  try {
    const supabase = getClientSupabase()
    const { data, error } = await supabase.from("resources").select("*").eq("type", "工具").order("name")

    if (error) {
      console.error("工具データの取得エラー:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("工具データ取得エラー:", error)
    throw error
  }
}

// 日報データを取得する関数
export async function getDailyReportsData() {
  try {
    const supabase = getClientSupabase()
    const { data, error } = await supabase.from("daily_reports").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("日報データの取得エラー:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("日報データ取得エラー:", error)
    throw error
  }
}

// 休暇申請データを取得する関数
export async function getLeaveRequestsData() {
  try {
    const supabase = getClientSupabase()
    const { data, error } = await supabase.from("leave_requests").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("休暇申請データの取得エラー:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("休暇申請データ取得エラー:", error)
    throw error
  }
}

// データを挿入する関数
export async function insertClientData<T = any>(tableName: string, data: Partial<T>): Promise<T[]> {
  try {
    const supabase = getClientSupabase()
    const { data: result, error } = await supabase.from(tableName).insert([data]).select()

    if (error) {
      console.error(`Error inserting data into ${tableName}:`, error)
      throw error
    }

    return (result || []) as T[]
  } catch (error) {
    console.error(`Error in insertClientData for ${tableName}:`, error)
    throw error
  }
}

// データを更新する関数
export async function updateClientData<T = any>(
  tableName: string,
  id: string,
  data: Partial<T>,
  options: { idField?: string } = {},
): Promise<T[]> {
  const { idField = "id" } = options
  try {
    const supabase = getClientSupabase()
    const { data: result, error } = await supabase.from(tableName).update(data).eq(idField, id).select()

    if (error) {
      console.error(`Error updating data in ${tableName}:`, error)
      throw error
    }

    return (result || []) as T[]
  } catch (error) {
    console.error(`Error in updateClientData for ${tableName}:`, error)
    throw error
  }
}

// データを削除する関数
export async function deleteClientData(
  tableName: string,
  id: string,
  options: { idField?: string } = {},
): Promise<void> {
  const { idField = "id" } = options
  try {
    const supabase = getClientSupabase()
    const { error } = await supabase.from(tableName).delete().eq(idField, id)

    if (error) {
      console.error(`Error deleting data from ${tableName}:`, error)
      throw error
    }
  } catch (error) {
    console.error(`Error in deleteClientData for ${tableName}:`, error)
    throw error
  }
}

// 休暇種類の名前を取得する関数
export function getLeaveTypeName(type: string) {
  switch (type) {
    case "annual":
      return "年次有給休暇"
    case "sick":
      return "病気休暇"
    case "special":
      return "特別休暇"
    case "other":
      return "その他"
    default:
      return type
  }
}

// 重機を作成する関数
export async function createHeavyMachinery(machineryData: any) {
  return insertClientData("heavy_machinery", machineryData)
}

// スタッフを作成する関数
export async function createStaff(staffData: any) {
  return insertClientData("staff", staffData)
}

// 休暇申請を更新する関数
export async function updateLeaveRequestData({
  id,
  status,
  rejectReason,
}: {
  id: string
  status: "approved" | "rejected"
  rejectReason?: string
}) {
  return updateClientData("leave_requests", id, {
    status,
    reject_reason: rejectReason || null,
    updated_at: new Date().toISOString(),
  })
}

import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "../types/supabase"
import { cookies } from "next/headers"

// ===== 型定義 =====

// クライアント側のSupabaseタイプ
export type SupabaseClientType = "default" | "auth" | "storage"

// サーバー側のSupabaseタイプ
export type ServerSupabaseClientType = "admin" | "service" | "anon"
export type ServerClientType = "server" | "action" | ServerSupabaseClientType

// データアクセスオプション
export interface DataAccessOptions {
  select?: string
  order?: { column: string; ascending: boolean }
  filters?: Record<string, any>
  limit?: number
  page?: number
}

// サーバークエリオプション
export interface ServerQueryOptions extends DataAccessOptions {
  clientType?: ServerClientType
  client?: SupabaseClient<Database>
}

// ===== クライアント側の関数 =====

// クライアント側のシングルトンインスタンス
let clientSupabaseInstance: SupabaseClient<Database> | null = null

/**
 * クライアント側でSupabaseクライアントを取得する関数
 */
export function getClientSupabase(type: SupabaseClientType = "default"): SupabaseClient<Database> {
  if (clientSupabaseInstance) {
    return clientSupabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  // 新しいクライアントを作成
  clientSupabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "supabase-auth",
    },
  })

  return clientSupabaseInstance
}

/**
 * クライアント側のSupabaseインスタンスをリセットする関数
 */
export function resetClientSupabase(): void {
  clientSupabaseInstance = null
}

// ===== サーバー側の関数 =====

// サーバーサイドのSupabaseクライアントを取得
export function getServerSupabase() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// クライアントサイドのSupabaseクライアントを取得（シングルトンパターン）
let clientSupabase: ReturnType<typeof createClient> | null = null

export function getClientSupabaseSingleton() {
  if (clientSupabase) return clientSupabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  clientSupabase = createClient(supabaseUrl, supabaseKey)
  return clientSupabase
}

/**
 * サーバー側でSupabaseクライアントを取得する関数
 */
// export function getServerSupabase(type: ServerClientType = "server"): SupabaseClient<Database> {
//   const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""

//   let supabaseKey: string

//   if (type === "admin" || type === "service" || type === "server") {
//     // サービスロールキーを使用（管理者権限）
//     supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
//   } else {
//     // 匿名キーを使用（一般ユーザー権限）
//     supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
//   }

//   return createClient<Database>(supabaseUrl, supabaseKey, {
//     auth: {
//       autoRefreshToken: false,
//       persistSession: false,
//     },
//   })
// }

// ===== 共通データアクセス関数 =====

/**
 * テーブルからデータを取得する基本関数
 */
export async function fetchData<T = any>(
  client: SupabaseClient<Database>,
  tableName: string,
  options: DataAccessOptions = {},
): Promise<{ data: T[]; count: number | null }> {
  const { select = "*", order, filters = {}, limit, page } = options

  try {
    let query = client.from(tableName).select(select, { count: "exact" })

    // フィルターの適用
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value === "string" && value.includes("%")) {
          query = query.ilike(key, value)
        } else {
          query = query.eq(key, value)
        }
      }
    })

    // 並び順の適用
    if (order) {
      query = query.order(order.column, { ascending: order.ascending })
    }

    // ページネーションの適用
    if (limit) {
      query = query.limit(limit)

      if (page && page > 1) {
        query = query.range((page - 1) * limit, page * limit - 1)
      }
    }

    const { data, error, count } = await query

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error)
      throw error
    }

    return { data: (data || []) as T[], count }
  } catch (error) {
    console.error(`Error in fetchData for ${tableName}:`, error)
    throw error
  }
}

/**
 * テーブルにデータを挿入する基本関数
 */
export async function insertData<T = any>(
  client: SupabaseClient<Database>,
  tableName: string,
  data: any,
  options: { returning?: string } = {},
): Promise<T[]> {
  const { returning = "*" } = options

  try {
    const { data: result, error } = await client.from(tableName).insert(data).select(returning)

    if (error) {
      console.error(`Error inserting data into ${tableName}:`, error)
      throw error
    }

    return (result || []) as T[]
  } catch (error) {
    console.error(`Error in insertData for ${tableName}:`, error)
    throw error
  }
}

/**
 * テーブルのデータを更新する基本関数
 */
export async function updateData<T = any>(
  client: SupabaseClient<Database>,
  tableName: string,
  id: string | number,
  data: any,
  options: { idField?: string; returning?: string } = {},
): Promise<T[]> {
  const { idField = "id", returning = "*" } = options

  try {
    const { data: result, error } = await client.from(tableName).update(data).eq(idField, id).select(returning)

    if (error) {
      console.error(`Error updating data in ${tableName}:`, error)
      throw error
    }

    return (result || []) as T[]
  } catch (error) {
    console.error(`Error in updateData for ${tableName}:`, error)
    throw error
  }
}

/**
 * テーブルからデータを削除する基本関数
 */
export async function deleteData(
  client: SupabaseClient<Database>,
  tableName: string,
  id: string | number,
  options: { idField?: string } = {},
): Promise<boolean> {
  const { idField = "id" } = options

  try {
    const { error } = await client.from(tableName).delete().eq(idField, id)

    if (error) {
      console.error(`Error deleting data from ${tableName}:`, error)
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error in deleteData for ${tableName}:`, error)
    throw error
  }
}

// ===== クライアント側のラッパー関数 =====

// クライアントサイドでデータを挿入する関数
export async function insertClientData(table: string, data: any) {
  const supabase = getClientSupabaseSingleton()
  const { data: result, error } = await supabase.from(table).insert(data).select()

  if (error) {
    console.error(`Error inserting data into ${table}:`, error)
    throw error
  }

  return result
}

// クライアントサイドでデータを更新する関数
export async function updateClientData(table: string, id: string, data: any) {
  const supabase = getClientSupabaseSingleton()
  const { data: result, error } = await supabase.from(table).update(data).eq("id", id).select()

  if (error) {
    console.error(`Error updating data in ${table}:`, error)
    throw error
  }

  return result
}

// クライアントサイドでデータを削除する関数
export async function deleteClientData(table: string, id: string) {
  const supabase = getClientSupabaseSingleton()
  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) {
    console.error(`Error deleting data from ${table}:`, error)
    throw error
  }

  return true
}

/**
 * クライアント側でデータを取得する関数
 */
export async function fetchClientData<T = any>(tableName: string, options: DataAccessOptions = {}) {
  const client = getClientSupabaseSingleton()
  return fetchData<T>(client, tableName, options)
}

/**
 * クライアント側でデータを挿入する関数
 */
// export async function insertClientData<T = any>(tableName: string, data: any, options: { returning?: string } = {}) {
//   const client = getClientSupabase()
//   return insertData<T>(client, tableName, data, options)
// }

/**
 * クライアント側でデータを更新する関数
 */
// export async function updateClientData<T = any>(
//   tableName: string,
//   id: string | number,
//   data: any,
//   options: { idField?: string; returning?: string } = {},
// ) {
//   const client = getClientSupabase()
//   return updateData<T>(client, tableName, id, data, options)
// }

/**
 * クライアント側でデータを削除する関数
 */
// export async function deleteClientData(tableName: string, id: string, options: { idField?: string } = {}) {
//   const client = getClientSupabase()
//   return deleteData(client, tableName, id, options)
// }

// ===== サーバー側のラッパー関数 =====

/**
 * サーバー側でデータを取得する関数
 */
export async function fetchServerData<T = any>(tableName: string, options: ServerQueryOptions = {}) {
  const { clientType = "server", client, ...restOptions } = options
  const supabase = client || getServerSupabase(clientType)
  return fetchData<T>(supabase, tableName, restOptions)
}

/**
 * サーバー側でデータを挿入する関数
 */
export async function insertServerData<T = any>(
  tableName: string,
  data: any,
  options: {
    clientType?: ServerClientType
    returning?: string
    client?: SupabaseClient<Database>
  } = {},
) {
  const { clientType = "server", returning = "*", client } = options
  const supabase = client || getServerSupabase(clientType)
  return insertData<T>(supabase, tableName, data, { returning })
}

/**
 * サーバー側でデータを更新する関数
 */
export async function updateServerData<T = any>(
  tableName: string,
  id: string | number,
  data: any,
  options: {
    clientType?: ServerClientType
    idField?: string
    returning?: string
    client?: SupabaseClient<Database>
  } = {},
) {
  const { clientType = "server", idField = "id", returning = "*", client } = options
  const supabase = client || getServerSupabase(clientType)
  return updateData<T>(supabase, tableName, id, data, { idField, returning })
}

/**
 * サーバー側でデータを削除する関数
 */
export async function deleteServerData(
  tableName: string,
  id: string | number,
  options: {
    clientType?: ServerClientType
    idField?: string
    client?: SupabaseClient<Database>
  } = {},
) {
  const { clientType = "server", idField = "id", client } = options
  const supabase = client || getServerSupabase(clientType)
  return deleteData(supabase, tableName, id, { idField })
}

// 後方互換性のために既存の関数名をエクスポート
export const getClientSupabaseInstance = getClientSupabase

// 既存の関数名をエクスポート（後方互換性のため）
export const fetchDataFromTable = fetchClientData
export const insertDataToTable = insertClientData
export const updateDataInTable = updateClientData
export const deleteDataFromTable = deleteClientData

// 以下の関数を追加します（既存のコードの後に追加）

// ===== 特定のエンティティに対するヘルパー関数 =====

/**
 * スタッフデータを取得する関数
 */
export async function getStaffData(options: DataAccessOptions = {}) {
  const mergedOptions = {
    order: { column: "full_name", ascending: true },
    ...options,
  }
  return fetchClientData("staff", mergedOptions)
}

/**
 * プロジェクトデータを取得する関数
 */
export async function getProjectsData(options: DataAccessOptions = {}) {
  const mergedOptions = {
    order: { column: "name", ascending: true },
    ...options,
  }
  return fetchClientData("projects", mergedOptions)
}

/**
 * 工具データを取得する関数
 */
export async function getToolsData(options: DataAccessOptions = {}) {
  try {
    // まず、resourcesテーブルのスキーマを確認するためにデータを1件取得
    const { data: columns } = await fetchClientData("resources", { limit: 1 })

    // テーブルにtype列がある場合
    if (columns && columns.length > 0 && "type" in columns[0]) {
      const mergedOptions = {
        filters: { type: "工具" },
        order: { column: "name", ascending: true },
        ...options,
      }
      return fetchClientData("resources", mergedOptions)
    }

    // テーブルにresource_type列がある場合
    else if (columns && columns.length > 0 && "resource_type" in columns[0]) {
      const mergedOptions = {
        filters: { resource_type: "工具" },
        order: { column: "name", ascending: true },
        ...options,
      }
      return fetchClientData("resources", mergedOptions)
    }

    // どちらの列もない場合は、全てのリソースを取得
    else {
      const mergedOptions = {
        order: { column: "name", ascending: true },
        ...options,
      }
      return fetchClientData("resources", mergedOptions)
    }
  } catch (error) {
    console.error("工具データ取得エラー:", error)
    throw error
  }
}

/**
 * 重機データを取得する関数
 */
export async function getHeavyMachineryData(options: DataAccessOptions = {}) {
  const mergedOptions = {
    order: { column: "name", ascending: true },
    ...options,
  }
  return fetchClientData("heavy_machinery", mergedOptions)
}

/**
 * 車両データを取得する関数
 */
export async function getVehiclesData(options: DataAccessOptions = {}) {
  const mergedOptions = {
    order: { column: "name", ascending: true },
    ...options,
  }
  return fetchClientData("vehicles", mergedOptions)
}

/**
 * 休暇申請データを取得する関数
 */
export async function getLeaveRequestsData() {
  try {
    const client = getClientSupabaseSingleton()

    // 休暇申請データを取得
    const { data: leaveRequests, error: leaveError } = await client
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (leaveError) throw leaveError

    if (!leaveRequests || leaveRequests.length === 0) {
      return { data: [], count: 0 }
    }

    // スタッフIDのリストを作成
    const staffIds = [...new Set(leaveRequests.map((request) => request.staff_id).filter(Boolean))]

    // スタッフデータを別途取得
    const { data: staffData, error: staffError } = await client.from("staff").select("id, full_name").in("id", staffIds)

    if (staffError) throw staffError

    // スタッフIDをキーとしたマップを作成
    const staffMap = new Map()
    staffData?.forEach((staff) => {
      staffMap.set(staff.id, staff.full_name)
    })

    // データ形式を整形
    const formattedData = leaveRequests.map((request) => ({
      ...request,
      staff: {
        name: staffMap.get(request.staff_id) || "不明",
      },
    }))

    return { data: formattedData, count: formattedData.length }
  } catch (error) {
    console.error("休暇申請データ取得エラー:", error)
    throw error
  }
}

/**
 * 休暇申請を更新する関数
 */
export async function updateLeaveRequestData({
  id,
  status,
  rejectReason,
}: {
  id: string
  status: "approved" | "rejected"
  rejectReason?: string
}) {
  try {
    const client = getClientSupabaseSingleton()

    const { data, error } = await client
      .from("leave_requests")
      .update({
        status,
        reject_reason: rejectReason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      throw new Error(`休暇申請更新エラー: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("休暇申請更新エラー:", error)
    throw error
  }
}

/**
 * 日報データを取得する関数
 */
export async function getDailyReportsData() {
  try {
    const client = getClientSupabaseSingleton()

    // 日報データを取得
    const { data: reports, error } = await client
      .from("daily_reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    if (!reports || reports.length === 0) {
      return { data: [], count: 0 }
    }

    // スタッフIDとプロジェクトIDのリストを作成
    const staffIds = [...new Set(reports.map((report: any) => report.staff_id).filter(Boolean))]
    const projectIds = [...new Set(reports.map((report: any) => report.project_id).filter(Boolean))]

    // スタッフデータを取得
    const { data: staffData, error: staffError } = await client.from("staff").select("id, full_name")

    if (staffError) throw staffError

    // プロジェクトデータを取得
    const { data: projectsData, error: projectError } = await client.from("projects").select("id, name")

    if (projectError) throw projectError

    // スタッフIDとプロジェクトIDをキーとしたマップを作成
    const staffMap = new Map()
    staffData?.forEach((staff: any) => {
      staffMap.set(staff.id, staff.full_name)
    })

    const projectMap = new Map()
    projectsData?.forEach((project: any) => {
      projectMap.set(project.id, project.name)
    })

    // データ形式を整形
    const formattedData = reports.map((report: any) => ({
      ...report,
      userName: staffMap.get(report.staff_id) || "不明",
      projectName: projectMap.get(report.project_id) || "不明",
      workDate: report.work_date,
      createdAt: report.created_at,
    }))

    return { data: formattedData, count: formattedData.length }
  } catch (error) {
    console.error("作業日報データ取得エラー:", error)
    throw error
  }
}

/**
 * 休暇種類の名前を取得する関数
 */
export function getLeaveTypeName(type: string) {
  switch (type) {
    case "paid":
      return "有給"
    case "compensatory":
      return "振替休日"
    case "special":
      return "特別休暇"
    case "absent":
      return "欠勤"
    default:
      return type
  }
}

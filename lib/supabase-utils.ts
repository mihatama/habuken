import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// シングルトンパターンでクライアントを管理
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getClientSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase環境変数が設定されていません")
      throw new Error("Supabase環境変数が設定されていません")
    }

    console.log("Supabaseクライアントを初期化します")
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return supabaseClient
}

// サーバーサイド用のSupabaseクライアント
export async function getServerSupabase() {
  const { createServerClient } = await import("@supabase/auth-helpers-nextjs")
  const { cookies } = await import("next/headers")

  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

// エラーハンドリング用のカスタムエラークラス
export class SupabaseError extends Error {
  constructor(
    message: string,
    public originalError?: any,
  ) {
    super(message)
    this.name = "SupabaseError"
  }
}

/**
 * テーブルからデータを取得する関数
 * @param tableName テーブル名
 * @param options 取得オプション
 * @returns 取得したデータ
 * @throws {SupabaseError} データ取得に失敗した場合
 */
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

  try {
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
      throw new SupabaseError(`Error fetching data from ${tableName}: ${error.message}`, error)
    }

    return (data || []) as T[]
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    console.error(`[Supabase Query Error] Error in fetchClientData for ${tableName}:`, error)
    throw new SupabaseError(`Failed to fetch data from ${tableName}`, error)
  }
}

/**
 * 重機データを取得する関数
 * @returns 重機データの配列
 * @throws {SupabaseError} データ取得に失敗した場合
 */
export async function getHeavyMachineryList() {
  try {
    const supabase = getClientSupabase()
    const { data, error } = await supabase.from("heavy_machinery").select("*").order("name")

    if (error) {
      throw new SupabaseError(`重機データの取得エラー: ${error.message}`, error)
    }

    return data || []
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    console.error("[Supabase Query Error] 重機データ取得エラー:", error)
    throw new SupabaseError("重機データの取得に失敗しました", error)
  }
}

/**
 * スタッフデータを取得する関数
 * @returns スタッフデータの配列
 * @throws {SupabaseError} データ取得に失敗した場合
 */
export async function getStaffList() {
  try {
    const supabase = getClientSupabase()
    const { data, error } = await supabase.from("staff").select("*").order("full_name")

    if (error) {
      throw new SupabaseError(`スタッフデータの取得エラー: ${error.message}`, error)
    }

    return data || []
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    console.error("[Supabase Query Error] スタッフデータ取得エラー:", error)
    throw new SupabaseError("スタッフデータの取得に失敗しました", error)
  }
}

/**
 * 車両データを取得する関数
 * @returns 車両データの配列
 * @throws {SupabaseError} データ取得に失敗した場合
 */
export async function getVehiclesData() {
  try {
    const supabase = getClientSupabase()
    const { data, error } = await supabase.from("vehicles").select("*").order("name")

    if (error) {
      throw new SupabaseError(`車両データの取得エラー: ${error.message}`, error)
    }

    return data || []
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    console.error("[Supabase Query Error] 車両データ取得エラー:", error)
    throw new SupabaseError("車両データの取得に失敗しました", error)
  }
}

/**
 * 工具データを取得する関数
 * @returns 工具データの配列
 * @throws {SupabaseError} データ取得に失敗した場合
 */
export async function getToolsData() {
  try {
    const supabase = getClientSupabase()
    const { data, error } = await supabase.from("resources").select("*").eq("type", "工具").order("name")

    if (error) {
      throw new SupabaseError(`工具データの取得エラー: ${error.message}`, error)
    }

    return data || []
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    console.error("[Supabase Query Error] 工具データ取得エラー:", error)
    throw new SupabaseError("工具データの取得に失敗しました", error)
  }
}

/**
 * 日報データを取得する関数
 * @returns 日報データの配列
 * @throws {SupabaseError} データ取得に失敗した場合
 */
export async function getDailyReportsData() {
  try {
    const supabase = getClientSupabase()
    const { data, error } = await supabase.from("daily_reports").select("*").order("created_at", { ascending: false })

    if (error) {
      throw new SupabaseError(`日報データの取得エラー: ${error.message}`, error)
    }

    return data || []
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    console.error("[Supabase Query Error] 日報データ取得エラー:", error)
    throw new SupabaseError("日報データの取得に失敗しました", error)
  }
}

/**
 * 休暇申請データを取得する関数
 * @returns 休暇申請データの配列
 * @throws {SupabaseError} データ取得に失敗した場合
 */
export async function getLeaveRequestsData() {
  try {
    const supabase = getClientSupabase()
    const { data, error } = await supabase.from("leave_requests").select("*").order("created_at", { ascending: false })

    if (error) {
      throw new SupabaseError(`休暇申請データの取得エラー: ${error.message}`, error)
    }

    return data || []
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    console.error("[Supabase Query Error] 休暇申請データ取得エラー:", error)
    throw new SupabaseError("休暇申請データの取得に失敗しました", error)
  }
}

/**
 * データを挿入する関数
 * @param tableName テーブル名
 * @param data 挿入するデータ
 * @returns 挿入されたデータ
 * @throws {SupabaseError} データ挿入に失敗した場合
 */
export async function insertClientData<T = any>(tableName: string, data: Partial<T>): Promise<T[]> {
  try {
    const supabase = getClientSupabase()
    const { data: result, error } = await supabase.from(tableName).insert([data]).select()

    if (error) {
      throw new SupabaseError(`Error inserting data into ${tableName}: ${error.message}`, error)
    }

    return (result || []) as T[]
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    console.error(`[Supabase Mutation Error] Error in insertClientData for ${tableName}:`, error)
    throw new SupabaseError(`Failed to insert data into ${tableName}`, error)
  }
}

/**
 * データを更新する関数
 * @param tableName テーブル名
 * @param id 更新するレコードのID
 * @param data 更新するデータ
 * @param options 更新オプション
 * @returns 更新されたデータ
 * @throws {SupabaseError} データ更新に失敗した場合
 */
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
      throw new SupabaseError(`Error updating data in ${tableName}: ${error.message}`, error)
    }

    return (result || []) as T[]
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    console.error(`[Supabase Mutation Error] Error in updateClientData for ${tableName}:`, error)
    throw new SupabaseError(`Failed to update data in ${tableName}`, error)
  }
}

/**
 * データを削除する関数
 * @param tableName テーブル名
 * @param id 削除するレコードのID
 * @param options 削除オプション
 * @throws {SupabaseError} データ削除に失敗した場合
 */
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
      throw new SupabaseError(`Error deleting data from ${tableName}: ${error.message}`, error)
    }
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error
    }
    console.error(`[Supabase Mutation Error] Error in deleteClientData for ${tableName}:`, error)
    throw new SupabaseError(`Failed to delete data from ${tableName}`, error)
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

/**
 * 重機を作成する関数
 * @param machineryData 重機データ
 * @returns 作成された重機データ
 * @throws {SupabaseError} 重機作成に失敗した場合
 */
export async function createHeavyMachinery(machineryData: any) {
  return insertClientData("heavy_machinery", machineryData)
}

/**
 * スタッフを作成する関数
 * @param staffData スタッフデータ
 * @returns 作成されたスタッフデータ
 * @throws {SupabaseError} スタッフ作成に失敗した場合
 */
export async function createStaff(staffData: any) {
  return insertClientData("staff", staffData)
}

/**
 * 休暇申請を更新する関数
 * @param params 更新パラメータ
 * @returns 更新された休暇申請データ
 * @throws {SupabaseError} 休暇申請更新に失敗した場合
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
  return updateClientData("leave_requests", id, {
    status,
    reject_reason: rejectReason || null,
    updated_at: new Date().toISOString(),
  })
}

/**
 * エラーメッセージをユーザーフレンドリーに変換する関数
 * @param error エラーオブジェクト
 * @returns ユーザーフレンドリーなエラーメッセージ
 */
export function getReadableErrorMessage(error: any): string {
  if (error instanceof SupabaseError) {
    return error.message
  }

  if (error?.code === "PGRST116") {
    return "データが見つかりませんでした。"
  }

  if (error?.code === "23505") {
    return "既に同じデータが存在します。"
  }

  if (error?.code === "23503") {
    return "関連するデータが存在しないため、操作を完了できません。"
  }

  if (error?.code?.startsWith("P")) {
    return "データベースエラーが発生しました。"
  }

  if (error?.message?.includes("network")) {
    return "ネットワーク接続に問題があります。インターネット接続を確認してください。"
  }

  return "予期しないエラーが発生しました。しばらく経ってからもう一度お試しください。"
}

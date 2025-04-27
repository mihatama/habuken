import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// シングルトンパターンのためのクライアントインスタンス
let clientSupabaseInstance: SupabaseClient<Database> | null = null

/**
 * サーバーコンポーネント用のSupabaseクライアントを作成
 * Server Componentsやサーバーアクションで使用
 */
export function createServerClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

/**
 * クライアントコンポーネント用のSupabaseクライアントを取得
 * 'use client'ディレクティブを持つコンポーネントで使用
 */
export function getClientSupabase(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    throw new Error("getClientSupabase must be used in client components only")
  }

  // Next.jsの認証ヘルパーを使用（セッション管理を自動化）
  return createClientComponentClient<Database>()
}

/**
 * クライアントコンポーネント用のSupabaseクライアント（シングルトンパターン）
 * パフォーマンスが重要な場合や、特定のケースで使用
 */
export function getClientSupabaseInstance(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    throw new Error("getClientSupabaseInstance must be used in client components only")
  }

  if (clientSupabaseInstance) {
    return clientSupabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  clientSupabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
    },
  })

  return clientSupabaseInstance
}

/**
 * データ取得用の共通関数
 */
export async function fetchData<T = any>(
  tableName: string,
  options: {
    select?: string
    order?: { column: string; ascending: boolean }
    filters?: Record<string, any>
    limit?: number
    page?: number
    client?: SupabaseClient<Database>
  } = {},
): Promise<{ data: T[]; count: number | null }> {
  const { select = "*", order, filters = {}, limit, page, client } = options

  // クライアントが提供されていない場合は新しいクライアントを作成
  const supabase = client || (typeof window === "undefined" ? createServerClient() : getClientSupabase())

  try {
    let query = supabase.from(tableName).select(select, { count: "exact" })

    // フィルターを適用
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value === "string" && value.includes("%")) {
          query = query.ilike(key, value)
        } else {
          query = query.eq(key, value)
        }
      }
    })

    // 並び順を適用
    if (order) {
      query = query.order(order.column, { ascending: order.ascending })
    }

    // ページネーションを適用
    if (limit && page) {
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)
    } else if (limit) {
      query = query.limit(limit)
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
 * データ挿入用の共通関数
 */
export async function insertData<T = any>(
  tableName: string,
  data: any,
  options: {
    client?: SupabaseClient<Database>
    returning?: string
  } = {},
): Promise<T[]> {
  const { client, returning = "*" } = options
  const supabase = client || (typeof window === "undefined" ? createServerClient() : getClientSupabase())

  try {
    const { data: insertedData, error } = await supabase.from(tableName).insert(data).select(returning)

    if (error) {
      console.error(`Error inserting data to ${tableName}:`, error)
      throw error
    }

    return (insertedData || []) as T[]
  } catch (error) {
    console.error(`Error in insertData for ${tableName}:`, error)
    throw error
  }
}

/**
 * データ更新用の共通関数
 */
export async function updateData<T = any>(
  tableName: string,
  id: string,
  data: any,
  options: {
    client?: SupabaseClient<Database>
    returning?: string
    idField?: string
  } = {},
): Promise<T[]> {
  const { client, returning = "*", idField = "id" } = options
  const supabase = client || (typeof window === "undefined" ? createServerClient() : getClientSupabase())

  try {
    const { data: updatedData, error } = await supabase.from(tableName).update(data).eq(idField, id).select(returning)

    if (error) {
      console.error(`Error updating data in ${tableName}:`, error)
      throw error
    }

    return (updatedData || []) as T[]
  } catch (error) {
    console.error(`Error in updateData for ${tableName}:`, error)
    throw error
  }
}

/**
 * データ削除用の共通関数
 */
export async function deleteData(
  tableName: string,
  id: string,
  options: {
    client?: SupabaseClient<Database>
    idField?: string
  } = {},
): Promise<boolean> {
  const { client, idField = "id" } = options
  const supabase = client || (typeof window === "undefined" ? createServerClient() : getClientSupabase())

  try {
    const { error } = await supabase.from(tableName).delete().eq(idField, id)

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

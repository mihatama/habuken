import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { getSupabaseClient } from "@/lib/supabase/client"

// クライアント側の関数を再エクスポート
export { getClientSupabase } from "@/lib/supabase/client"

// サーバー側でのみ使用する関数をダイナミックインポート
let getServerSupabaseClient: any = null

// サーバー側かどうかを判定
if (typeof window === "undefined") {
  // サーバー側の場合、動的にインポート
  import("@/lib/supabase/server").then((module) => {
    getServerSupabaseClient = module.getServerSupabaseClient
  })
}

export interface QueryOptions {
  select?: string
  order?: { column: string; ascending: boolean }
  filters?: Record<string, any>
  limit?: number
  page?: number
  clientType?: "client" | "server" | "action"
  client?: SupabaseClient<Database>
}

/**
 * テーブルからデータを取得する
 */
export async function fetchData<T = any>(
  tableName: string,
  options: QueryOptions = {},
): Promise<{ data: T[]; count: number | null }> {
  const { select = "*", order, filters = {}, limit, page, clientType = "client", client } = options

  // クライアントが提供されている場合はそれを使用
  if (client) {
    return fetchDataWithClient(tableName, client, { select, order, filters, limit, page })
  }

  // サーバー側の場合
  if (typeof window === "undefined" && (clientType === "server" || clientType === "action")) {
    if (!getServerSupabaseClient) {
      // 動的インポートが完了するまで待機
      const serverModule = await import("@/lib/supabase/server")
      getServerSupabaseClient = serverModule.getServerSupabaseClient
    }
    const serverClient = getServerSupabaseClient(clientType)
    return fetchDataWithClient(tableName, serverClient, { select, order, filters, limit, page })
  }

  // クライアント側の場合
  const clientSideClient = getSupabaseClient("client")
  return fetchDataWithClient(tableName, clientSideClient, { select, order, filters, limit, page })
}

// 実際のデータ取得ロジック
async function fetchDataWithClient<T = any>(
  tableName: string,
  client: SupabaseClient<Database>,
  options: {
    select?: string
    order?: { column: string; ascending: boolean }
    filters?: Record<string, any>
    limit?: number
    page?: number
  },
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
 * テーブルにデータを挿入する
 */
export async function insertData<T = any>(
  tableName: string,
  data: any,
  options: {
    clientType?: "client" | "server" | "action"
    returning?: string
    client?: SupabaseClient<Database>
  } = {},
): Promise<T[]> {
  const { clientType = "client", returning = "*", client } = options

  // クライアントが提供されている場合はそれを使用
  if (client) {
    return insertDataWithClient(tableName, data, client, returning)
  }

  // サーバー側の場合
  if (typeof window === "undefined" && (clientType === "server" || clientType === "action")) {
    if (!getServerSupabaseClient) {
      // 動的インポートが完了するまで待機
      const serverModule = await import("@/lib/supabase/server")
      getServerSupabaseClient = serverModule.getServerSupabaseClient
    }
    const serverClient = getServerSupabaseClient(clientType)
    return insertDataWithClient(tableName, data, serverClient, returning)
  }

  // クライアント側の場合
  const clientSideClient = getSupabaseClient("client")
  return insertDataWithClient(tableName, data, clientSideClient, returning)
}

// 実際のデータ挿入ロジック
async function insertDataWithClient<T = any>(
  tableName: string,
  data: any,
  client: SupabaseClient<Database>,
  returning = "*",
): Promise<T[]> {
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
 * テーブルのデータを更新する
 */
export async function updateData<T = any>(
  tableName: string,
  id: string,
  data: any,
  options: {
    clientType?: "client" | "server" | "action"
    idField?: string
    returning?: string
    client?: SupabaseClient<Database>
  } = {},
): Promise<T[]> {
  const { clientType = "client", idField = "id", returning = "*", client } = options

  // クライアントが提供されている場合はそれを使用
  if (client) {
    return updateDataWithClient(tableName, id, data, client, idField, returning)
  }

  // サーバー側の場合
  if (typeof window === "undefined" && (clientType === "server" || clientType === "action")) {
    if (!getServerSupabaseClient) {
      // 動的インポートが完了するまで待機
      const serverModule = await import("@/lib/supabase/server")
      getServerSupabaseClient = serverModule.getServerSupabaseClient
    }
    const serverClient = getServerSupabaseClient(clientType)
    return updateDataWithClient(tableName, id, data, serverClient, idField, returning)
  }

  // クライアント側の場合
  const clientSideClient = getSupabaseClient("client")
  return updateDataWithClient(tableName, id, data, clientSideClient, idField, returning)
}

// 実際のデータ更新ロジック
async function updateDataWithClient<T = any>(
  tableName: string,
  id: string,
  data: any,
  client: SupabaseClient<Database>,
  idField = "id",
  returning = "*",
): Promise<T[]> {
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
 * テーブルからデータを削除する
 */
export async function deleteData(
  tableName: string,
  id: string,
  options: {
    clientType?: "client" | "server" | "action"
    idField?: string
    client?: SupabaseClient<Database>
  } = {},
): Promise<boolean> {
  const { clientType = "client", idField = "id", client } = options

  // クライアントが提供されている場合はそれを使用
  if (client) {
    return deleteDataWithClient(tableName, id, client, idField)
  }

  // サーバー側の場合
  if (typeof window === "undefined" && (clientType === "server" || clientType === "action")) {
    if (!getServerSupabaseClient) {
      // 動的インポートが完了するまで待機
      const serverModule = await import("@/lib/supabase/server")
      getServerSupabaseClient = serverModule.getServerSupabaseClient
    }
    const serverClient = getServerSupabaseClient(clientType)
    return deleteDataWithClient(tableName, id, serverClient, idField)
  }

  // クライアント側の場合
  const clientSideClient = getSupabaseClient("client")
  return deleteDataWithClient(tableName, id, clientSideClient, idField)
}

// 実際のデータ削除ロジック
async function deleteDataWithClient(
  tableName: string,
  id: string,
  client: SupabaseClient<Database>,
  idField = "id",
): Promise<boolean> {
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

// 後方互換性のためのエイリアス
export const fetchDataFromTable = fetchData
export const insertDataToTable = insertData
export const updateDataInTable = updateData
export const deleteDataFromTable = deleteData

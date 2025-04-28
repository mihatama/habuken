// 絶対パスのインポートを修正
// @/lib/supabase/index から直接インポートするのではなく
// @/lib/supabase から必要な関数をインポート

import {
  getClientSupabase,
  fetchClientData,
  insertClientData,
  updateClientData,
  deleteClientData,
} from "@/lib/supabase"

// 後方互換性のために既存の関数名を維持
export function getClientSupabaseInstance() {
  return getClientSupabase()
}

// 既存の関数を新しい実装にマッピング
export async function fetchDataFromTable(
  tableName: string,
  options: {
    select?: string
    order?: { column: string; ascending: boolean }
    filters?: Record<string, any>
    limit?: number
    page?: number
  } = {},
) {
  return fetchClientData(tableName, options)
}

export async function insertDataToTable(tableName: string, data: any) {
  return insertClientData(tableName, data)
}

export async function updateDataInTable(tableName: string, id: string, data: any) {
  return updateClientData(tableName, id, data)
}

export async function deleteDataFromTable(tableName: string, id: string) {
  return deleteClientData(tableName, id)
}

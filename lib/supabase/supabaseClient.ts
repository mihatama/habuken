// このファイルは lib/supabase-utils.ts に統合されているため、シンプルな転送ファイルに変更

import {
  getClientSupabase,
  fetchClientData,
  insertClientData,
  updateClientData,
  deleteClientData,
} from "@/lib/supabase-utils"

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

"use client"
import { useData, useAddData, useUpdateData, useDeleteData } from "./use-data"

export type Staff = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  position: string | null
  created_at: string
  updated_at: string
}

/**
 * スタッフデータを取得するカスタムフック
 */
export function useStaff(
  options: {
    filters?: Record<string, any>
    enabled?: boolean
  } = {},
) {
  const { filters = {}, enabled = true } = options

  return useData<Staff>("staff", {
    queryKey: ["staff", filters],
    filters,
    order: { column: "full_name", ascending: true },
    enabled,
  })
}

/**
 * スタッフを追加するカスタムフック
 */
export function useAddStaff() {
  return useAddData<Staff>("staff")
}

/**
 * スタッフを更新するカスタムフック
 */
export function useUpdateStaff() {
  return useUpdateData<Staff>("staff")
}

/**
 * スタッフを削除するカスタムフック
 */
export function useDeleteStaff() {
  return useDeleteData("staff")
}

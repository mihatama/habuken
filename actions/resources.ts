"use server"

import { getServerSupabase } from "../lib/supabase-utils"
import { fetchDataInParallel } from "../lib/supabase-rpc"

// 全リソースを一度に取得する最適化関数
export async function getAllResources() {
  try {
    // 並列でデータを取得
    const [staff, heavyMachinery, vehicles, tools] = await fetchDataInParallel([
      () => getStaff(),
      () => getHeavyMachinery(),
      () => getVehicles(),
      () => getTools(),
    ])

    return {
      success: true,
      data: {
        staff: staff.success ? staff.data : [],
        heavyMachinery: heavyMachinery.success ? heavyMachinery.data : [],
        vehicles: vehicles.success ? vehicles.data : [],
        tools: tools.success ? tools.data : [],
      },
    }
  } catch (error: any) {
    console.error("リソース一括取得エラー:", error)
    return { success: false, error: error.message }
  }
}

// スタッフ一覧を取得
export async function getStaff() {
  const supabase = getServerSupabase()

  try {
    const { data, error } = await supabase.from("staff").select("*").order("full_name", { ascending: true })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("スタッフ取得エラー:", error)
    return { success: false, error: error.message }
  }
}

// 重機一覧を取得
export async function getHeavyMachinery() {
  const supabase = getServerSupabase()

  try {
    const { data, error } = await supabase.from("heavy_machinery").select("*").order("name", { ascending: true })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("重機取得エラー:", error)
    return { success: false, error: error.message }
  }
}

// 車両一覧を取得
export async function getVehicles() {
  const supabase = getServerSupabase()

  try {
    const { data, error } = await supabase.from("vehicles").select("*").order("name", { ascending: true })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("車両取得エラー:", error)
    return { success: false, error: error.message }
  }
}

// 備品一覧を取得
export async function getTools() {
  const supabase = getServerSupabase()

  try {
    const { data, error } = await supabase.from("tools").select("*").order("name", { ascending: true })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("備品取得エラー:", error)
    return { success: false, error: error.message }
  }
}

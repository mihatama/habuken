"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// スタッフ一覧を取得
export async function getStaff() {
  const supabase = createServerActionClient<Database>({ cookies })

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
  const supabase = createServerActionClient<Database>({ cookies })

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
  const supabase = createServerActionClient<Database>({ cookies })

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
  const supabase = createServerActionClient<Database>({ cookies })

  try {
    const { data, error } = await supabase.from("tools").select("*").order("name", { ascending: true })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("備品取得エラー:", error)
    return { success: false, error: error.message }
  }
}

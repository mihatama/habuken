import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

let supabase: any

export const getClientSupabase = () => {
  if (supabase) {
    return supabase
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function fetchData(tableName: string, options: any) {
  const { select = "*", filters, order, limit } = options
  const supabase = getClientSupabase()

  try {
    let query = supabase.from(tableName).select(select)

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }

    if (order) {
      query = query.order(order.column, { ascending: order.ascending })
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error)
      throw error
    }

    return { data: data || [] }
  } catch (error) {
    console.error(`Error in fetchData for ${tableName}:`, error)
    throw error
  }
}

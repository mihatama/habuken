import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

let supabase: ReturnType<typeof createClient<Database>> | null = null
let publicSupabase: ReturnType<typeof createClient<Database>> | null = null
let clientSupabase: ReturnType<typeof createClient<Database>> | null = null

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const createServerSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or Service Key")
  }

  if (supabase) {
    return supabase
  }

  supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })

  return supabase
}

export const getPublicSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase URL or Anon Key")
  }

  if (publicSupabase) {
    return publicSupabase
  }

  publicSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })

  return publicSupabase
}

export const getClientSupabaseInstance = () => {
  if (typeof window === "undefined") {
    throw new Error("getClientSupabaseInstance should only be called in client components")
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase URL or Anon Key")
  }

  if (clientSupabase) {
    return clientSupabase
  }

  clientSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  return clientSupabase
}

export const resetSupabaseClients = () => {
  supabase = null
  publicSupabase = null
  clientSupabase = null
  console.log("Supabase client instances have been reset")
}

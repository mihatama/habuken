import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createServerSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        const cookieStore = cookies()
        const cookie = cookieStore.get(name)
        return cookie?.value
      },
      set(name: string, value: string, options: any) {
        cookies().set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookies().delete({ name, ...options })
      },
    },
  })
}

let clientSupabaseInstance: any = null

export function getClientSupabaseInstance() {
  if (typeof window === "undefined") {
    throw new Error("This method can only be used on the client-side.")
  }

  if (clientSupabaseInstance) return clientSupabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not set.")
  }

  clientSupabaseInstance = createClient<Database>(supabaseUrl, supabaseKey)
  return clientSupabaseInstance
}

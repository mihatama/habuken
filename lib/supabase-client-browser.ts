import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Client-side Supabase client (for use in client components)
export const getClientSupabase = () => {
  return createClientComponentClient<Database>()
}

// Use this in client components instead of any function that uses next/headers

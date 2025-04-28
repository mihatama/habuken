import { useQuery } from "@tanstack/react-query"
import { getSupabaseClient } from "@/lib/supabase/client"

export function useAuthQuery() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      return {
        session: data.session,
        user: data.session?.user || null,
      }
    },
  })
}

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null

      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        throw error
      }

      return data
    },
    enabled: !!userId,
  })
}

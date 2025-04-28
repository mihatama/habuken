import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSupabaseClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

export function useStaffList(options = {}) {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("staff").select("*").order("full_name")

      if (error) {
        throw error
      }

      return data || []
    },
    ...options,
  })
}

export function useAddStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (staffData: any) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("staff")
        .insert({
          id: uuidv4(),
          ...staffData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
    },
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const supabase = getSupabaseClient()
      const { data: result, error } = await supabase
        .from("staff")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()

      if (error) {
        throw error
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
    },
  })
}

export function useDeleteStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("staff").delete().eq("id", id)

      if (error) {
        throw error
      }

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
    },
  })
}

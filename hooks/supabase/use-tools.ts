import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSupabaseClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

export function useToolsList(options = {}) {
  return useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("tools").select("*").order("name")

      if (error) {
        throw error
      }

      return data || []
    },
    ...options,
  })
}

export function useAddTool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (toolData: any) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("tools")
        .insert({
          id: uuidv4(),
          ...toolData,
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
      queryClient.invalidateQueries({ queryKey: ["tools"] })
    },
  })
}

export function useUpdateTool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const supabase = getSupabaseClient()
      const { data: result, error } = await supabase
        .from("tools")
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
      queryClient.invalidateQueries({ queryKey: ["tools"] })
    },
  })
}

export function useDeleteTool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("tools").delete().eq("id", id)

      if (error) {
        throw error
      }

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] })
    },
  })
}

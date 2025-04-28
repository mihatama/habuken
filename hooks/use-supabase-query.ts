import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { getSupabaseClient } from "@/lib/supabase/supabaseClient"

// Supabaseクライアントを取得するフック
export const useSupabaseClient = () => {
  return getSupabaseClient()
}

// データ取得用のカスタムフック
export function useSupabaseQuery<T>(
  key: string[],
  fetcher: (client: SupabaseClient<Database>) => Promise<T>,
  options = {},
) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: key,
    queryFn: () => fetcher(supabase),
    ...options,
  })
}

// データ更新用のカスタムフック
export function useSupabaseMutation<T, R>(
  key: string[],
  mutator: (client: SupabaseClient<Database>, data: T) => Promise<R>,
  options = {},
) {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: T) => mutator(supabase, data),
    onSuccess: () => {
      // 関連するクエリを無効化して再取得を促す
      queryClient.invalidateQueries({ queryKey: key })
    },
    ...options,
  })
}

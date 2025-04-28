import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSupabaseClient, type SupabaseClientType } from "../lib/supabase"

// Supabaseクライアントの取得
export const useSupabaseClient = () => {
  return getSupabaseClient()
}

// データ取得用のカスタムフック
export function useSupabaseQuery<T>(key: string[], fetcher: (client: SupabaseClientType) => Promise<T>, options = {}) {
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
  mutator: (client: SupabaseClientType, data: T) => Promise<R>,
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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getClientSupabase } from "../lib/supabase-utils"

// Supabaseクライアントの取得
export const useSupabaseClient = () => {
  return getClientSupabase()
}

// データ取得用のカスタムフック
export function useSupabaseQuery<T>(
  key: string[],
  fetcher: (client: ReturnType<typeof getClientSupabase>) => Promise<T>,
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
  mutator: (client: ReturnType<typeof getClientSupabase>, data: T) => Promise<R>,
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

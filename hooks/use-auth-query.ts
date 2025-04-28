import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getClientSupabase } from "../lib/supabase-utils"
import type { AuthUser } from "../types/models/user"

// 認証状態を取得するカスタムフック
export function useAuthQuery() {
  const supabase = getClientSupabase()

  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        return null
      }

      const userData: AuthUser = {
        id: session.user.id,
        email: session.user.email || "",
        user_metadata: {
          full_name: session.user.user_metadata.full_name || "",
          role: session.user.user_metadata.role || "user",
        },
      }

      return userData
    },
    staleTime: Number.POSITIVE_INFINITY, // 認証状態は手動で更新するまで新鮮と見なす
  })
}

// ログイン用のカスタムフック
export function useLogin() {
  const supabase = getClientSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return { success: true }
    },
    onSuccess: () => {
      // 認証状態を更新
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] })
    },
  })
}

// ログアウト用のカスタムフック
export function useLogout() {
  const supabase = getClientSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut()
      return { success: true }
    },
    onSuccess: () => {
      // 認証状態を更新
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] })
      // すべてのクエリをクリア
      queryClient.clear()
    },
  })
}

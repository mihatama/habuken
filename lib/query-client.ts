import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1分間はデータを新鮮と見なす
      refetchOnWindowFocus: false, // ウィンドウフォーカス時に再取得しない
      retry: 1, // エラー時に1回だけ再試行
    },
  },
})

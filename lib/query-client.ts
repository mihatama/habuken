import { QueryClient } from "@tanstack/react-query"

// グローバルなQueryClientの設定
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1分間はデータを新鮮と見なす
      cacheTime: 5 * 60 * 1000, // 5分間キャッシュを保持
      retry: 1, // エラー時に1回だけ再試行
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の再取得を無効化
    },
  },
})

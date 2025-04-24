// このファイルは静的エクスポートのために必要なパスを定義します
// Amplifyでのデプロイ時に使用されます

export const staticPages = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
  "/projects",
  "/staff",
  "/tools",
  "/shifts",
  "/leave",
  "/reports",
  "/profile",
  "/settings",
  // 他の静的に生成したいパスを追加
]

// このファイルは直接表示されることはありません
export default function StaticPages() {
  return null
}

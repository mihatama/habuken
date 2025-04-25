import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserManagement } from "@/components/user-management"
import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "ユーザー管理 | プロジェクト管理システム",
  description: "ユーザーの追加、編集、削除を行います",
}

export default async function UsersPage() {
  const supabase = createServerSupabaseClient()

  // セッションを取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // 管理者権限チェック
  const { data: roleData, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .eq("role", "admin")

  if (error || !roleData || roleData.length === 0) {
    // 管理者でない場合はダッシュボードにリダイレクト
    redirect("/dashboard")
  }

  // ユーザー一覧を取得
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      position,
      department,
      created_at,
      user_id,
      user_roles(role)
    `)
    .order("created_at", { ascending: false })

  // ロールデータを整形
  const formattedUsers =
    users?.map((user) => {
      const roles = user.user_roles ? user.user_roles.map((r: any) => r.role) : []
      return {
        ...user,
        roles,
        user_roles: undefined, // 元のネストされたデータを削除
      }
    }) || []

  return (
    <DashboardLayout title="ユーザー管理" isAdmin={true}>
      <UserManagement initialUsers={formattedUsers} />
    </DashboardLayout>
  )
}

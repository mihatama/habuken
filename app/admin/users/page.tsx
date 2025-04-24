import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserManagement } from "@/components/user-management"
import { getUsers } from "@/actions/user-management"
import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "ユーザー管理 | プロジェクト管理システム",
  description: "ユーザーの追加、編集、削除を行います",
}

export default async function UsersPage() {
  // 管理者権限チェック
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/users")
  }

  // 管理者権限チェック
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("role", "admin")

  if (!userRoles || userRoles.length === 0) {
    redirect("/dashboard?error=unauthorized")
  }

  // ユーザー一覧を取得
  const users = await getUsers()

  return (
    <DashboardLayout title="ユーザー管理" isAdmin={true}>
      <UserManagement initialUsers={users} />
    </DashboardLayout>
  )
}

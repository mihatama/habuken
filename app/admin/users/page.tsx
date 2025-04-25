import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserManagement } from "@/components/user-management"

export const metadata: Metadata = {
  title: "ユーザー管理 | プロジェクト管理システム",
  description: "ユーザーの追加、編集、削除を行います",
}

// サンプルユーザーデータ
const sampleUsers = [
  {
    id: "1",
    email: "admin@example.com",
    full_name: "管理者 太郎",
    position: "システム管理者",
    department: "IT部",
    created_at: "2023-01-01T00:00:00.000Z",
    roles: ["admin"],
    user_id: "admin",
  },
  {
    id: "2",
    email: "yamada@example.com",
    full_name: "山田 花子",
    position: "マネージャー",
    department: "営業部",
    created_at: "2023-01-02T00:00:00.000Z",
    roles: ["manager"],
    user_id: "yamada",
  },
  {
    id: "3",
    email: "tanaka@example.com",
    full_name: "田中 一郎",
    position: "スタッフ",
    department: "工事部",
    created_at: "2023-01-03T00:00:00.000Z",
    roles: ["staff"],
    user_id: "tanaka",
  },
]

export default async function UsersPage() {
  return (
    <DashboardLayout title="ユーザー管理" isAdmin={true}>
      <UserManagement initialUsers={sampleUsers} />
    </DashboardLayout>
  )
}

import type { Metadata } from "next"
import { StaffList } from "@/components/staff-list"

export const metadata: Metadata = {
  title: "スタッフ管理 | 建設業務管理システム",
  description: "スタッフの登録、編集、休暇管理を行います",
}

export default function StaffPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">スタッフ管理</h1>
      <StaffList />
    </div>
  )
}

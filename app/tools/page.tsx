import type { Metadata } from "next"
import ToolsPageClient from "./tools-page-client"

export const metadata: Metadata = {
  title: "備品管理 | 建設業務管理システム",
  description: "備品・工具の登録、編集、使用状況管理を行います",
}

// Update the page title to include the Box icon
export default function ToolsPage() {
  return (
    <div className="container mx-auto py-6">
      <ToolsPageClient />
    </div>
  )
}

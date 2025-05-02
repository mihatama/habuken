"use client"

import { ToolList } from "@/components/tool-list"

export default function ToolsPageClient() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">備品管理</h1>
      <ToolList />
    </div>
  )
}

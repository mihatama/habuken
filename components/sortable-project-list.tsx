"use client"

import { useState, useEffect } from "react"
import { useProjects } from "@/hooks/use-projects"
import { SortableContainer } from "@/components/sortable/sortable-context"
import { SortableItem } from "@/components/sortable/sortable-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/utils/date-utils"

export function SortableProjectList() {
  const { data: projects, isLoading, refetch } = useProjects()
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // 並び替え後のIDリスト
  const [sortedIds, setSortedIds] = useState<string[]>([])

  // 初期データロード時にIDリストを設定
  useEffect(() => {
    if (projects && projects.length > 0 && sortedIds.length === 0) {
      setSortedIds(projects.map((item) => item.id))
    }
  }, [projects, sortedIds.length])

  // 並び替え結果をサーバーに保存
  const saveOrder = async () => {
    if (sortedIds.length === 0) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/master/projects/order", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: sortedIds }),
      })

      if (!response.ok) {
        throw new Error("並び順の保存に失敗しました")
      }

      toast({
        title: "成功",
        description: "プロジェクトの表示順を保存しました",
      })

      // データを再取得
      refetch()
    } catch (error) {
      console.error("並び順保存エラー:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "並び順の保存に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // ドラッグ終了時の処理
  const handleDragEnd = (items: string[]) => {
    setSortedIds(items)
  }

  // プロジェクトデータをソートされた順に並べ替え
  const getSortedProjects = () => {
    if (!projects || projects.length === 0) return []
    if (sortedIds.length === 0) return projects

    // IDの順序に基づいてプロジェクトを並べ替え
    return sortedIds.map((id) => projects.find((item) => item.id === id)).filter((item) => item !== undefined)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const sortedProjects = getSortedProjects()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>プロジェクト一覧</CardTitle>
        <Button onClick={saveOrder} disabled={isSaving || sortedIds.length === 0} size="sm">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            "並び順を保存"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {sortedProjects.length > 0 ? (
          <SortableContainer items={sortedIds} onDragEnd={handleDragEnd}>
            <div className="space-y-2">
              {sortedProjects.map((project) => (
                <SortableItem key={project.id} id={project.id}>
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.start_date && formatDate(new Date(project.start_date))} 〜
                        {project.end_date && formatDate(new Date(project.end_date))}
                      </p>
                    </div>
                    <Badge
                      variant={
                        project.status === "進行中" ? "success" : project.status === "完了" ? "secondary" : "outline"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContainer>
        ) : (
          <p className="text-center text-muted-foreground py-4">プロジェクトが登録されていません</p>
        )}
      </CardContent>
    </Card>
  )
}

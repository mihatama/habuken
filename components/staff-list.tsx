"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, UserPlus, AlertCircle } from "lucide-react"
import { getStaff, deleteStaff } from "@/lib/data-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// スタッフ項目コンポーネント（メモ化）
const StaffItem = React.memo(({ staff, onEdit, onDelete }: any) => {
  return (
    <TableRow key={staff.id}>
      <TableCell className="font-medium">{staff.full_name}</TableCell>
      <TableCell>{staff.position || "未設定"}</TableCell>
      <TableCell>{staff.email || "未設定"}</TableCell>
      <TableCell>{staff.phone || "未設定"}</TableCell>
      <TableCell>
        {staff.skills && staff.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {staff.skills.map((skill: string, index: number) => (
              <Badge key={index} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          "未設定"
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(staff)}>
            編集
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(staff.id)}>
            削除
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
})

StaffItem.displayName = "StaffItem"

export function StaffList() {
  const router = useRouter()
  const [staffList, setStaffList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // スタッフデータの取得
  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("スタッフデータ取得開始")

      const startTime = performance.now()
      const data = await getStaff()
      const endTime = performance.now()

      console.log(`スタッフデータ取得完了: ${data.length}件 (${Math.round(endTime - startTime)}ms)`)
      setStaffList(data)

      // デバッグ情報を設定
      setDebugInfo({
        fetchTime: Math.round(endTime - startTime),
        recordCount: data.length,
        timestamp: new Date().toISOString(),
        sampleRecord: data.length > 0 ? { ...data[0], id: `${data[0].id.substring(0, 8)}...` } : null,
      })
    } catch (err) {
      console.error("スタッフデータ取得エラー:", err)
      setError(err instanceof Error ? err.message : "スタッフデータの取得中にエラーが発生しました")
      setDebugInfo({
        error: err instanceof Error ? err.message : "不明なエラー",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStaffData()
  }, [fetchStaffData])

  // 検索フィルター
  const filteredStaff = useMemo(() => {
    if (!searchTerm.trim()) return staffList

    const lowerSearchTerm = searchTerm.toLowerCase()
    return staffList.filter(
      (staff) =>
        staff.full_name?.toLowerCase().includes(lowerSearchTerm) ||
        staff.position?.toLowerCase().includes(lowerSearchTerm) ||
        staff.email?.toLowerCase().includes(lowerSearchTerm) ||
        staff.phone?.toLowerCase().includes(lowerSearchTerm) ||
        (staff.skills && staff.skills.some((skill: string) => skill.toLowerCase().includes(lowerSearchTerm))),
    )
  }, [staffList, searchTerm])

  // 編集ハンドラー
  const handleEdit = useCallback(
    (staff: any) => {
      router.push(`/staff/edit/${staff.id}`)
    },
    [router],
  )

  // 削除ハンドラー
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm("このスタッフを削除してもよろしいですか？")) {
      try {
        await deleteStaff(id)
        setStaffList((prev) => prev.filter((staff) => staff.id !== id))
      } catch (error) {
        console.error("スタッフ削除エラー:", error)
        alert("スタッフの削除に失敗しました")
      }
    }
  }, [])

  // 新規作成ハンドラー
  const handleCreate = useCallback(() => {
    router.push("/staff/create")
  }, [router])

  // デバッグ情報の表示/非表示
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>スタッフ一覧</CardTitle>
            <CardDescription>登録されているスタッフの一覧です</CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <UserPlus className="mr-2 h-4 w-4" />
            新規作成
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {debugInfo && showDebugInfo && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>デバッグ情報</AlertTitle>
            <AlertDescription>
              <pre className="text-xs overflow-auto max-h-40 mt-2">{JSON.stringify(debugInfo, null, 2)}</pre>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="スタッフを検索..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="ml-2 text-xs text-muted-foreground"
          >
            {showDebugInfo ? "デバッグ情報を隠す" : "デバッグ情報を表示"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchStaffData} className="ml-2">
            更新
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredStaff.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>役職</TableHead>
                  <TableHead>メール</TableHead>
                  <TableHead>電話番号</TableHead>
                  <TableHead>スキル</TableHead>
                  <TableHead>アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <StaffItem key={staff.id} staff={staff} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "検索条件に一致するスタッフが見つかりません" : "スタッフが登録されていません"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

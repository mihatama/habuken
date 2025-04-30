"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function VacationList() {
  const { toast } = useToast()
  const [vacations, setVacations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVacations()
  }, [])

  async function fetchVacations() {
    try {
      setIsLoading(true)
      setError(null)

      // APIエンドポイントを使用してデータを取得
      const response = await fetch("/api/leave-requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("休暇データの取得に失敗しました")
      }

      const data = await response.json()

      // 承認済みのデータのみをフィルタリング
      const approvedVacations = data.data.filter((vacation: any) => vacation.status === "approved")
      console.log("承認済み休暇データ:", approvedVacations)
      setVacations(approvedVacations)
    } catch (error: any) {
      console.error("休暇データの取得に失敗しました:", error)
      setError(error.message || "休暇データの取得に失敗しました")
      toast({
        title: "エラー",
        description: "休暇データの取得に失敗しました: " + (error.message || "不明なエラー"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>スタッフ休暇一覧</CardTitle>
        <Button variant="outline" size="icon" onClick={fetchVacations} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchVacations}>
              <RefreshCw className="mr-2 h-4 w-4" />
              再読み込み
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>スタッフ名</TableHead>
                <TableHead>開始日</TableHead>
                <TableHead>終了日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vacations.length > 0 ? (
                vacations.map((vacation) => (
                  <TableRow key={vacation.id}>
                    <TableCell className="font-medium">
                      {vacation.staff_name || vacation.staff?.name || "不明"}
                    </TableCell>
                    <TableCell>{formatDate(vacation.start_date)}</TableCell>
                    <TableCell>{formatDate(vacation.end_date)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    承認済み休暇データがありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

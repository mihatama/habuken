"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"

export function VacationList() {
  const { toast } = useToast()
  const supabase = createClientComponentClient()

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

      console.log("休暇データを取得中...")
      const { data, error } = await supabase
        .from("leave_requests")
        .select(`
          id,
          staff_id,
          start_date,
          end_date,
          reason,
          status,
          staff:staff_id (full_name)
        `)
        .order("start_date", { ascending: false })

      if (error) {
        console.error("休暇データ取得エラー:", error)
        throw error
      }

      console.log("取得した休暇データ:", data)
      setVacations(data || [])
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">承認済</Badge>
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">審査中</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">却下</Badge>
      default:
        return <Badge>{status}</Badge>
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
        <CardTitle>休暇一覧</CardTitle>
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
                <TableHead>理由</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vacations.length > 0 ? (
                vacations.map((vacation) => (
                  <TableRow key={vacation.id}>
                    <TableCell className="font-medium">{vacation.staff?.full_name || "不明"}</TableCell>
                    <TableCell>{formatDate(vacation.start_date)}</TableCell>
                    <TableCell>{formatDate(vacation.end_date)}</TableCell>
                    <TableCell>{vacation.reason || "-"}</TableCell>
                    <TableCell>{getStatusBadge(vacation.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    休暇データがありません
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

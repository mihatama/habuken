"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"

export function VacationList() {
  const { toast } = useToast()
  const [vacations, setVacations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVacations = async () => {
      try {
        setLoading(true)
        // シングルトンパターンを使用
        const supabase = getClientSupabase()

        const { data, error } = await supabase
          .from("leave_requests")
          .select("*, staff(full_name)")
          .eq("type", "annual")
          .order("start_date", { ascending: false })

        if (error) throw error
        setVacations(data || [])
      } catch (error) {
        console.error("年休データの取得に失敗しました:", error)
        toast({
          title: "エラー",
          description: "年休データの取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVacations()
  }, [toast])

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">承認済</Badge>
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">承認待ち</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">却下</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>年休一覧</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p>読み込み中...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>スタッフ名</TableHead>
                <TableHead>開始日</TableHead>
                <TableHead>終了日</TableHead>
                <TableHead>日数</TableHead>
                <TableHead>理由</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vacations.length > 0 ? (
                vacations.map((vacation) => (
                  <TableRow key={vacation.id}>
                    <TableCell className="font-medium">{vacation.staff?.full_name || "-"}</TableCell>
                    <TableCell>{formatDate(vacation.start_date)}</TableCell>
                    <TableCell>{formatDate(vacation.end_date)}</TableCell>
                    <TableCell>{vacation.days || "-"}</TableCell>
                    <TableCell>{vacation.reason || "-"}</TableCell>
                    <TableCell>{getStatusBadge(vacation.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    年休データがありません
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

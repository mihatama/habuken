"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fetchData, deleteData } from "@/lib/supabase-client"

// 休暇データの型定義
interface Vacation {
  id: string
  staffId: string
  staffName: string
  date: Date
  type: string
}

export function VacationList() {
  const [vacations, setVacations] = useState<Vacation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Supabaseからデータを取得
  useEffect(() => {
    const fetchVacations = async () => {
      try {
        setLoading(true)

        // 共通関数を使用してデータを取得
        const { data } = await fetchData("vacations", {
          select: `
            id,
            staff_id,
            date,
            type,
            staff:staff_id (
              id,
              full_name
            )
          `,
          order: { column: "date", ascending: false },
        })

        // データを整形
        const formattedData = data.map((item: any) => ({
          id: item.id,
          staffId: item.staff_id,
          staffName: item.staff?.full_name || "不明",
          date: new Date(item.date),
          type: item.type,
        }))

        setVacations(formattedData)
      } catch (error) {
        console.error("休暇データ取得エラー:", error)
        toast({
          title: "エラー",
          description: "休暇データの取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVacations()

    // 定期的に更新（実際のアプリではイベントベースの更新が望ましい）
    const intervalId = setInterval(fetchVacations, 30000) // 30秒ごとに更新

    return () => clearInterval(intervalId)
  }, [toast])

  const filteredVacations = vacations.filter(
    (vacation) =>
      vacation.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacation.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteVacation = async (id: string) => {
    try {
      // 共通関数を使用してデータを削除
      await deleteData("vacations", id)

      // 成功したら、ローカルの状態を更新
      setVacations(vacations.filter((v) => v.id !== id))

      toast({
        title: "削除完了",
        description: "休暇データを削除しました",
      })
    } catch (error) {
      console.error("休暇削除エラー:", error)
      toast({
        title: "エラー",
        description: "休暇データの削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>年休一覧</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>スタッフ名</TableHead>
                <TableHead>日付</TableHead>
                <TableHead>種類</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVacations.length > 0 ? (
                filteredVacations.map((vacation) => (
                  <TableRow key={vacation.id}>
                    <TableCell className="font-medium">{vacation.staffName}</TableCell>
                    <TableCell>{vacation.date.toLocaleDateString()}</TableCell>
                    <TableCell>{vacation.type}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" onClick={() => handleDeleteVacation(vacation.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    {searchTerm ? "該当する年休はありません" : "年休データがありません"}
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

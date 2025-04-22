"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { getAllVacations } from "@/data/sample-data"

export function VacationList() {
  const [vacations, setVacations] = useState(getAllVacations())
  const [searchTerm, setSearchTerm] = useState("")

  // 休暇申請が承認されたときに年休一覧を更新
  useEffect(() => {
    // 定期的に最新の休暇データを取得
    const updateVacations = () => {
      setVacations(getAllVacations())
    }

    // コンポーネントマウント時に一度実行
    updateVacations()

    // 1秒ごとに更新（実際のアプリではイベントベースの更新が望ましい）
    const intervalId = setInterval(updateVacations, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const filteredVacations = vacations.filter(
    (vacation) =>
      vacation.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacation.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteVacation = (staffId: number, date: Date) => {
    setVacations(vacations.filter((v) => !(v.staffId === staffId && v.date.getTime() === date.getTime())))
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
          {/* 年休登録ボタンを削除 */}
        </div>
      </CardHeader>
      <CardContent>
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
            {filteredVacations.map((vacation, index) => (
              <TableRow key={`${vacation.staffId}-${vacation.date.getTime()}-${index}`}>
                <TableCell className="font-medium">{vacation.staffName}</TableCell>
                <TableCell>{vacation.date.toLocaleDateString()}</TableCell>
                <TableCell>{vacation.type}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteVacation(vacation.staffId, vacation.date)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredVacations.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  該当する年休はありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

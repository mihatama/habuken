"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Trash2, Loader2, Calendar } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { createClient } from "@supabase/supabase-js"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

// 休暇データの型定義
interface Vacation {
  id: string
  staff_id: string
  staff_name: string
  start_date: string
  end_date: string
  reason: string
  status: "pending" | "approved" | "rejected"
  [key: string]: any
}

// Supabaseクライアントの作成
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

// ステータスに応じたバッジスタイルを取得
function getStatusStyle(status: string) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    default:
      return "bg-yellow-100 text-yellow-800"
  }
}

// ステータスの日本語表示
function getStatusText(status: string) {
  switch (status) {
    case "approved":
      return "承認済"
    case "rejected":
      return "却下"
    default:
      return "審査中"
  }
}

export function VacationList() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 休暇データを取得するクエリ
  const { data: vacations = [], isLoading: loading } = useQuery({
    queryKey: ["vacations"],
    queryFn: async () => {
      try {
        // leave_requestsテーブルから休暇データを取得
        const { data: leaveRequestsData, error: leaveRequestsError } = await supabase
          .from("leave_requests")
          .select("*")
          .order("start_date", { ascending: false })

        if (leaveRequestsError) {
          console.error("休暇データ取得エラー:", leaveRequestsError)
          throw leaveRequestsError
        }

        if (!leaveRequestsData || leaveRequestsData.length === 0) {
          return []
        }

        // スタッフIDのリストを作成
        const staffIds = [...new Set(leaveRequestsData.map((request) => request.staff_id).filter(Boolean))]

        // スタッフデータを取得
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("id, full_name")
          .in("id", staffIds)

        if (staffError) {
          console.error("スタッフデータ取得エラー:", staffError)
          // スタッフデータの取得に失敗しても、休暇データは返す
        }

        // スタッフIDをキーとしたマップを作成
        const staffMap = new Map()
        staffData?.forEach((staff) => {
          staffMap.set(staff.id, staff.full_name)
        })

        // データを整形
        return leaveRequestsData.map((request) => ({
          ...request,
          staff_name: staffMap.get(request.staff_id) || "不明",
        }))
      } catch (error) {
        console.error("休暇取得エラー:", error)
        toast({
          title: "エラー",
          description: "休暇データの取得に失敗しました",
          variant: "destructive",
        })
        return []
      }
    },
  })

  // 休暇を削除するミューテーション
  const deleteVacationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leave_requests").delete().eq("id", id)
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] })
      toast({
        title: "成功",
        description: "休暇申請が削除されました",
      })
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "休暇申請の削除に失敗しました",
        variant: "destructive",
      })
    },
  })

  const filteredVacations = vacations.filter(
    (vacation) =>
      vacation.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacation.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteVacation = async (id: string) => {
    try {
      await deleteVacationMutation.mutateAsync(id)
    } catch (error) {
      console.error("休暇削除エラー:", error)
    }
  }

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy年MM月dd日", { locale: ja })
    } catch (e) {
      return dateString
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>休暇申請一覧</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            休暇申請
          </Button>
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
                <TableHead>開始日</TableHead>
                <TableHead>終了日</TableHead>
                <TableHead>理由</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVacations.length > 0 ? (
                filteredVacations.map((vacation) => (
                  <TableRow key={vacation.id}>
                    <TableCell className="font-medium">{vacation.staff_name}</TableCell>
                    <TableCell>{formatDate(vacation.start_date)}</TableCell>
                    <TableCell>{formatDate(vacation.end_date)}</TableCell>
                    <TableCell>{vacation.reason}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(vacation.status)}`}>
                        {getStatusText(vacation.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" onClick={() => handleDeleteVacation(vacation.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    {searchTerm ? "該当する休暇申請はありません" : "休暇申請データがありません"}
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

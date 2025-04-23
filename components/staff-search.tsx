"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabaseInstance } from "@/lib/supabase/supabaseClient"

interface StaffSearchProps {
  selectedStaff: string[]
  onStaffChange: (staffId: string, checked: boolean) => void
  showSelected?: boolean
}

export function StaffSearch({ selectedStaff, onStaffChange, showSelected = true }: StaffSearchProps) {
  const { toast } = useToast()
  const [staffList, setStaffList] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // スタッフデータを取得
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true)
        const supabase = getClientSupabaseInstance()
        const { data, error } = await supabase.from("staff").select("*").order("full_name", { ascending: true })

        if (error) throw error

        if (data) {
          setStaffList(data)
        }
      } catch (error) {
        console.error("スタッフ取得エラー:", error)
        toast({
          title: "エラー",
          description: "スタッフ一覧の取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStaff()
  }, [toast])

  // 検索条件に一致するスタッフをフィルタリング
  const filteredStaff = staffList.filter(
    (staff) =>
      staff.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 選択されたスタッフの情報を取得
  const getSelectedStaffInfo = () => {
    return staffList.filter((staff) => selectedStaff.includes(staff.id))
  }

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="スタッフを検索（名前、役職、部署など）"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* 選択済みスタッフ表示 */}
      {showSelected && selectedStaff.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">選択済みスタッフ</h4>
          <div className="flex flex-wrap gap-2">
            {getSelectedStaffInfo().map((staff) => (
              <Badge key={staff.id} variant="outline" className="flex items-center gap-1 py-1">
                {staff.full_name}
                <button
                  onClick={() => onStaffChange(staff.id, false)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* スタッフ一覧 */}
      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <span>スタッフデータを読み込み中...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>名前</TableHead>
                <TableHead>役職</TableHead>
                <TableHead>部署</TableHead>
                <TableHead>連絡先</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedStaff.includes(staff.id)}
                        onCheckedChange={(checked) => onStaffChange(staff.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{staff.full_name}</TableCell>
                    <TableCell>{staff.position || "-"}</TableCell>
                    <TableCell>{staff.department || "-"}</TableCell>
                    <TableCell>{staff.phone || staff.email || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    検索条件に一致するスタッフが見つかりません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { getClientSupabaseInstance } from "@/lib/supabase"

interface Staff {
  id: string
  full_name: string
  position: string
  department: string
  email: string
  phone: string
  // 他のスタッフ関連フィールド
}

interface StaffSearchProps {
  selectedStaff: Staff[]
  onStaffChange: (staff: Staff[]) => void
}

export function StaffSearch({ selectedStaff = [], onStaffChange }: StaffSearchProps) {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // スタッフデータの取得
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true)
        const supabase = getClientSupabaseInstance()
        const { data, error } = await supabase.from("staff").select("*").order("full_name", { ascending: true })

        if (error) throw error

        if (data) {
          console.log("取得したスタッフデータ:", data)
          setStaffList(data)
          setFilteredStaff(data)
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

  // 検索フィルタリング
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStaff(staffList)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = staffList.filter(
        (staff) =>
          staff.full_name.toLowerCase().includes(query) ||
          staff.position.toLowerCase().includes(query) ||
          staff.department.toLowerCase().includes(query),
      )
      setFilteredStaff(filtered)
    }
  }, [searchQuery, staffList])

  // スタッフの選択状態を切り替える
  const toggleStaffSelection = (staff: Staff) => {
    const isSelected = selectedStaff.some((s) => s.id === staff.id)
    let updatedSelection

    if (isSelected) {
      updatedSelection = selectedStaff.filter((s) => s.id !== staff.id)
    } else {
      updatedSelection = [...selectedStaff, staff]
    }

    onStaffChange(updatedSelection)
  }

  // スタッフが選択されているかチェック
  const isStaffSelected = (staffId: string) => {
    return selectedStaff.some((staff) => staff.id === staffId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="名前、役職、部署で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        {searchQuery && (
          <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
            クリア
          </Button>
        )}
      </div>

      <div className="max-h-60 overflow-y-auto border rounded-md">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">スタッフデータを読み込み中...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">該当するスタッフが見つかりません</div>
        ) : (
          <ul className="divide-y">
            {filteredStaff.map((staff) => (
              <li key={staff.id} className="flex items-center p-2 hover:bg-muted/50">
                <Checkbox
                  id={`staff-${staff.id}`}
                  checked={isStaffSelected(staff.id)}
                  onCheckedChange={() => toggleStaffSelection(staff)}
                  className="mr-2"
                />
                <label
                  htmlFor={`staff-${staff.id}`}
                  className="flex flex-1 cursor-pointer text-sm"
                  onClick={() => toggleStaffSelection(staff)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{staff.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {staff.position} • {staff.department}
                    </div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        {selectedStaff.length > 0 ? `${selectedStaff.length}名のスタッフを選択中` : "スタッフを選択してください"}
      </div>
    </div>
  )
}

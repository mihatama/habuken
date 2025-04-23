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

interface HeavyMachinerySearchProps {
  selectedMachinery: string[]
  onMachineryChange: (machineryId: string, checked: boolean) => void
  showSelected?: boolean
}

export function HeavyMachinerySearch({
  selectedMachinery,
  onMachineryChange,
  showSelected = true,
}: HeavyMachinerySearchProps) {
  const { toast } = useToast()
  const [machineryList, setMachineryList] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // 重機データを取得
  useEffect(() => {
    const fetchHeavyMachinery = async () => {
      try {
        setIsLoading(true)
        const supabase = getClientSupabaseInstance()
        const { data, error } = await supabase.from("heavy_machinery").select("*").order("name", { ascending: true })

        if (error) throw error

        if (data) {
          setMachineryList(data)
        }
      } catch (error) {
        console.error("重機取得エラー:", error)
        toast({
          title: "エラー",
          description: "重機一覧の取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeavyMachinery()
  }, [toast])

  // 検索条件に一致する重機をフィルタリング
  const filteredMachinery = machineryList.filter(
    (machinery) =>
      machinery.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machinery.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machinery.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machinery.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 選択された重機の情報を取得
  const getSelectedMachineryInfo = () => {
    return machineryList.filter((machinery) => selectedMachinery.includes(machinery.id))
  }

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="重機を検索（名前、種類、モデル、場所など）"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* 選択済み重機表示 */}
      {showSelected && selectedMachinery.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">選択済み重機</h4>
          <div className="flex flex-wrap gap-2">
            {getSelectedMachineryInfo().map((machinery) => (
              <Badge key={machinery.id} variant="outline" className="flex items-center gap-1 py-1">
                {machinery.name}
                <button
                  onClick={() => onMachineryChange(machinery.id, false)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 重機一覧 */}
      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <span>重機データを読み込み中...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>名前</TableHead>
                <TableHead>種類</TableHead>
                <TableHead>モデル</TableHead>
                <TableHead>所有形態</TableHead>
                <TableHead>場所</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachinery.length > 0 ? (
                filteredMachinery.map((machinery) => (
                  <TableRow key={machinery.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedMachinery.includes(machinery.id)}
                        onCheckedChange={(checked) => onMachineryChange(machinery.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{machinery.name}</TableCell>
                    <TableCell>{machinery.type || "-"}</TableCell>
                    <TableCell>{machinery.model || "-"}</TableCell>
                    <TableCell>{machinery.ownership_type || "-"}</TableCell>
                    <TableCell>{machinery.location || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    検索条件に一致する重機が見つかりません
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

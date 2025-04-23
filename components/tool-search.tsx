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

interface ToolSearchProps {
  selectedTools: string[]
  onToolChange: (toolId: string, checked: boolean) => void
  showSelected?: boolean
}

export function ToolSearch({ selectedTools, onToolChange, showSelected = true }: ToolSearchProps) {
  const { toast } = useToast()
  const [toolList, setToolList] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // 備品データを取得
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true)
        const supabase = getClientSupabaseInstance()
        const { data, error } = await supabase.from("tools").select("*").order("name", { ascending: true })

        if (error) throw error

        if (data) {
          setToolList(data)
        }
      } catch (error) {
        console.error("備品取得エラー:", error)
        toast({
          title: "エラー",
          description: "備品一覧の取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTools()
  }, [toast])

  // 検索条件に一致する備品をフィルタリング
  const filteredTools = toolList.filter(
    (tool) =>
      tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.storage_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.condition?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 選択された備品の情報を取得
  const getSelectedToolsInfo = () => {
    return toolList.filter((tool) => selectedTools.includes(tool.id))
  }

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="備品を検索（名前、カテゴリ、保管場所など）"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* 選択済み備品表示 */}
      {showSelected && selectedTools.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">選択済み備品</h4>
          <div className="flex flex-wrap gap-2">
            {getSelectedToolsInfo().map((tool) => (
              <Badge key={tool.id} variant="outline" className="flex items-center gap-1 py-1">
                {tool.name}
                <button onClick={() => onToolChange(tool.id, false)} className="ml-1 rounded-full hover:bg-muted p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 備品一覧 */}
      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <span>備品データを読み込み中...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>名前</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>保管場所</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>最終メンテナンス日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <TableRow key={tool.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedTools.includes(tool.id)}
                        onCheckedChange={(checked) => onToolChange(tool.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{tool.name}</TableCell>
                    <TableCell>{tool.category || "-"}</TableCell>
                    <TableCell>{tool.storage_location || "-"}</TableCell>
                    <TableCell>{tool.condition || "-"}</TableCell>
                    <TableCell>
                      {tool.last_maintenance_date
                        ? new Date(tool.last_maintenance_date).toLocaleDateString("ja-JP")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    検索条件に一致する備品が見つかりません
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

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

interface VehicleSearchProps {
  selectedVehicles: string[]
  onVehicleChange: (vehicleId: string, checked: boolean) => void
  showSelected?: boolean
}

export function VehicleSearch({ selectedVehicles, onVehicleChange, showSelected = true }: VehicleSearchProps) {
  const { toast } = useToast()
  const [vehicleList, setVehicleList] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // 車両データを取得
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true)
        const supabase = getClientSupabaseInstance()
        const { data, error } = await supabase.from("vehicles").select("*").order("name", { ascending: true })

        if (error) throw error

        if (data) {
          setVehicleList(data)
        }
      } catch (error) {
        console.error("車両取得エラー:", error)
        toast({
          title: "エラー",
          description: "車両一覧の取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVehicles()
  }, [toast])

  // 検索条件に一致する車両をフィルタリング
  const filteredVehicles = vehicleList.filter(
    (vehicle) =>
      vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 選択された車両の情報を取得
  const getSelectedVehiclesInfo = () => {
    return vehicleList.filter((vehicle) => selectedVehicles.includes(vehicle.id))
  }

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="車両を検索（名前、種類、モデル、ナンバー、場所など）"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* 選択済み車両表示 */}
      {showSelected && selectedVehicles.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">選択済み車両</h4>
          <div className="flex flex-wrap gap-2">
            {getSelectedVehiclesInfo().map((vehicle) => (
              <Badge key={vehicle.id} variant="outline" className="flex items-center gap-1 py-1">
                {vehicle.name}
                <button
                  onClick={() => onVehicleChange(vehicle.id, false)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 車両一覧 */}
      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <span>車両データを読み込み中...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>名前</TableHead>
                <TableHead>種類</TableHead>
                <TableHead>モデル</TableHead>
                <TableHead>ナンバー</TableHead>
                <TableHead>所有形態</TableHead>
                <TableHead>場所</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedVehicles.includes(vehicle.id)}
                        onCheckedChange={(checked) => onVehicleChange(vehicle.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                    <TableCell>{vehicle.type || "-"}</TableCell>
                    <TableCell>{vehicle.model || "-"}</TableCell>
                    <TableCell>{vehicle.license_plate || "-"}</TableCell>
                    <TableCell>{vehicle.ownership_type || "-"}</TableCell>
                    <TableCell>{vehicle.location || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    検索条件に一致する車両が見つかりません
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

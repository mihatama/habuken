"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2, CheckCircle, Users, Truck, Package } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

export function DealRegistrationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    dealName: "",
    clientName: "",
    startDate: "",
    endDate: "",
    description: "",
    location: "",
    status: "pending",
    selectedStaff: [] as string[],
    selectedHeavyMachinery: [] as string[],
    selectedVehicles: [] as string[],
    selectedTools: [] as string[],
  })

  // リソースデータ
  const [staffList, setStaffList] = useState<any[]>([])
  const [heavyMachineryList, setHeavyMachineryList] = useState<any[]>([])
  const [vehiclesList, setVehiclesList] = useState<any[]>([])
  const [toolsList, setToolsList] = useState<any[]>([])

  // 検索用の状態
  const [searchStaff, setSearchStaff] = useState("")
  const [searchHeavyMachinery, setSearchHeavyMachinery] = useState("")
  const [searchVehicles, setSearchVehicles] = useState("")
  const [searchTools, setSearchTools] = useState("")

  // リソースデータの取得
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const supabase = getClientSupabase()

        // スタッフデータを取得
        const { data: staff, error: staffError } = await supabase.from("staff").select("*")
        if (staffError) throw staffError
        setStaffList(staff || [])

        // 重機データを取得
        const { data: heavyMachinery, error: heavyMachineryError } = await supabase.from("heavy_machinery").select("*")
        if (heavyMachineryError) throw heavyMachineryError
        setHeavyMachineryList(heavyMachinery || [])

        // 車両データを取得
        const { data: vehicles, error: vehiclesError } = await supabase.from("vehicles").select("*")
        if (vehiclesError) throw vehiclesError
        setVehiclesList(vehicles || [])

        // 備品データを取得
        const { data: tools, error: toolsError } = await supabase.from("tools").select("*")
        if (toolsError) throw toolsError
        setToolsList(tools || [])
      } catch (error) {
        console.error("リソースデータ取得エラー:", error)
        alert("データの取得中にエラーが発生しました。")
      }
    }

    fetchResources()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // スタッフの選択状態を変更する関数
  const handleStaffChange = (staffId: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, selectedStaff: [...prev.selectedStaff, staffId] }
      } else {
        return { ...prev, selectedStaff: prev.selectedStaff.filter((id) => id !== staffId) }
      }
    })
  }

  // 重機の選択状態を変更する関数
  const handleHeavyMachineryChange = (machineryId: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, selectedHeavyMachinery: [...prev.selectedHeavyMachinery, machineryId] }
      } else {
        return { ...prev, selectedHeavyMachinery: prev.selectedHeavyMachinery.filter((id) => id !== machineryId) }
      }
    })
  }

  // 車両の選択状態を変更する関数
  const handleVehicleChange = (vehicleId: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, selectedVehicles: [...prev.selectedVehicles, vehicleId] }
      } else {
        return { ...prev, selectedVehicles: prev.selectedVehicles.filter((id) => id !== vehicleId) }
      }
    })
  }

  // 備品の選択状態を変更する関数
  const handleToolChange = (toolId: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, selectedTools: [...prev.selectedTools, toolId] }
      } else {
        return { ...prev, selectedTools: prev.selectedTools.filter((id) => id !== toolId) }
      }
    })
  }

  // 選択したスタッフの情報を取得
  const getSelectedStaffInfo = () => {
    return staffList.filter((staff) => formData.selectedStaff.includes(staff.id))
  }

  // 選択した重機の情報を取得
  const getSelectedHeavyMachineryInfo = () => {
    return heavyMachineryList.filter((machinery) => formData.selectedHeavyMachinery.includes(machinery.id))
  }

  // 選択した車両の情報を取得
  const getSelectedVehiclesInfo = () => {
    return vehiclesList.filter((vehicle) => formData.selectedVehicles.includes(vehicle.id))
  }

  // 選択した備品の情報を取得
  const getSelectedToolsInfo = () => {
    return toolsList.filter((tool) => formData.selectedTools.includes(tool.id))
  }

  // 検索条件に一致するスタッフをフィルタリング
  const filteredStaff = staffList.filter(
    (staff) =>
      staff.full_name?.toLowerCase().includes(searchStaff.toLowerCase()) ||
      staff.position?.toLowerCase().includes(searchStaff.toLowerCase()),
  )

  // 検索条件に一致する重機をフィルタリング
  const filteredHeavyMachinery = heavyMachineryList.filter(
    (machinery) =>
      machinery.name?.toLowerCase().includes(searchHeavyMachinery.toLowerCase()) ||
      machinery.type?.toLowerCase().includes(searchHeavyMachinery.toLowerCase()),
  )

  // 検索条件に一致する車両をフィルタリング
  const filteredVehicles = vehiclesList.filter(
    (vehicle) =>
      vehicle.name?.toLowerCase().includes(searchVehicles.toLowerCase()) ||
      vehicle.type?.toLowerCase().includes(searchVehicles.toLowerCase()),
  )

  // 検索条件に一致する備品をフィルタリング
  const filteredTools = toolsList.filter(
    (tool) =>
      tool.name?.toLowerCase().includes(searchTools.toLowerCase()) ||
      tool.storage_location?.toLowerCase().includes(searchTools.toLowerCase()),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = getClientSupabase()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("認証されていません。再度ログインしてください。")
      }

      // Insert deal into database
      const { data, error } = await supabase
        .from("deals")
        .insert([
          {
            name: formData.dealName,
            client_name: formData.clientName || null,
            start_date: formData.startDate,
            end_date: formData.endDate,
            description: formData.description,
            location: formData.location,
            status: formData.status || "pending",
            created_by: user.id,
          },
        ])
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error("案件の登録に失敗しました。")
      }

      const dealId = data[0].id

      // スタッフの割り当て
      if (formData.selectedStaff.length > 0) {
        const staffAssignments = formData.selectedStaff.map((staffId) => ({
          deal_id: dealId,
          staff_id: staffId,
        }))

        const { error: staffError } = await supabase.from("deal_staff").insert(staffAssignments)
        if (staffError) throw staffError
      }

      // 重機の割り当て
      if (formData.selectedHeavyMachinery.length > 0) {
        const machineryAssignments = formData.selectedHeavyMachinery.map((machineryId) => ({
          deal_id: dealId,
          machinery_id: machineryId,
        }))

        const { error: machineryError } = await supabase.from("deal_machinery").insert(machineryAssignments)
        if (machineryError) throw machineryError
      }

      // 車両の割り当て
      if (formData.selectedVehicles.length > 0) {
        const vehicleAssignments = formData.selectedVehicles.map((vehicleId) => ({
          deal_id: dealId,
          vehicle_id: vehicleId,
        }))

        const { error: vehicleError } = await supabase.from("deal_vehicles").insert(vehicleAssignments)
        if (vehicleError) throw vehicleError
      }

      // 備品の割り当て
      if (formData.selectedTools.length > 0) {
        const toolAssignments = formData.selectedTools.map((toolId) => ({
          deal_id: dealId,
          tool_id: toolId,
        }))

        const { error: toolError } = await supabase.from("deal_tools").insert(toolAssignments)
        if (toolError) throw toolError
      }

      setSuccess(true)

      // Reset form after successful submission
      setTimeout(() => {
        router.push("/deals")
      }, 2000)
    } catch (error) {
      console.error("案件登録エラー:", error)
      alert("案件の登録中にエラーが発生しました。もう一度お試しください。")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="p-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">案件が正常に登録されました</h2>
          <p className="text-muted-foreground mb-6">案件一覧ページにリダイレクトします...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              スタッフ
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              重機・車両
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              備品
            </TabsTrigger>
          </TabsList>

          {/* 基本情報タブ */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dealName">
                  案件名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dealName"
                  name="dealName"
                  required
                  value={formData.dealName}
                  onChange={handleChange}
                  placeholder="案件名を入力"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">クライアント名</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="クライアント名を入力"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">
                  開始予定日 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">終了予定日</Label>
                <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">場所</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="東京都新宿区..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">ステータス</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="pending">検討中</option>
                  <option value="approved">承認済み</option>
                  <option value="in_progress">進行中</option>
                  <option value="completed">完了</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">案件詳細</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="案件の詳細情報を入力してください..."
              />
            </div>
          </TabsContent>

          {/* スタッフタブ */}
          <TabsContent value="staff" className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="スタッフを検索（名前、役職など）"
                value={searchStaff}
                onChange={(e) => setSearchStaff(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* 選択済みスタッフ表示 */}
            {formData.selectedStaff.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">選択済みスタッフ</h4>
                <div className="flex flex-wrap gap-2">
                  {getSelectedStaffInfo().map((staff) => (
                    <Badge key={staff.id} variant="outline" className="flex items-center gap-1 py-1">
                      {staff.full_name}
                      <button
                        type="button"
                        onClick={() => handleStaffChange(staff.id, false)}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>名前</TableHead>
                    <TableHead>役職</TableHead>
                    <TableHead>連絡先</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staff) => (
                      <TableRow key={staff.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Checkbox
                            checked={formData.selectedStaff.includes(staff.id)}
                            onCheckedChange={(checked) => handleStaffChange(staff.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{staff.full_name}</TableCell>
                        <TableCell>{staff.position || "-"}</TableCell>
                        <TableCell>{staff.phone || "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        検索条件に一致するスタッフが見つかりません
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          {/* 重機・車両タブ */}
          <TabsContent value="equipment" className="space-y-6">
            <Tabs defaultValue="heavy" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="heavy">重機</TabsTrigger>
                <TabsTrigger value="vehicles">車両</TabsTrigger>
              </TabsList>

              <TabsContent value="heavy" className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="重機を検索（名前、種類など）"
                    value={searchHeavyMachinery}
                    onChange={(e) => setSearchHeavyMachinery(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* 選択済み重機表示 */}
                {formData.selectedHeavyMachinery.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">選択済み重機</h4>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedHeavyMachineryInfo().map((machinery) => (
                        <Badge key={machinery.id} variant="outline" className="flex items-center gap-1 py-1">
                          {machinery.name}
                          <button
                            type="button"
                            onClick={() => handleHeavyMachineryChange(machinery.id, false)}
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>名前</TableHead>
                        <TableHead>種類</TableHead>
                        <TableHead>所有形態</TableHead>
                        <TableHead>場所</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHeavyMachinery.length > 0 ? (
                        filteredHeavyMachinery.map((machinery) => (
                          <TableRow key={machinery.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell>
                              <Checkbox
                                checked={formData.selectedHeavyMachinery.includes(machinery.id)}
                                onCheckedChange={(checked) =>
                                  handleHeavyMachineryChange(machinery.id, checked as boolean)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">{machinery.name}</TableCell>
                            <TableCell>{machinery.type || "-"}</TableCell>
                            <TableCell>{machinery.ownership_type || "-"}</TableCell>
                            <TableCell>{machinery.location || "-"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            検索条件に一致する重機が見つかりません
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="vehicles" className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="車両を検索（名前、種類など）"
                    value={searchVehicles}
                    onChange={(e) => setSearchVehicles(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* 選択済み車両表示 */}
                {formData.selectedVehicles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">選択済み車両</h4>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedVehiclesInfo().map((vehicle) => (
                        <Badge key={vehicle.id} variant="outline" className="flex items-center gap-1 py-1">
                          {vehicle.name}
                          <button
                            type="button"
                            onClick={() => handleVehicleChange(vehicle.id, false)}
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>名前</TableHead>
                        <TableHead>種類</TableHead>
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
                                checked={formData.selectedVehicles.includes(vehicle.id)}
                                onCheckedChange={(checked) => handleVehicleChange(vehicle.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{vehicle.name}</TableCell>
                            <TableCell>{vehicle.type || "-"}</TableCell>
                            <TableCell>{vehicle.ownership_type || "-"}</TableCell>
                            <TableCell>{vehicle.location || "-"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            検索条件に一致する車両が見つかりません
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* 備品タブ */}
          <TabsContent value="tools" className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="備品を検索（名前、保管場所など）"
                value={searchTools}
                onChange={(e) => setSearchTools(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* 選択済み備品表示 */}
            {formData.selectedTools.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">選択済み備品</h4>
                <div className="flex flex-wrap gap-2">
                  {getSelectedToolsInfo().map((tool) => (
                    <Badge key={tool.id} variant="outline" className="flex items-center gap-1 py-1">
                      {tool.name}
                      <button
                        type="button"
                        onClick={() => handleToolChange(tool.id, false)}
                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 備品一覧 */}
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>名前</TableHead>
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
                            checked={formData.selectedTools.includes(tool.id)}
                            onCheckedChange={(checked) => handleToolChange(tool.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{tool.name}</TableCell>
                        <TableCell>{tool.storage_location || "-"}</TableCell>
                        <TableCell>{tool.condition || "-"}</TableCell>
                        <TableCell>
                          {tool.last_maintenance_date ? new Date(tool.last_maintenance_date).toLocaleDateString() : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        検索条件に一致する備品が見つかりません
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                送信中...
              </>
            ) : (
              "案件を登録"
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
// このフォームは既に以下の機能を実装しています：
// - 案件名の登録
// - スタッフの紐づけ
// - 重機の紐づけ
// - 車両の紐づけ
// - 備品の紐づけ
// - 開始日と終了日の登録
// 修正は必要ありません

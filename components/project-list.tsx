"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Loader2, Search, X, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/use-projects"
import { useStaff, useHeavyMachinery, useVehicles, useTools } from "@/hooks/use-resources"
import { useAuth } from "@/contexts/auth-context"

export function ProjectList() {
  const { toast } = useToast()
  const { user } = useAuth()

  // React Queryフックを使用してデータを取得
  const { data: projects = [], isLoading: dataLoading, refetch: refetchProjects, error: projectsError } = useProjects()

  const { data: staffList = [] } = useStaff()
  const { data: heavyMachineryList = [] } = useHeavyMachinery()
  const { data: vehiclesList = [] } = useVehicles()
  const { data: toolsList = [] } = useTools()

  // ミューテーションフックを使用してデータを更新
  const createProjectMutation = useCreateProject()
  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<any>(null)

  // 検索用の状態
  const [searchStaff, setSearchStaff] = useState("")
  const [searchHeavyMachinery, setSearchHeavyMachinery] = useState("")
  const [searchVehicles, setSearchVehicles] = useState("")
  const [searchTools, setSearchTools] = useState("")

  // 新規案件の状態
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "未着手",
    client: "",
    location: "",
    selectedStaff: [] as string[],
    selectedHeavyMachinery: [] as string[],
    selectedVehicles: [] as string[],
    selectedTools: [] as string[],
  })

  // コンポーネントマウント時にデータを再取得
  useEffect(() => {
    console.log("ProjectList component mounted, fetching data...")
    refetchProjects()
  }, [refetchProjects])

  // データ取得結果をログに出力
  useEffect(() => {
    if (projects && projects.length > 0) {
      console.log("Projects loaded:", projects.length, "projects")
    }
  }, [projects])

  // 検索条件に一致するプロジェクトをフィルタリング
  const filteredProjects = projects.filter(
    (project) =>
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  // スタッフの選択状態を変更する関数
  const handleStaffChange = (staffId: string, checked: boolean) => {
    setNewProject((prev) => {
      if (checked) {
        return { ...prev, selectedStaff: [...prev.selectedStaff, staffId] }
      } else {
        return { ...prev, selectedStaff: prev.selectedStaff.filter((id) => id !== staffId) }
      }
    })
  }

  // 重機の選択状態を変更する関数
  const handleHeavyMachineryChange = (machineryId: string, checked: boolean) => {
    setNewProject((prev) => {
      if (checked) {
        return { ...prev, selectedHeavyMachinery: [...prev.selectedHeavyMachinery, machineryId] }
      } else {
        return { ...prev, selectedHeavyMachinery: prev.selectedHeavyMachinery.filter((id) => id !== machineryId) }
      }
    })
  }

  // 車両の選択状態を変更する関数
  const handleVehicleChange = (vehicleId: string, checked: boolean) => {
    setNewProject((prev) => {
      if (checked) {
        return { ...prev, selectedVehicles: [...prev.selectedVehicles, vehicleId] }
      } else {
        return { ...prev, selectedVehicles: prev.selectedVehicles.filter((id) => id !== vehicleId) }
      }
    })
  }

  // 備品の選択状態を変更する関数
  const handleToolChange = (toolId: string, checked: boolean) => {
    setNewProject((prev) => {
      if (checked) {
        return { ...prev, selectedTools: [...prev.selectedTools, toolId] }
      } else {
        return { ...prev, selectedTools: prev.selectedTools.filter((id) => id !== toolId) }
      }
    })
  }

  // 選択したスタッフの情報を取得
  const getSelectedStaffInfo = () => {
    return staffList.filter((staff) => newProject.selectedStaff.includes(staff.id))
  }

  // 選択した重機の情報を取得
  const getSelectedHeavyMachineryInfo = () => {
    return heavyMachineryList.filter((machinery) => newProject.selectedHeavyMachinery.includes(machinery.id))
  }

  // 選択した車両の情報を取得
  const getSelectedVehiclesInfo = () => {
    return vehiclesList.filter((vehicle) => newProject.selectedVehicles.includes(vehicle.id))
  }

  // 選択した備品の情報を取得
  const getSelectedToolsInfo = () => {
    return toolsList.filter((tool) => newProject.selectedTools.includes(tool.id))
  }

  // 新規案件を追加する関数
  const handleAddProject = async () => {
    try {
      // 入力チェック
      if (!newProject.name) {
        toast({
          title: "入力エラー",
          description: "案件名は必須です",
          variant: "destructive",
        })
        return
      }

      if (!newProject.startDate) {
        toast({
          title: "入力エラー",
          description: "開始日は必須です",
          variant: "destructive",
        })
        return
      }

      // プロジェクトデータを準備
      const projectData = {
        name: newProject.name,
        description: newProject.description,
        start_date: newProject.startDate,
        end_date: newProject.endDate || null,
        status: newProject.status,
        client: newProject.client,
        location: newProject.location,
        created_by: user?.id || "system",
        assignments: [],
      }

      // 割り当てを準備
      const assignments = []

      // スタッフの割り当て
      for (const staffId of newProject.selectedStaff) {
        assignments.push({
          staff_id: staffId,
        })
      }

      // 重機の割り当て
      for (const machineryId of newProject.selectedHeavyMachinery) {
        assignments.push({
          heavy_machinery_id: machineryId,
        })
      }

      // 車両の割り当て
      for (const vehicleId of newProject.selectedVehicles) {
        assignments.push({
          vehicle_id: vehicleId,
        })
      }

      // 備品の割り当て
      for (const toolId of newProject.selectedTools) {
        assignments.push({
          tool_id: toolId,
        })
      }

      // 割り当てを追加
      projectData.assignments = assignments

      console.log("Submitting project data:", projectData)

      // ミューテーションを実行
      const result = await createProjectMutation.mutateAsync(projectData)

      if (result.success) {
        // フォームをリセット
        setNewProject({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          status: "未着手",
          client: "",
          location: "",
          selectedStaff: [],
          selectedHeavyMachinery: [],
          selectedVehicles: [],
          selectedTools: [],
        })

        // データを手動で再取得
        await refetchProjects()

        // ダイアログを閉じる
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      console.error("案件追加エラー:", error)
      toast({
        title: "エラー",
        description: "案件の追加中にエラーが発生しました",
        variant: "destructive",
      })
    }
  }

  // 案件を編集する関数
  const handleEditProject = async () => {
    try {
      if (!currentProject || !currentProject.id) {
        throw new Error("プロジェクトIDが不明です")
      }

      // 入力チェック
      if (!currentProject.name) {
        toast({
          title: "入力エラー",
          description: "案件名は必須です",
          variant: "destructive",
        })
        return
      }

      if (!currentProject.start_date) {
        toast({
          title: "入力エラー",
          description: "開始日は必須です",
          variant: "destructive",
        })
        return
      }

      // プロジェクトデータを準備
      const projectData = {
        name: currentProject.name,
        description: currentProject.description,
        start_date: currentProject.start_date,
        end_date: currentProject.end_date || null,
        status: currentProject.status,
        client: currentProject.client,
        location: currentProject.location,
      }

      // ミューテーションを実行
      const result = await updateProjectMutation.mutateAsync({ id: currentProject.id, data: projectData })

      if (result.success) {
        // データを手動で再取得
        await refetchProjects()

        // ダイアログを閉じる
        setIsEditDialogOpen(false)
      }
    } catch (error) {
      console.error("案件更新エラー:", error)
      toast({
        title: "エラー",
        description: "案件の更新中にエラーが発生しました",
        variant: "destructive",
      })
    }
  }

  // 案件を削除する関数
  const handleDeleteProject = async (id: string) => {
    try {
      if (!confirm("この案件を削除してもよろしいですか？")) {
        return
      }

      // ミューテーションを実行
      const result = await deleteProjectMutation.mutateAsync(id)

      if (result.success) {
        // データを手動で再取得
        await refetchProjects()
      }
    } catch (error) {
      console.error("案件削除エラー:", error)
      toast({
        title: "エラー",
        description: "案件の削除中にエラーが発生しました",
        variant: "destructive",
      })
    }
  }

  // ステータスに応じたバッジを返す関数
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "未着手":
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
      case "計画中":
        return <Badge variant="gold">{status}</Badge>
      case "進行中":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "完了":
        return <Badge className="bg-purple-500 hover:bg-purple-600">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP")
  }

  // データ取得エラー時の表示
  if (projectsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>案件一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>
              案件データの取得中にエラーが発生しました。ページを再読み込みするか、管理者にお問い合わせください。
              <Button variant="outline" size="sm" className="mt-2" onClick={() => refetchProjects()}>
                再読み込み
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>案件一覧</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold">
                <Plus className="mr-2 h-4 w-4" />
                新規案件
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>新規案件の追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">
                      案件名 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="client">クライアント</Label>
                    <Input
                      id="client"
                      value={newProject.client}
                      onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">
                      開始日 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">終了日</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">ステータス</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  >
                    <option>未着手</option>
                    <option>計画中</option>
                    <option>進行中</option>
                    <option>完了</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">現場住所</Label>
                  <Input
                    id="location"
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                  />
                </div>

                {/* リソース選択タブ */}
                <Tabs defaultValue="staff" className="mt-4">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="staff">担当スタッフ</TabsTrigger>
                    <TabsTrigger value="machinery">使用重機</TabsTrigger>
                    <TabsTrigger value="vehicles">使用車両</TabsTrigger>
                    <TabsTrigger value="tools">使用備品</TabsTrigger>
                  </TabsList>

                  {/* スタッフ選択タブ */}
                  <TabsContent value="staff" className="border rounded-md p-4">
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
                    {newProject.selectedStaff.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">選択済みスタッフ</h4>
                        <div className="flex flex-wrap gap-2">
                          {getSelectedStaffInfo().map((staff) => (
                            <Badge key={staff.id} variant="outline" className="flex items-center gap-1 py-1">
                              {staff.full_name}
                              <button
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
                                    checked={newProject.selectedStaff.includes(staff.id)}
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

                  {/* 重機選択タブ */}
                  <TabsContent value="machinery" className="border rounded-md p-4">
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
                    {newProject.selectedHeavyMachinery.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">選択済み重機</h4>
                        <div className="flex flex-wrap gap-2">
                          {getSelectedHeavyMachineryInfo().map((machinery) => (
                            <Badge key={machinery.id} variant="outline" className="flex items-center gap-1 py-1">
                              {machinery.name}
                              <button
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
                                    checked={newProject.selectedHeavyMachinery.includes(machinery.id)}
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

                  {/* 車両選択タブ */}
                  <TabsContent value="vehicles" className="border rounded-md p-4">
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
                    {newProject.selectedVehicles.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">選択済み車両</h4>
                        <div className="flex flex-wrap gap-2">
                          {getSelectedVehiclesInfo().map((vehicle) => (
                            <Badge key={vehicle.id} variant="outline" className="flex items-center gap-1 py-1">
                              {vehicle.name}
                              <button
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
                                    checked={newProject.selectedVehicles.includes(vehicle.id)}
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

                  {/* 備品選択タブ */}
                  <TabsContent value="tools" className="border rounded-md p-4">
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
                    {newProject.selectedTools.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">選択済み備品</h4>
                        <div className="flex flex-wrap gap-2">
                          {getSelectedToolsInfo().map((tool) => (
                            <Badge key={tool.id} variant="outline" className="flex items-center gap-1 py-1">
                              {tool.name}
                              <button
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
                                    checked={newProject.selectedTools.includes(tool.id)}
                                    onCheckedChange={(checked) => handleToolChange(tool.id, checked as boolean)}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{tool.name}</TableCell>
                                <TableCell>{tool.storage_location || "-"}</TableCell>
                                <TableCell>{tool.condition || "-"}</TableCell>
                                <TableCell>
                                  {tool.last_maintenance_date ? formatDate(tool.last_maintenance_date) : "-"}
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
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={createProjectMutation.isPending}
                >
                  キャンセル
                </Button>
                <Button
                  variant="gold"
                  type="submit"
                  onClick={handleAddProject}
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {dataLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>案件名</TableHead>
                <TableHead>クライアント</TableHead>
                <TableHead>期間</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.client || "-"}</TableCell>
                    <TableCell>
                      {formatDate(project.start_date)} {project.end_date ? `〜 ${formatDate(project.end_date)}` : ""}
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog
                          open={isEditDialogOpen && currentProject?.id === project.id}
                          onOpenChange={(open) => {
                            setIsEditDialogOpen(open)
                            if (open) setCurrentProject(project)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setCurrentProject(project)
                                setIsEditDialogOpen(true)
                              }}
                              className="border-gold text-gold hover:bg-gold/10"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>案件の編集</DialogTitle>
                            </DialogHeader>
                            {currentProject && (
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-name">案件名</Label>
                                  <Input
                                    id="edit-name"
                                    value={currentProject.name}
                                    onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-client">クライアント</Label>
                                  <Input
                                    id="edit-client"
                                    value={currentProject.client || ""}
                                    onChange={(e) => setCurrentProject({ ...currentProject, client: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-description">説明</Label>
                                  <Textarea
                                    id="edit-description"
                                    value={currentProject.description || ""}
                                    onChange={(e) =>
                                      setCurrentProject({ ...currentProject, description: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-startDate">開始日</Label>
                                    <Input
                                      id="edit-startDate"
                                      type="date"
                                      value={currentProject.start_date ? currentProject.start_date.split("T")[0] : ""}
                                      onChange={(e) =>
                                        setCurrentProject({
                                          ...currentProject,
                                          start_date: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-endDate">終了日</Label>
                                    <Input
                                      id="edit-endDate"
                                      type="date"
                                      value={currentProject.end_date ? currentProject.end_date.split("T")[0] : ""}
                                      onChange={(e) =>
                                        setCurrentProject({
                                          ...currentProject,
                                          end_date: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-status">ステータス</Label>
                                  <select
                                    id="edit-status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={currentProject.status}
                                    onChange={(e) => setCurrentProject({ ...currentProject, status: e.target.value })}
                                  >
                                    <option>未着手</option>
                                    <option>計画中</option>
                                    <option>進行中</option>
                                    <option>完了</option>
                                  </select>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-location">現場住所</Label>
                                  <Input
                                    id="edit-location"
                                    value={currentProject.location || ""}
                                    onChange={(e) => setCurrentProject({ ...currentProject, location: e.target.value })}
                                  />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                                disabled={updateProjectMutation.isPending}
                              >
                                キャンセル
                              </Button>
                              <Button
                                type="submit"
                                onClick={handleEditProject}
                                disabled={updateProjectMutation.isPending}
                              >
                                {updateProjectMutation.isPending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                保存
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteProject(project.id)}
                          disabled={deleteProjectMutation.isPending}
                          className="border-darkgray text-darkgray hover:bg-darkgray/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    {searchTerm ? "検索条件に一致する案件が見つかりません" : "案件がありません"}
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

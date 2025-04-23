"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabaseInstance } from "@/lib/supabase/supabaseClient"
import { StaffSearch } from "./staff-search"
import { HeavyMachinerySearch } from "./heavy-machinery-search"
import { VehicleSearch } from "./vehicle-search"
import { ToolSearch } from "./tool-search"

export function ProjectList() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

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

  // プロジェクト一覧を取得
  useEffect(() => {
    fetchProjects()
  }, [])

  // プロジェクト一覧を取得する関数
  const fetchProjects = async () => {
    try {
      setDataLoading(true)
      const supabase = getClientSupabaseInstance()
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

      if (error) throw error

      if (data) {
        setProjects(data)
      }
    } catch (error) {
      console.error("プロジェクト取得エラー:", error)
      toast({
        title: "エラー",
        description: "プロジェクト一覧の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setDataLoading(false)
    }
  }

  // 検索条件に一致するプロジェクトをフィルタリング
  const filteredProjects = projects.filter(
    (project) =>
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase()),
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

  // 新規案件を追加する関数
  const handleAddProject = async () => {
    try {
      setIsLoading(true)

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

      const supabase = getClientSupabaseInstance()

      // プロジェクトを追加
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: newProject.name,
          description: newProject.description,
          start_date: newProject.startDate,
          end_date: newProject.endDate || null,
          status: newProject.status,
          client: newProject.client,
          location: newProject.location,
          created_by: "system", // 実際のユーザーIDに置き換える
        })
        .select()

      if (projectError) throw projectError

      if (projectData && projectData.length > 0) {
        const projectId = projectData[0].id

        // プロジェクト割り当てを作成
        const assignments = []

        // スタッフの割り当て
        for (const staffId of newProject.selectedStaff) {
          assignments.push({
            project_id: projectId,
            staff_id: staffId,
          })
        }

        // 重機の割り当て
        for (const machineryId of newProject.selectedHeavyMachinery) {
          assignments.push({
            project_id: projectId,
            heavy_machinery_id: machineryId,
          })
        }

        // 車両の割り当て
        for (const vehicleId of newProject.selectedVehicles) {
          assignments.push({
            project_id: projectId,
            vehicle_id: vehicleId,
          })
        }

        // 備品の割り当て
        for (const toolId of newProject.selectedTools) {
          assignments.push({
            project_id: projectId,
            tool_id: toolId,
          })
        }

        // 割り当てがある場合は保存
        if (assignments.length > 0) {
          const { error: assignmentError } = await supabase.from("project_assignments").insert(assignments)

          if (assignmentError) throw assignmentError
        }

        // 成功メッセージを表示
        toast({
          title: "案件を追加しました",
          description: "案件と割り当てが正常に登録されました",
        })

        // プロジェクト一覧を再取得
        fetchProjects()

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

        // ダイアログを閉じる
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      console.error("案件追加エラー:", error)
      toast({
        title: "エラー",
        description: "案件の追加に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 案件を編集する関数
  const handleEditProject = async () => {
    try {
      setIsLoading(true)

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

      const supabase = getClientSupabaseInstance()

      // プロジェクトを更新
      const { error: projectError } = await supabase
        .from("projects")
        .update({
          name: currentProject.name,
          description: currentProject.description,
          start_date: currentProject.start_date,
          end_date: currentProject.end_date || null,
          status: currentProject.status,
          client: currentProject.client,
          location: currentProject.location,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentProject.id)

      if (projectError) throw projectError

      // 成功メッセージを表示
      toast({
        title: "案件を更新しました",
        description: "案件情報が正常に更新されました",
      })

      // プロジェクト一覧を再取得
      fetchProjects()

      // ダイアログを閉じる
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("案件更新エラー:", error)
      toast({
        title: "エラー",
        description: "案件の更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 案件を削除する関数
  const handleDeleteProject = async (id: string) => {
    try {
      if (!confirm("この案件を削除してもよろしいですか？")) {
        return
      }

      setIsLoading(true)
      const supabase = getClientSupabaseInstance()

      // プロジェクトを削除
      const { error } = await supabase.from("projects").delete().eq("id", id)

      if (error) throw error

      // 成功メッセージを表示
      toast({
        title: "案件を削除しました",
        description: "案件が正常に削除されました",
      })

      // プロジェクト一覧を再取得
      fetchProjects()
    } catch (error) {
      console.error("案件削除エラー:", error)
      toast({
        title: "エラー",
        description: "案件の削除に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ステータスに応じたバッジを返す関数
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "未着手":
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
      case "計画中":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
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
              <Button>
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50city-50"
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
                    <StaffSearch selectedStaff={newProject.selectedStaff} onStaffChange={handleStaffChange} />
                  </TabsContent>

                  {/* 重機選択タブ */}
                  <TabsContent value="machinery" className="border rounded-md p-4">
                    <HeavyMachinerySearch
                      selectedMachinery={newProject.selectedHeavyMachinery}
                      onMachineryChange={handleHeavyMachineryChange}
                    />
                  </TabsContent>

                  {/* 車両選択タブ */}
                  <TabsContent value="vehicles" className="border rounded-md p-4">
                    <VehicleSearch
                      selectedVehicles={newProject.selectedVehicles}
                      onVehicleChange={handleVehicleChange}
                    />
                  </TabsContent>

                  {/* 備品選択タブ */}
                  <TabsContent value="tools" className="border rounded-md p-4">
                    <ToolSearch selectedTools={newProject.selectedTools} onToolChange={handleToolChange} />
                  </TabsContent>
                </Tabs>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                  キャンセル
                </Button>
                <Button type="submit" onClick={handleAddProject} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContentComponent>
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
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                                キャンセル
                              </Button>
                              <Button type="submit" onClick={handleEditProject} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                保存
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteProject(project.id)}
                          disabled={isLoading}
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
      </CardContentComponent>
    </Card>
  )
}

import { CardContent as CardContentComponent } from "@/components/ui/card"

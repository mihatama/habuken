"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Check, X, Sun, Cloud, CloudRain, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"
import { getDailyReports } from "@/lib/data-utils"

export function DailyWorkReport() {
  const [reports, setReports] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentReport, setCurrentReport] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [newReport, setNewReport] = useState({
    projectId: "",
    userId: "",
    workDate: new Date().toISOString().split("T")[0],
    weather: "sunny",
    workContentText: "",
    speechRecognitionRaw: "",
    photos: [] as string[],
  })

  const supabase = createClientComponentClient()

  // データの取得
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // 作業日報データを取得
        const reportsData = await getDailyReports()
        setReports(reportsData)

        // プロジェクトデータを取得
        const { data: projectsData } = await supabase.from("projects").select("*")
        setProjects(projectsData || [])

        // スタッフデータを取得
        const { data: staffData } = await supabase.from("staff").select("*")
        setStaff(staffData || [])
      } catch (error) {
        console.error("データ取得エラー:", error)
        toast({
          title: "エラー",
          description: "データの取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const filteredReports = reports.filter(
    (report) =>
      (report.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.work_content?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeTab === "all" ||
        (activeTab === "pending" && report.status === "pending") ||
        (activeTab === "approved" && report.status === "approved")),
  )

  const handleAddReport = async () => {
    if (!newReport.projectId || !newReport.userId) return

    try {
      const { data, error } = await supabase
        .from("daily_reports")
        .insert({
          project_id: newReport.projectId,
          staff_id: newReport.userId,
          work_date: newReport.workDate,
          weather: newReport.weather,
          work_content: newReport.workContentText,
          speech_recognition_raw: newReport.speechRecognitionRaw,
          photos: newReport.photos,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      toast({
        title: "成功",
        description: "作業日報を追加しました",
      })

      // 作業日報リストを更新
      const reportsData = await getDailyReports()
      setReports(reportsData)

      setIsAddDialogOpen(false)
      setNewReport({
        projectId: "",
        userId: "",
        workDate: new Date().toISOString().split("T")[0],
        weather: "sunny",
        workContentText: "",
        speechRecognitionRaw: "",
        photos: [],
      })
    } catch (error) {
      console.error("作業日報追加エラー:", error)
      toast({
        title: "エラー",
        description: "作業日報の追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleApproveReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from("daily_reports")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", reportId)

      if (error) throw error

      toast({
        title: "成功",
        description: "作業日報を承認しました",
      })

      // 作業日報リストを更新
      const reportsData = await getDailyReports()
      setReports(reportsData)
    } catch (error) {
      console.error("作業日報承認エラー:", error)
      toast({
        title: "エラー",
        description: "作業日報の承認に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleRejectReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from("daily_reports")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", reportId)

      if (error) throw error

      toast({
        title: "成功",
        description: "作業日報を差し戻しました",
      })

      // 作業日報リストを更新
      const reportsData = await getDailyReports()
      setReports(reportsData)
    } catch (error) {
      console.error("作業日報差し戻しエラー:", error)
      toast({
        title: "エラー",
        description: "作業日報の差し戻しに失敗しました",
        variant: "destructive",
      })
    }
  }

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "sunny":
        return <Sun className="h-5 w-5 text-yellow-500" />
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-500" />
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">承認待ち</Badge>
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">承認済</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">差戻し</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>作業日報</CardTitle>
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
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>作業日報の作成</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="projectId">工事名</Label>
                    <Select
                      value={newReport.projectId}
                      onValueChange={(value) => setNewReport({ ...newReport, projectId: value })}
                    >
                      <SelectTrigger id="projectId">
                        <SelectValue placeholder="工事を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="userId">作業者</Label>
                    <Select
                      value={newReport.userId}
                      onValueChange={(value) => setNewReport({ ...newReport, userId: value })}
                    >
                      <SelectTrigger id="userId">
                        <SelectValue placeholder="作業者を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="workDate">作業日</Label>
                    <Input
                      id="workDate"
                      type="date"
                      value={newReport.workDate}
                      onChange={(e) => setNewReport({ ...newReport, workDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="weather">天候</Label>
                    <Select
                      value={newReport.weather}
                      onValueChange={(value) => setNewReport({ ...newReport, weather: value })}
                    >
                      <SelectTrigger id="weather">
                        <SelectValue placeholder="天候を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunny">晴れ</SelectItem>
                        <SelectItem value="cloudy">曇り</SelectItem>
                        <SelectItem value="rainy">雨</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="workContentText">作業内容</Label>
                  </div>
                  <Textarea
                    id="workContentText"
                    value={newReport.workContentText}
                    onChange={(e) => setNewReport({ ...newReport, workContentText: e.target.value })}
                    placeholder="作業内容を入力してください"
                    className="min-h-[150px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="photos">写真添付</Label>
                  <div className="flex gap-2">
                    <Input
                      id="photos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const fileNames = Array.from(e.target.files).map((file) => file.name)
                          setNewReport({
                            ...newReport,
                            photos: [...newReport.photos, ...fileNames],
                          })
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newReport.photos.map((photo, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        {photo}
                        <button
                          type="button"
                          className="ml-1 rounded-full hover:bg-muted p-1"
                          onClick={() =>
                            setNewReport({
                              ...newReport,
                              photos: newReport.photos.filter((_, i) => i !== index),
                            })
                          }
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit" onClick={handleAddReport}>
                  保存
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="pending">承認待ち</TabsTrigger>
            <TabsTrigger value="approved">承認済</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工事名</TableHead>
                  <TableHead>作業者</TableHead>
                  <TableHead>作業日</TableHead>
                  <TableHead>天候</TableHead>
                  <TableHead>作業内容</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      読み込み中...
                    </TableCell>
                  </TableRow>
                ) : filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      該当する日報はありません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.projectName}</TableCell>
                      <TableCell>{report.userName}</TableCell>
                      <TableCell>{new Date(report.work_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getWeatherIcon(report.weather)}
                          <span className="ml-2">
                            {report.weather === "sunny"
                              ? "晴れ"
                              : report.weather === "cloudy"
                                ? "曇り"
                                : report.weather === "rainy"
                                  ? "雨"
                                  : report.weather}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{report.work_content}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Dialog
                            open={isViewDialogOpen && currentReport?.id === report.id}
                            onOpenChange={(open) => {
                              setIsViewDialogOpen(open)
                              if (open) setCurrentReport(report)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setCurrentReport(report)
                                  setIsViewDialogOpen(true)
                                }}
                              >
                                詳細
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>作業日報詳細</DialogTitle>
                              </DialogHeader>
                              {currentReport && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="border rounded-md p-4">
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">工事名</h3>
                                      <p className="font-medium">{currentReport.projectName}</p>
                                    </div>
                                    <div className="border rounded-md p-4">
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">作業者</h3>
                                      <p className="font-medium">{currentReport.userName}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="border rounded-md p-4">
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">作業日</h3>
                                      <p className="font-medium">
                                        {new Date(currentReport.work_date).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="border rounded-md p-4">
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">天候</h3>
                                      <div className="flex items-center">
                                        {getWeatherIcon(currentReport.weather)}
                                        <span className="ml-2 font-medium">
                                          {currentReport.weather === "sunny"
                                            ? "晴れ"
                                            : currentReport.weather === "cloudy"
                                              ? "曇り"
                                              : currentReport.weather === "rainy"
                                                ? "雨"
                                                : currentReport.weather}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="border rounded-md p-4">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">作業内容</h3>
                                    <p>{currentReport.work_content}</p>
                                  </div>
                                  <div className="border rounded-md p-4">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">添付写真</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {currentReport.photos && currentReport.photos.length > 0 ? (
                                        currentReport.photos.map((photo: string, index: number) => (
                                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                                            <ImageIcon className="h-3 w-3 mr-1" />
                                            {photo}
                                          </Badge>
                                        ))
                                      ) : (
                                        <p className="text-sm text-muted-foreground">添付写真はありません</p>
                                      )}
                                    </div>
                                  </div>
                                  {currentReport.status === "pending" && (
                                    <div className="flex justify-end space-x-2 mt-4">
                                      <Button
                                        variant="outline"
                                        className="bg-red-50 hover:bg-red-100 text-red-600"
                                        onClick={() => {
                                          handleRejectReport(currentReport.id)
                                          setIsViewDialogOpen(false)
                                        }}
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        差戻し
                                      </Button>
                                      <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                          handleApproveReport(currentReport.id)
                                          setIsViewDialogOpen(false)
                                        }}
                                      >
                                        <Check className="h-4 w-4 mr-2" />
                                        承認
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          {report.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="bg-red-50 hover:bg-red-100 text-red-600"
                                onClick={() => handleRejectReport(report.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="bg-green-50 hover:bg-green-100 text-green-600"
                                onClick={() => handleApproveReport(report.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertTriangle, Mic, MicOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { fetchClientData, insertClientData, getClientSupabase } from "@/lib/supabase-utils"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"

interface SafetyPatrolFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// チェックリスト項目の定義
const checklistItems = [
  { id: "machines", label: "機械・設備" },
  { id: "protectiveGear", label: "保護具着用" },
  { id: "waste", label: "廃棄物管理" },
  { id: "noise", label: "騒音・振動" },
  { id: "scaffolding", label: "足場・作業床" },
  { id: "electricity", label: "電気関係" },
  { id: "fire", label: "火災防止" },
  { id: "signage", label: "標識・表示" },
]

export function SafetyPatrolForm({ open, onOpenChange, onSuccess }: SafetyPatrolFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tableExists, setTableExists] = useState<boolean | null>(null)

  const [formData, setFormData] = useState({
    projectId: "",
    inspectorId: "",
    patrolDate: new Date().toISOString().split("T")[0],
    patrolTime: new Date().toTimeString().split(" ")[0].substring(0, 5),
    checklistJson: {
      machines: "good",
      protectiveGear: "good",
      waste: "good",
      noise: "good",
      scaffolding: "good",
      electricity: "good",
      fire: "good",
      signage: "good",
    },
    checklistComments: {
      machines: "",
      protectiveGear: "",
      waste: "",
      noise: "",
      scaffolding: "",
      electricity: "",
      fire: "",
      signage: "",
    },
    comment: "",
    photos: [] as Array<{
      file?: File
      preview: string
      name: string
    }>,
    location: {
      latitude: null as number | null,
      longitude: null as number | null,
      accuracy: null as number | null,
    },
    weather: "",
  })
  const [customProject, setCustomProject] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  // 音声認識フックを使用
  const { isRecording, activeId, startRecording, stopRecording } = useSpeechRecognition()

  // Check if safety_patrols table exists
  useEffect(() => {
    const checkTableExists = async () => {
      try {
        const supabase = getClientSupabase()

        const { error } = await supabase.from("safety_patrols").select("count(*)").limit(1).single()

        if (error && error.message.includes("does not exist")) {
          setTableExists(false)
        } else {
          setTableExists(true)
        }
      } catch (error) {
        console.error("テーブル確認エラー:", error)
        setTableExists(false)
      }
    }

    if (open) {
      checkTableExists()
    }
  }, [open])

  // プロジェクトとスタッフのデータを取得
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await fetchClientData("projects")
      return data || []
    },
  })

  const { data: staff = [] } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data } = await fetchClientData("staff")
      return data || []
    },
  })

  // 位置情報を取得
  useEffect(() => {
    if (open && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            },
          })
        },
        (error) => {
          console.error("位置情報の取得に失敗しました:", error)
        },
      )
    }
  }, [open])

  const handleProjectChange = (value: string) => {
    setFormData({ ...formData, projectId: value })
    setShowCustomInput(value === "custom")
    if (value === "custom") {
      setTimeout(() => document.getElementById("customProject")?.focus(), 100)
    } else {
      setCustomProject("")
    }
  }

  // 音声入力を開始する関数
  const handleStartVoiceInput = (id: number) => {
    if (isRecording && activeId === id) {
      stopRecording()
      return
    }

    startRecording(id, (text) => {
      // 音声認識結果を適切なフィールドに設定
      if (id === 0) {
        // メインコメント欄
        setFormData((prev) => ({
          ...prev,
          comment: prev.comment ? `${prev.comment} ${text}` : text,
        }))
      } else {
        // チェックリスト項目のコメント欄
        const itemId = checklistItems[id - 1]?.id
        if (itemId) {
          setFormData((prev) => ({
            ...prev,
            checklistComments: {
              ...prev.checklistComments,
              [itemId]: prev.checklistComments[itemId as keyof typeof prev.checklistComments]
                ? `${prev.checklistComments[itemId as keyof typeof prev.checklistComments]} ${text}`
                : text,
            },
          }))
        }
      }
    })
  }

  const handleSubmit = async () => {
    // 案件選択の検証
    if (formData.projectId === "custom") {
      if (!customProject.trim()) {
        toast({
          title: "入力エラー",
          description: "案件名を入力してください",
          variant: "destructive",
        })
        return
      }
    } else if (!formData.projectId || formData.projectId === "placeholder") {
      toast({
        title: "入力エラー",
        description: "案件を選択してください",
        variant: "destructive",
      })
      return
    }

    if (!formData.inspectorId || formData.inspectorId === "placeholder") {
      toast({
        title: "入力エラー",
        description: "巡視者を選択してください",
        variant: "destructive",
      })
      return
    }

    if (!tableExists) {
      toast({
        title: "エラー",
        description: "安全パトロールテーブルが存在しません",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // 選択した案件名を取得
      let projectName = null
      let projectId = null

      if (formData.projectId !== "custom" && formData.projectId !== "" && formData.projectId !== "placeholder") {
        projectId = formData.projectId
        const selectedProject = projects.find((project: any) => project.id === formData.projectId)
        if (selectedProject) {
          projectName = selectedProject.name
        }
      } else if (formData.projectId === "custom") {
        projectName = customProject
      }

      // 安全パトロールデータを追加
      await insertClientData("safety_patrols", {
        project_id: projectId,
        custom_project_name: projectId ? null : projectName,
        inspector_id: formData.inspectorId,
        patrol_date: formData.patrolDate,
        patrol_time: formData.patrolTime,
        checklist_json: formData.checklistJson,
        checklist_comments_json: formData.checklistComments,
        comment: formData.comment,
        photos: formData.photos.map((p) => p.name),
        location_json: formData.location,
        weather: formData.weather,
        status: "pending",
        created_at: new Date().toISOString(),
      })

      toast({
        title: "成功",
        description: "安全パトロール記録を作成しました",
      })

      // フォームをリセット
      setFormData({
        projectId: "",
        inspectorId: "",
        patrolDate: new Date().toISOString().split("T")[0],
        patrolTime: new Date().toTimeString().split(" ")[0].substring(0, 5),
        checklistJson: {
          machines: "good",
          protectiveGear: "good",
          waste: "good",
          noise: "good",
          scaffolding: "good",
          electricity: "good",
          fire: "good",
          signage: "good",
        },
        checklistComments: {
          machines: "",
          protectiveGear: "",
          waste: "",
          noise: "",
          scaffolding: "",
          electricity: "",
          fire: "",
          signage: "",
        },
        comment: "",
        photos: [],
        location: {
          latitude: null,
          longitude: null,
          accuracy: null,
        },
        weather: "",
      })
      setCustomProject("")
      setShowCustomInput(false)

      // ダイアログを閉じる
      onOpenChange(false)

      // 成功コールバックを呼び出す
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("安全パトロール作成エラー:", error)
      toast({
        title: "エラー",
        description: "安全パトロール記録の作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ダイアログが閉じられるときに音声認識を停止
  useEffect(() => {
    if (!open && isRecording) {
      stopRecording()
    }
  }, [open, isRecording, stopRecording])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>安全・環境巡視日誌の作成</DialogTitle>
        </DialogHeader>

        {tableExists === false ? (
          <div className="py-4">
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">データベースエラー</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    安全パトロールテーブルが存在しません。管理者に連絡してデータベースを設定してください。
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              閉じる
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>案件名 *</Label>
                <div className="space-y-2">
                  <Select value={formData.projectId} onValueChange={handleProjectChange}>
                    <SelectTrigger id="projectId">
                      <SelectValue placeholder="案件を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" disabled>
                        案件を選択してください
                      </SelectItem>
                      {projects.map((project: any) => (
                        <SelectItem key={`project-${project.id}`} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">その他（手入力）</SelectItem>
                    </SelectContent>
                  </Select>

                  {showCustomInput && (
                    <Input
                      id="customProject"
                      placeholder="案件名を入力"
                      value={customProject}
                      onChange={(e) => setCustomProject(e.target.value)}
                    />
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inspectorId">巡視者 *</Label>
                <Select
                  value={formData.inspectorId}
                  onValueChange={(value) => setFormData({ ...formData, inspectorId: value })}
                >
                  <SelectTrigger id="inspectorId">
                    <SelectValue placeholder="巡視者を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      巡視者を選択してください
                    </SelectItem>
                    {staff.map((s: any) => (
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
                <Label htmlFor="patrolDate">巡視日 *</Label>
                <Input
                  id="patrolDate"
                  type="date"
                  value={formData.patrolDate}
                  onChange={(e) => setFormData({ ...formData, patrolDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="patrolTime">巡視時間</Label>
                <Input
                  id="patrolTime"
                  type="time"
                  value={formData.patrolTime}
                  onChange={(e) => setFormData({ ...formData, patrolTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weather">天候</Label>
              <Select value={formData.weather} onValueChange={(value) => setFormData({ ...formData, weather: value })}>
                <SelectTrigger id="weather">
                  <SelectValue placeholder="天候を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunny">晴れ</SelectItem>
                  <SelectItem value="cloudy">曇り</SelectItem>
                  <SelectItem value="rainy">雨</SelectItem>
                  <SelectItem value="snowy">雪</SelectItem>
                  <SelectItem value="windy">強風</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4">
              <Label>チェックリスト</Label>
              <div className="border rounded-md p-4 grid gap-6">
                {checklistItems.map((item, index) => (
                  <div key={item.id} className="grid gap-2">
                    <Label htmlFor={item.id}>{item.label}</Label>
                    <RadioGroup
                      id={item.id}
                      value={(formData.checklistJson as any)[item.id]}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          checklistJson: {
                            ...formData.checklistJson,
                            [item.id]: value,
                          },
                        })
                      }
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="good" id={`${item.id}-good`} />
                        <Label htmlFor={`${item.id}-good`} className="text-green-600">
                          ◎ 良好
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="warning" id={`${item.id}-warning`} />
                        <Label htmlFor={`${item.id}-warning`} className="text-yellow-600">
                          △ 注意
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="danger" id={`${item.id}-danger`} />
                        <Label htmlFor={`${item.id}-danger`} className="text-red-600">
                          × 危険
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* チェックリスト項目ごとのコメント欄 */}
                    <div className="relative mt-2">
                      <Textarea
                        id={`comment-${item.id}`}
                        placeholder={`${item.label}に関するコメントを入力`}
                        value={(formData.checklistComments as any)[item.id]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            checklistComments: {
                              ...formData.checklistComments,
                              [item.id]: e.target.value,
                            },
                          })
                        }
                        className="min-h-[60px] pr-10"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant={isRecording && activeId === index + 1 ? "destructive" : "ghost"}
                        className="absolute right-2 top-2 h-8 w-8"
                        onClick={() => handleStartVoiceInput(index + 1)}
                        aria-label={isRecording && activeId === index + 1 ? "音声入力停止" : "音声入力開始"}
                      >
                        {isRecording && activeId === index + 1 ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment">総合コメント</Label>
              <div className="relative">
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="指摘事項や改善点などを入力してください"
                  className="min-h-[100px] pr-10"
                />
                <Button
                  type="button"
                  size="icon"
                  variant={isRecording && activeId === 0 ? "destructive" : "ghost"}
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={() => handleStartVoiceInput(0)}
                  aria-label={isRecording && activeId === 0 ? "音声入力停止" : "音声入力開始"}
                >
                  {isRecording && activeId === 0 ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              {isRecording && (
                <div className="text-sm text-blue-600 animate-pulse flex items-center">
                  <Mic className="h-3 w-3 mr-1" />
                  音声入力中...
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="photos">写真添付</Label>
              <div className="flex flex-wrap gap-2">
                <div className="flex gap-2">
                  <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const newPhotos = Array.from(e.target.files).map((file) => ({
                          file,
                          preview: URL.createObjectURL(file),
                          name: file.name,
                        }))
                        setFormData({
                          ...formData,
                          photos: [...formData.photos, ...newPhotos],
                        })
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = "image/*"
                      input.capture = "environment"
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement
                        if (target.files && target.files.length > 0) {
                          const file = target.files[0]
                          const newPhoto = {
                            file,
                            preview: URL.createObjectURL(file),
                            name: file.name,
                          }
                          setFormData({
                            ...formData,
                            photos: [...formData.photos, newPhoto],
                          })
                        }
                      }
                      input.click()
                    }}
                  >
                    カメラで撮影
                  </Button>
                </div>
              </div>

              {formData.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative border rounded-md overflow-hidden">
                      <img
                        src={photo.preview || "/placeholder.svg"}
                        alt={`写真 ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        onClick={() => {
                          const newPhotos = [...formData.photos]
                          if (newPhotos[index].preview) {
                            URL.revokeObjectURL(newPhotos[index].preview)
                          }
                          newPhotos.splice(index, 1)
                          setFormData({
                            ...formData,
                            photos: newPhotos,
                          })
                        }}
                      >
                        ×
                      </button>
                      <div className="p-1 text-xs truncate bg-white/80 absolute bottom-0 w-full">{photo.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          {tableExists !== false && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

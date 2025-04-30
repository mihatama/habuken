"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { fetchClientData, insertClientData, getClientSupabase } from "@/lib/supabase-utils"

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
    comment: "",
    photos: [] as string[],
  })

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

  const handleSubmit = async () => {
    if (!formData.projectId || !formData.inspectorId) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
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

      // 安全パトロールデータを追加
      await insertClientData("safety_patrols", {
        project_id: formData.projectId,
        inspector_id: formData.inspectorId,
        patrol_date: formData.patrolDate,
        checklist_json: formData.checklistJson,
        comment: formData.comment,
        photos: formData.photos,
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
        comment: "",
        photos: [],
      })

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
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
                <Label htmlFor="projectId">対象工事 *</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                >
                  <SelectTrigger id="projectId">
                    <SelectValue placeholder="工事を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project: any) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {staff.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patrolDate">巡視日 *</Label>
              <Input
                id="patrolDate"
                type="date"
                value={formData.patrolDate}
                onChange={(e) => setFormData({ ...formData, patrolDate: e.target.value })}
              />
            </div>
            <div className="grid gap-4">
              <Label>チェックリスト</Label>
              <div className="border rounded-md p-4 grid gap-4">
                {checklistItems.map((item) => (
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
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment">コメント</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="指摘事項や改善点などを入力してください"
                className="min-h-[100px]"
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
                      setFormData({
                        ...formData,
                        photos: [...formData.photos, ...fileNames],
                      })
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.photos.map((photo, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {photo}
                    <button
                      type="button"
                      className="ml-1 rounded-full hover:bg-muted p-1"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          photos: formData.photos.filter((_, i) => i !== index),
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

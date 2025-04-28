"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { sampleProjects, sampleStaff } from "@/data/sample-data"

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

  const handleSubmit = async () => {
    if (!formData.projectId || !formData.inspectorId) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const projectId = Number.parseInt(formData.projectId)
      const inspectorId = Number.parseInt(formData.inspectorId)
      const project = sampleProjects.find((p) => p.id === projectId)
      const inspector = sampleStaff.find((s) => s.id === inspectorId)

      if (!project || !inspector) {
        throw new Error("プロジェクトまたは巡視者が見つかりません")
      }

      // 実際のアプリケーションではここでAPIリクエストを行う
      // 今回はモックデータを使用
      const patrol = {
        id: Math.floor(Math.random() * 1000) + 1,
        projectId,
        projectName: project.name,
        patrolDate: new Date(formData.patrolDate),
        inspectorId,
        inspectorName: inspector.name,
        checklistJson: formData.checklistJson,
        comment: formData.comment,
        photos: formData.photos,
        status: "pending",
        createdAt: new Date(),
      }

      console.log("新規安全パトロール:", patrol)

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
                  {sampleProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
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
                  {sampleStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id.toString()}>
                      {staff.name}
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
                <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                  <span className="text-sm">{photo}</span>
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
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

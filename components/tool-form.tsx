"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { fetchClientData, insertClientData } from "@/lib/supabase-utils"

interface ToolFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ToolForm({ open, onOpenChange, onSuccess }: ToolFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resourceTypeField, setResourceTypeField] = useState<string>("type")

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    status: "利用可能",
    last_inspection_date: "",
    assigned_projects: [] as string[],
    assigned_staff: [] as string[],
  })

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

  // リソーステーブルのスキーマを確認
  useQuery({
    queryKey: ["resourceSchema"],
    queryFn: async () => {
      const { data: columns } = await fetchClientData("resources", { limit: 1 })
      if (columns && columns.length > 0) {
        if ("type" in columns[0]) {
          setResourceTypeField("type")
        } else if ("resource_type" in columns[0]) {
          setResourceTypeField("resource_type")
        }
      }
      return null
    },
  })

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: "入力エラー",
        description: "備品名は必須項目です",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const insertData: any = {
        name: formData.name,
        location: formData.location,
        status: formData.status,
        last_inspection_date: formData.last_inspection_date || null,
      }

      // 適切なフィールド名を使用
      if (resourceTypeField === "type") {
        insertData.type = "工具"
      } else if (resourceTypeField === "resource_type") {
        insertData.resource_type = "工具"
      }

      const result = await insertClientData("resources", insertData)

      if (result && result[0]) {
        // 関連プロジェクトの登録
        for (const projectId of formData.assigned_projects) {
          await insertClientData("resource_project", {
            resource_id: result[0].id,
            project_id: projectId,
          })
        }

        // 関連スタッフの登録
        for (const staffId of formData.assigned_staff) {
          await insertClientData("resource_staff", {
            resource_id: result[0].id,
            staff_id: staffId,
          })
        }
      }

      toast({
        title: "成功",
        description: "備品を追加しました",
      })

      // フォームをリセット
      setFormData({
        name: "",
        location: "",
        status: "利用可能",
        last_inspection_date: "",
        assigned_projects: [],
        assigned_staff: [],
      })

      // ダイアログを閉じる
      onOpenChange(false)

      // 成功コールバックを呼び出す
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("備品追加エラー:", error)
      toast({
        title: "エラー",
        description: "備品の追加に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>備品の追加</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">保管場所</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">状態</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="利用可能">利用可能</SelectItem>
                <SelectItem value="利用中">利用中</SelectItem>
                <SelectItem value="メンテナンス中">メンテナンス中</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastMaintenance">最終メンテナンス日</Label>
            <Input
              id="lastMaintenance"
              type="date"
              value={formData.last_inspection_date}
              onChange={(e) => setFormData({ ...formData, last_inspection_date: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="assignedProjects">使用案件</Label>
            <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
              {projects.map((project: any) => (
                <div key={project.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`project-${project.id}`}
                    checked={formData.assigned_projects.includes(project.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          assigned_projects: [...formData.assigned_projects, project.id],
                        })
                      } else {
                        setFormData({
                          ...formData,
                          assigned_projects: formData.assigned_projects.filter((id) => id !== project.id),
                        })
                      }
                    }}
                  />
                  <label htmlFor={`project-${project.id}`} className="text-sm">
                    {project.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="assignedStaff">担当スタッフ</Label>
            <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
              {staff.map((s: any) => (
                <div key={s.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`staff-${s.id}`}
                    checked={formData.assigned_staff.includes(s.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          assigned_staff: [...formData.assigned_staff, s.id],
                        })
                      } else {
                        setFormData({
                          ...formData,
                          assigned_staff: formData.assigned_staff.filter((id) => id !== s.id),
                        })
                      }
                    }}
                  />
                  <label htmlFor={`staff-${s.id}`} className="text-sm">
                    {s.full_name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "追加中..." : "追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

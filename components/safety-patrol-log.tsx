"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useSupabaseClient } from "@/hooks/use-supabase-query"

// 安全チェック項目
const safetyCheckItems = [
  { id: "protective_gear", label: "保護具の着用確認" },
  { id: "safety_signs", label: "安全標識の設置" },
  { id: "equipment_condition", label: "機器・設備の状態" },
  { id: "work_area_clean", label: "作業場の整理整頓" },
  { id: "fire_prevention", label: "火災予防対策" },
  { id: "emergency_exits", label: "非常口・避難経路の確保" },
  { id: "electrical_safety", label: "電気系統の安全" },
  { id: "scaffolding_safety", label: "足場の安全" },
]

export function SafetyPatrolLog() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = useSupabaseClient()

  const [report, setReport] = useState({
    title: "",
    project_id: "",
    patrol_date: new Date().toISOString().split("T")[0],
    weather: "晴れ",
    patrol_area: "",
    safety_checks: {} as Record<string, boolean>,
    findings: "",
    recommendations: "",
    follow_up_required: false,
  })

  // プロジェクトデータを取得するクエリ
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("projects").select("*").order("name", { ascending: true })
        if (error) throw error
        return data || []
      } catch (error) {
        console.error("プロジェクト取得エラー:", error)
        return []
      }
    },
  })

  // 安全パトロール報告を送信するミューテーション
  const submitReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase.from("safety_inspections").insert(data).select()
      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety_inspections"] })
      toast({
        title: "成功",
        description: "安全パトロール報告が正常に送信されました",
      })
      // フォームをリセット
      setReport({
        title: "",
        project_id: "",
        patrol_date: new Date().toISOString().split("T")[0],
        weather: "晴れ",
        patrol_area: "",
        safety_checks: {},
        findings: "",
        recommendations: "",
        follow_up_required: false,
      })
    },
    onError: (error: any) => {
      toast({
        title: "エラー",
        description: "安全パトロール報告の送信に失敗しました",
        variant: "destructive",
      })
      console.error("安全パトロール報告送信エラー:", error)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!report.title) {
      toast({
        title: "入力エラー",
        description: "タイトルは必須です",
        variant: "destructive",
      })
      return
    }

    if (!report.project_id) {
      toast({
        title: "入力エラー",
        description: "プロジェクトは必須です",
        variant: "destructive",
      })
      return
    }

    if (!report.patrol_area) {
      toast({
        title: "入力エラー",
        description: "パトロールエリアは必須です",
        variant: "destructive",
      })
      return
    }

    const reportData = {
      title: report.title,
      project_id: report.project_id,
      inspection_date: report.patrol_date,
      inspector: user?.id,
      weather: report.weather,
      inspection_area: report.patrol_area,
      safety_checks: report.safety_checks,
      findings: report.findings,
      recommendations: report.recommendations,
      follow_up_required: report.follow_up_required,
      status: "pending",
    }

    await submitReportMutation.mutateAsync(reportData)
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setReport({
      ...report,
      safety_checks: {
        ...report.safety_checks,
        [id]: checked,
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>安全パトロール記録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                タイトル <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={report.title}
                onChange={(e) => setReport({ ...report, title: e.target.value })}
                placeholder="安全パトロール報告のタイトルを入力"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">
                プロジェクト <span className="text-red-500">*</span>
              </Label>
              <Select value={report.project_id} onValueChange={(value) => setReport({ ...report, project_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="プロジェクトを選択" />
                </SelectTrigger>
                <SelectContent>
                  {projectsLoading ? (
                    <div className="flex justify-center items-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patrol_date">パトロール日</Label>
              <Input
                id="patrol_date"
                type="date"
                value={report.patrol_date}
                onChange={(e) => setReport({ ...report, patrol_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weather">天気</Label>
              <Select value={report.weather} onValueChange={(value) => setReport({ ...report, weather: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="天気を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="晴れ">晴れ</SelectItem>
                  <SelectItem value="曇り">曇り</SelectItem>
                  <SelectItem value="雨">雨</SelectItem>
                  <SelectItem value="雪">雪</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="patrol_area">
                パトロールエリア <span className="text-red-500">*</span>
              </Label>
              <Input
                id="patrol_area"
                value={report.patrol_area}
                onChange={(e) => setReport({ ...report, patrol_area: e.target.value })}
                placeholder="例: 1階作業エリア、足場設置場所など"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>安全チェック項目</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-md p-4">
              {safetyCheckItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={report.safety_checks[item.id] || false}
                    onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                  />
                  <Label htmlFor={item.id} className="cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="findings">発見事項</Label>
            <Textarea
              id="findings"
              value={report.findings}
              onChange={(e) => setReport({ ...report, findings: e.target.value })}
              placeholder="安全上の問題点や気づいた点を記入してください"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">改善提案</Label>
            <Textarea
              id="recommendations"
              value={report.recommendations}
              onChange={(e) => setReport({ ...report, recommendations: e.target.value })}
              placeholder="改善のための提案や対策を記入してください"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="follow_up"
              checked={report.follow_up_required}
              onCheckedChange={(checked) => setReport({ ...report, follow_up_required: checked as boolean })}
            />
            <Label htmlFor="follow_up" className="cursor-pointer">
              フォローアップが必要
            </Label>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitReportMutation.isPending}>
              {submitReportMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              送信する
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

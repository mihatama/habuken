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
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useSupabaseClient } from "@/hooks/use-supabase-query"

export function DailyWorkReport() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = useSupabaseClient()

  const [report, setReport] = useState({
    title: "",
    project_id: "",
    report_date: new Date().toISOString().split("T")[0],
    weather: "晴れ",
    temperature: "",
    work_details: "",
    issues: "",
    notes: "",
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

  // 日報を送信するミューテーション
  const submitReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase.from("daily_reports").insert(data).select()
      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily_reports"] })
      toast({
        title: "成功",
        description: "日報が正常に送信されました",
      })
      // フォームをリセット
      setReport({
        title: "",
        project_id: "",
        report_date: new Date().toISOString().split("T")[0],
        weather: "晴れ",
        temperature: "",
        work_details: "",
        issues: "",
        notes: "",
      })
    },
    onError: (error: any) => {
      toast({
        title: "エラー",
        description: "日報の送信に失敗しました",
        variant: "destructive",
      })
      console.error("日報送信エラー:", error)
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

    if (!report.work_details) {
      toast({
        title: "入力エラー",
        description: "作業内容は必須です",
        variant: "destructive",
      })
      return
    }

    const reportData = {
      ...report,
      report_type: "日報",
      staff_id: user?.id,
      created_by: user?.id,
      temperature: report.temperature ? Number.parseFloat(report.temperature) : null,
    }

    await submitReportMutation.mutateAsync(reportData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>日報作成</CardTitle>
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
                placeholder="日報のタイトルを入力"
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
              <Label htmlFor="report_date">日付</Label>
              <Input
                id="report_date"
                type="date"
                value={report.report_date}
                onChange={(e) => setReport({ ...report, report_date: e.target.value })}
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
              <Label htmlFor="temperature">気温（℃）</Label>
              <Input
                id="temperature"
                type="number"
                value={report.temperature}
                onChange={(e) => setReport({ ...report, temperature: e.target.value })}
                placeholder="例: 25"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="work_details">
              作業内容 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="work_details"
              value={report.work_details}
              onChange={(e) => setReport({ ...report, work_details: e.target.value })}
              placeholder="本日の作業内容を詳細に記入してください"
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issues">問題点・課題</Label>
            <Textarea
              id="issues"
              value={report.issues}
              onChange={(e) => setReport({ ...report, issues: e.target.value })}
              placeholder="発生した問題や課題があれば記入してください"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              value={report.notes}
              onChange={(e) => setReport({ ...report, notes: e.target.value })}
              placeholder="その他特記事項があれば記入してください"
              rows={3}
            />
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

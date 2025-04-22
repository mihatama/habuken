"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { sampleProjects } from "@/data/sample-data"
import { FileSpreadsheet, FileText, Download } from "lucide-react"

export function ReportExport() {
  const [exportSettings, setExportSettings] = useState({
    type: "daily",
    projectId: "",
    dateFrom: "",
    dateTo: "",
    format: "excel",
    includeImages: true,
    includeSummary: true,
  })

  // エクスポート設定を更新
  const updateSettings = (field: string, value: any) => {
    setExportSettings({ ...exportSettings, [field]: value })
  }

  // エクスポートを実行
  const executeExport = () => {
    console.log("エクスポート設定:", exportSettings)
    // ここで実際のエクスポート処理を実装
    alert("エクスポートを開始します")
  }

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-center mb-6">報告書エクスポート</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="type">報告種類</Label>
          <Select value={exportSettings.type} onValueChange={(value) => updateSettings("type", value)}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">作業日報</SelectItem>
              <SelectItem value="safety">安全巡視</SelectItem>
              <SelectItem value="both">両方</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="projectId">工事名</Label>
          <Select value={exportSettings.projectId} onValueChange={(value) => updateSettings("projectId", value)}>
            <SelectTrigger id="projectId">
              <SelectValue placeholder="すべての工事" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての工事</SelectItem>
              {sampleProjects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dateFrom">期間（開始）</Label>
          <Input
            id="dateFrom"
            type="date"
            value={exportSettings.dateFrom}
            onChange={(e) => updateSettings("dateFrom", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="dateTo">期間（終了）</Label>
          <Input
            id="dateTo"
            type="date"
            value={exportSettings.dateTo}
            onChange={(e) => updateSettings("dateTo", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>出力形式</Label>
        <RadioGroup
          value={exportSettings.format}
          onValueChange={(value) => updateSettings("format", value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="excel" id="excel" />
            <Label htmlFor="excel" className="flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel形式
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pdf" id="pdf" />
            <Label htmlFor="pdf" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              PDF形式
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label>オプション</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeImages"
              checked={exportSettings.includeImages}
              onCheckedChange={(checked) => updateSettings("includeImages", checked)}
            />
            <Label htmlFor="includeImages">写真を含める</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeSummary"
              checked={exportSettings.includeSummary}
              onCheckedChange={(checked) => updateSettings("includeSummary", checked)}
            />
            <Label htmlFor="includeSummary">集計シートを含める</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={executeExport} className="w-full max-w-xs">
          <Download className="h-4 w-4 mr-2" />
          エクスポート
        </Button>
      </div>

      <div className="border-t pt-6 text-sm text-gray-500">
        <p>※ エクスポートされたファイルは、選択した期間内のすべての報告書を含みます。</p>
        <p>※ Excel形式では、各報告書が別々のシートに出力されます。</p>
        <p>※ PDF形式では、各報告書が別々のページに出力されます。</p>
      </div>
    </div>
  )
}

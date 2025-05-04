"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle, Calendar, FileText, ClipboardList, MapPin, Building, DollarSign } from "lucide-react"
import Link from "next/link"
import { callClientRpc } from "@/lib/supabase-rpc"

interface DealDetailsProps {
  id: string
}

export function DealDetails({ id }: DealDetailsProps) {
  const [dealData, setDealData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDealDetails() {
      try {
        console.log("案件詳細を取得中...", id)
        const startTime = performance.now()

        // RPCを使用して案件詳細を取得
        const data = await callClientRpc("get_project_details", { project_id: id })

        const endTime = performance.now()
        console.log(`案件詳細取得完了: ${Math.round(endTime - startTime)}ms`)

        setDealData(data)
      } catch (error) {
        console.error("案件詳細取得エラー:", error)
        setError("案件データの読み込み中にエラーが発生しました。")
      } finally {
        setLoading(false)
      }
    }

    fetchDealDetails()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !dealData || !dealData.project) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p>{error || "案件データが見つかりませんでした。"}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            再読み込み
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { project, resources, daily_reports } = dealData

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{project.location || "場所未設定"}</span>
            <span className="mx-2">•</span>
            <Building className="h-4 w-4 mr-1" />
            <span>{project.client_name || "顧客未設定"}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/deals/${id}/daily-report`}>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              日報作成
            </Button>
          </Link>
          <Link href={`/deals/${id}/edit`}>
            <Button size="sm">編集</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">案件詳細</TabsTrigger>
          <TabsTrigger value="resources">リソース</TabsTrigger>
          <TabsTrigger value="reports">日報</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>案件情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">ステータス</h3>
                  <p>{project.status || "未設定"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">予算</h3>
                  <p className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {project.budget ? `¥${project.budget.toLocaleString()}` : "未設定"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">開始日</h3>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : "未設定"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">終了日</h3>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {project.end_date ? new Date(project.end_date).toLocaleDateString() : "未設定"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">説明</h3>
                <p className="whitespace-pre-wrap">{project.description || "説明はありません"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>割り当てリソース</CardTitle>
              <CardDescription>この案件に割り当てられているリソース</CardDescription>
            </CardHeader>
            <CardContent>
              {resources && resources.length > 0 ? (
                <div className="space-y-4">
                  {/* スタッフ */}
                  <div>
                    <h3 className="font-medium mb-2">スタッフ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {resources
                        .filter((r: any) => r.resource_type === "staff")
                        .map((resource: any) => (
                          <div key={resource.id} className="p-2 border rounded-md">
                            <p className="font-medium">{resource.details?.full_name || "名前なし"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(resource.start_date).toLocaleDateString()} -
                              {resource.end_date ? new Date(resource.end_date).toLocaleDateString() : "未定"}
                            </p>
                          </div>
                        ))}
                      {resources.filter((r: any) => r.resource_type === "staff").length === 0 && (
                        <p className="text-muted-foreground">スタッフの割り当てはありません</p>
                      )}
                    </div>
                  </div>

                  {/* 重機 */}
                  <div>
                    <h3 className="font-medium mb-2">重機</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {resources
                        .filter((r: any) => r.resource_type === "heavy_machinery")
                        .map((resource: any) => (
                          <div key={resource.id} className="p-2 border rounded-md">
                            <p className="font-medium">{resource.details?.name || "名前なし"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(resource.start_date).toLocaleDateString()} -
                              {resource.end_date ? new Date(resource.end_date).toLocaleDateString() : "未定"}
                            </p>
                          </div>
                        ))}
                      {resources.filter((r: any) => r.resource_type === "heavy_machinery").length === 0 && (
                        <p className="text-muted-foreground">重機の割り当てはありません</p>
                      )}
                    </div>
                  </div>

                  {/* 車両 */}
                  <div>
                    <h3 className="font-medium mb-2">車両</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {resources
                        .filter((r: any) => r.resource_type === "vehicle")
                        .map((resource: any) => (
                          <div key={resource.id} className="p-2 border rounded-md">
                            <p className="font-medium">{resource.details?.name || "名前なし"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(resource.start_date).toLocaleDateString()} -
                              {resource.end_date ? new Date(resource.end_date).toLocaleDateString() : "未定"}
                            </p>
                          </div>
                        ))}
                      {resources.filter((r: any) => r.resource_type === "vehicle").length === 0 && (
                        <p className="text-muted-foreground">車両の割り当てはありません</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">リソースの割り当てはありません</p>
              )}
            </CardContent>
            <CardFooter>
              <Link href={`/deals/${id}/edit`}>
                <Button variant="outline" size="sm">
                  リソース割り当てを編集
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>日報一覧</CardTitle>
              <CardDescription>この案件に関連する日報</CardDescription>
            </CardHeader>
            <CardContent>
              {daily_reports && daily_reports.length > 0 ? (
                <div className="space-y-2">
                  {daily_reports.map((report: any) => (
                    <div key={report.id} className="p-3 border rounded-md hover:bg-muted">
                      <div className="flex justify-between">
                        <p className="font-medium">{new Date(report.date).toLocaleDateString()}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            report.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : report.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {report.status === "approved"
                            ? "承認済"
                            : report.status === "pending"
                              ? "承認待ち"
                              : "下書き"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">作成者: {report.created_by?.name || "不明"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">日報はまだありません</p>
              )}
            </CardContent>
            <CardFooter>
              <Link href={`/deals/${id}/daily-report`}>
                <Button size="sm">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  新規日報作成
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

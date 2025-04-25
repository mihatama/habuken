"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { checkTableStructure, checkRLSPolicies, checkTableRecordCount } from "@/lib/supabase/debug-helper"
import { getClientSupabaseInstance } from "@/lib/supabase/supabaseClient"

export default function SupabaseDebugPage() {
  const [tableName, setTableName] = useState("staff")
  const [tableStructure, setTableStructure] = useState<any>(null)
  const [rlsPolicies, setRlsPolicies] = useState<any>(null)
  const [recordCount, setRecordCount] = useState<any>(null)
  const [queryResult, setQueryResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // テーブル構造を確認
  const handleCheckStructure = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await checkTableStructure(tableName)
      setTableStructure(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  // RLSポリシーを確認
  const handleCheckRLS = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await checkRLSPolicies(tableName)
      setRlsPolicies(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  // レコード数を確認
  const handleCheckCount = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await checkTableRecordCount(tableName)
      setRecordCount(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  // 直接クエリを実行
  const handleDirectQuery = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = getClientSupabaseInstance()
      const { data, error } = await supabase.from(tableName).select("*").limit(10)

      if (error) throw error

      setQueryResult({ data, count: data?.length || 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
      setQueryResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Supabaseデバッグツール</h1>

      <div className="mb-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="table-name" className="mb-2 block">
              テーブル名
            </Label>
            <Input
              id="table-name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="テーブル名を入力"
            />
          </div>
          <Button onClick={handleDirectQuery} disabled={loading}>
            {loading ? "読み込み中..." : "クエリ実行"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Button onClick={handleCheckStructure} disabled={loading} variant="outline">
          テーブル構造を確認
        </Button>
        <Button onClick={handleCheckRLS} disabled={loading} variant="outline">
          RLSポリシーを確認
        </Button>
        <Button onClick={handleCheckCount} disabled={loading} variant="outline">
          レコード数を確認
        </Button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <Tabs defaultValue="query">
        <TabsList className="mb-4">
          <TabsTrigger value="query">クエリ結果</TabsTrigger>
          <TabsTrigger value="structure">テーブル構造</TabsTrigger>
          <TabsTrigger value="rls">RLSポリシー</TabsTrigger>
          <TabsTrigger value="count">レコード数</TabsTrigger>
        </TabsList>

        <TabsContent value="query">
          <Card>
            <CardHeader>
              <CardTitle>クエリ結果</CardTitle>
              <CardDescription>テーブル「{tableName}」の最初の10件のデータ</CardDescription>
            </CardHeader>
            <CardContent>
              {queryResult ? (
                <div>
                  <p className="mb-2">取得件数: {queryResult.count}</p>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(queryResult.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <p>クエリを実行してください</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle>テーブル構造</CardTitle>
              <CardDescription>テーブル「{tableName}」のカラム情報</CardDescription>
            </CardHeader>
            <CardContent>
              {tableStructure ? (
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(tableStructure, null, 2)}
                </pre>
              ) : (
                <p>テーブル構造を確認してください</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rls">
          <Card>
            <CardHeader>
              <CardTitle>RLSポリシー</CardTitle>
              <CardDescription>テーブル「{tableName}」のRLSポリシー設定</CardDescription>
            </CardHeader>
            <CardContent>
              {rlsPolicies ? (
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(rlsPolicies, null, 2)}
                </pre>
              ) : (
                <p>RLSポリシーを確認してください</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="count">
          <Card>
            <CardHeader>
              <CardTitle>レコード数</CardTitle>
              <CardDescription>テーブル「{tableName}」の総レコード数</CardDescription>
            </CardHeader>
            <CardContent>
              {recordCount ? (
                <div>
                  <p className="text-xl font-bold">{recordCount.error ? "エラー" : `${recordCount.count || 0} 件`}</p>
                  {recordCount.error && <p className="text-red-500 mt-2">{recordCount.error}</p>}
                </div>
              ) : (
                <p>レコード数を確認してください</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

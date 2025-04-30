"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getClientSupabase } from "@/lib/supabase-utils"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Database, Plus } from "lucide-react"

export function CreateToolReservationsTable() {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkTableExists = async () => {
    try {
      setIsChecking(true)
      const supabase = getClientSupabase()

      const { error } = await supabase.from("tool_reservations").select("count(*)").limit(1).single()

      if (error && error.message.includes("does not exist")) {
        setTableExists(false)
      } else {
        setTableExists(true)
      }
    } catch (error) {
      console.error("テーブル確認エラー:", error)
      setTableExists(false)
    } finally {
      setIsChecking(false)
    }
  }

  const createTable = async () => {
    try {
      setIsCreating(true)
      const supabase = getClientSupabase()

      // Call the function we created to create the table
      const { error } = await supabase.rpc("create_tool_reservations_table")

      if (error) throw error

      toast({
        title: "テーブル作成成功",
        description: "備品予約テーブルが正常に作成されました",
      })

      setTableExists(true)
    } catch (error) {
      console.error("テーブル作成エラー:", error)
      toast({
        title: "エラー",
        description: "備品予約テーブルの作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Use useEffect to check if table exists when component mounts
  useEffect(() => {
    checkTableExists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array ensures this runs only once

  return (
    <Card>
      <CardHeader>
        <CardTitle>備品予約テーブル管理</CardTitle>
        <CardDescription>備品予約機能で使用するデータベーステーブルを管理します</CardDescription>
      </CardHeader>
      <CardContent>
        {isChecking ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            テーブル状態を確認中...
          </div>
        ) : tableExists ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
            <p className="text-green-700 dark:text-green-300 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              備品予約テーブルは既に存在しています
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-700 dark:text-yellow-300">
              備品予約テーブルが存在しません。作成ボタンをクリックしてテーブルを作成してください。
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={checkTableExists} disabled={isChecking}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
          再確認
        </Button>

        {!tableExists && (
          <Button onClick={createTable} disabled={isCreating || tableExists === null}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? "作成中..." : "テーブルを作成"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, FolderPlus, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function StorageSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const setupStorage = async () => {
    setIsLoading(true)
    setIsSuccess(false)

    try {
      const response = await fetch("/api/setup-storage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "ストレージのセットアップに失敗しました")
      }

      setIsSuccess(true)
      toast({
        title: "セットアップ成功",
        description: data.message || "ストレージが正常にセットアップされました",
      })
    } catch (error: any) {
      console.error("ストレージセットアップエラー:", error)
      toast({
        title: "セットアップエラー",
        description: error.message || "ストレージのセットアップ中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-medium mb-2">ストレージセットアップ</h3>
      <p className="text-sm text-gray-600 mb-4">
        ファイルアップロード機能を使用するには、Supabaseストレージバケットとフォルダを作成する必要があります。
      </p>
      <Button
        onClick={setupStorage}
        disabled={isLoading || isSuccess}
        className="w-full"
        variant={isSuccess ? "outline" : "default"}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            セットアップ中...
          </>
        ) : isSuccess ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            セットアップ完了
          </>
        ) : (
          <>
            <FolderPlus className="mr-2 h-4 w-4" />
            ストレージをセットアップ
          </>
        )}
      </Button>
    </div>
  )
}

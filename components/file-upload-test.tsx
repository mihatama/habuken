"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react"

// ファイル名を安全な形式に変換する関数
function sanitizeFileName(fileName: string): string {
  // 拡張子を取得
  const extension = fileName.split(".").pop() || ""

  // ファイル名からランダムな文字列を生成
  const randomString = Math.random().toString(36).substring(2, 15)

  // タイムスタンプを追加
  const timestamp = Date.now()

  // 安全なファイル名を生成
  return `${timestamp}-${randomString}.${extension}`
}

// ファイルをBase64に変換する関数
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

export function FileUploadTest() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success: boolean
    message: string
    url?: string
    originalFileName?: string
  } | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      // オリジナルのファイル名を保存
      const originalFileName = file.name

      // ファイルをBase64エンコード
      const base64Data = await fileToBase64(file)

      // サーバーサイドAPIを使用してアップロード
      const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64Data,
          fileName: originalFileName,
          contentType: file.type,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "ファイルのアップロードに失敗しました")
      }

      setUploadResult({
        success: true,
        message: "ファイルのアップロードに成功しました！",
        url: result.url,
        originalFileName,
      })

      toast({
        title: "アップロード成功",
        description: "ファイルが正常にアップロードされました。",
      })
    } catch (error: any) {
      console.error("ファイルアップロードエラー:", error)

      setUploadResult({
        success: false,
        message: `エラー: ${error.message || "不明なエラーが発生しました"}`,
      })

      toast({
        title: "アップロードエラー",
        description: error.message || "ファイルのアップロードに失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">ファイルアップロードテスト</h3>
        <p className="text-sm text-gray-500">
          このツールを使用して、ストレージバケットへのファイルアップロードをテストできます。
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => document.getElementById("test-file-upload")?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              アップロード中...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              ファイルを選択
            </>
          )}
        </Button>
        <input
          id="test-file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {uploadResult && (
        <div className={`p-4 rounded-md ${uploadResult.success ? "bg-green-50" : "bg-red-50"}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${uploadResult.success ? "text-green-800" : "text-red-800"}`}>
                {uploadResult.success ? "アップロード成功" : "アップロード失敗"}
              </h3>
              <div className={`mt-2 text-sm ${uploadResult.success ? "text-green-700" : "text-red-700"}`}>
                <p>{uploadResult.message}</p>
                {uploadResult.originalFileName && (
                  <p className="mt-1">元のファイル名: {uploadResult.originalFileName}</p>
                )}
                {uploadResult.url && (
                  <div className="mt-2">
                    <p className="font-medium">ファイルURL:</p>
                    <a
                      href={uploadResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {uploadResult.url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

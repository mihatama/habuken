"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle, Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface FileUploaderProps {
  onUpload: (file: File) => void
  acceptedFileTypes: string
  maxFileSizeMB: number
}

export function FileUploader({ onUpload, acceptedFileTypes, maxFileSizeMB }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "エラー",
        description: "ファイルを選択してください",
        variant: "destructive",
      })
      return
    }

    if (selectedFile.size > maxFileSizeMB * 1024 * 1024) {
      toast({
        title: "ファイルサイズエラー",
        description: `ファイルサイズが${maxFileSizeMB}MBを超えています`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadSuccess(false)
    setUploadError(null)

    try {
      // ここでファイルアップロード処理を実装
      // 例: APIエンドポイントにPOSTリクエストを送信
      await new Promise((resolve) => setTimeout(resolve, 1500)) // 1.5秒待機

      // 成功した場合
      setUploadSuccess(true)
      toast({
        title: "アップロード成功",
        description: "ファイルが正常にアップロードされました",
      })
      onUpload(selectedFile)
    } catch (error: any) {
      console.error("ファイルアップロードエラー:", error)
      setUploadError(error.message || "ファイルのアップロードに失敗しました")
      toast({
        title: "アップロードエラー",
        description: `ファイルのアップロードに失敗しました: ${error.message || "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          disabled={isUploading}
          className="flex-1"
        />
        <Button type="button" onClick={handleUpload} disabled={isUploading || !selectedFile}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              アップロード中...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              アップロード
            </>
          )}
        </Button>
      </div>

      {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}

      {uploadSuccess && (
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle className="h-4 w-4" />
          アップロードが完了しました
        </div>
      )}
    </div>
  )
}

// Add the FileUploadTest component that was missing
export function FileUploadTest() {
  const handleUpload = (file: File) => {
    console.log("File uploaded:", file.name)
    // Here you would typically handle the file, such as sending it to a server
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">ファイルアップロードテスト</h2>
      <FileUploader onUpload={handleUpload} acceptedFileTypes=".pdf,.jpg,.jpeg,.png,.doc,.docx" maxFileSizeMB={10} />
    </div>
  )
}

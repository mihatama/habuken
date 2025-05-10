"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { toast } from "@/components/ui/use-toast"
import { Loader2, X, FileText, Trash2 } from "lucide-react"
import type { DealFile } from "@/types/supabase"
import { fileToBase64 } from "@/utils/file-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DealFileUploadProps {
  dealId?: string
  onFilesUploaded?: (files: DealFile[]) => void
  existingFiles?: DealFile[]
}

export function DealFileUpload({ dealId, onFilesUploaded, existingFiles = [] }: DealFileUploadProps) {
  const [files, setFiles] = useState<DealFile[]>(existingFiles)
  const [uploadedFiles, setUploadedFiles] = useState<DealFile[]>(existingFiles)
  const [isUploading, setIsUploading] = useState(false)
  const [isBucketChecked, setBucketChecked] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})

  // コンポーネントマウント時にバケットの存在確認
  useEffect(() => {
    async function checkBucket() {
      try {
        // APIを使用してバケットの存在を確認
        const response = await fetch("/api/setup-storage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (!data.success) {
          console.error("バケット確認/作成エラー:", data.error)
          toast({
            title: "ストレージエラー",
            description: "ファイルストレージの準備に失敗しました。管理者にお問い合わせください。",
            variant: "destructive",
          })
        } else {
          console.log("バケット確認/作成成功")
          setBucketChecked(true)
        }
      } catch (error) {
        console.error("バケット確認中の予期しないエラー:", error)
      }
    }

    checkBucket()
  }, [])

  const uploadFiles = async (filesToUpload: (File & { uploading?: boolean; id?: string })[]) => {
    if (filesToUpload.length === 0) return

    setIsUploading(true)
    const newUploadedFiles: DealFile[] = []
    const uploadedFileIds: string[] = []

    try {
      for (const file of filesToUpload) {
        const fileId = file.id || uuidv4()

        // ファイルにIDを割り当て（まだない場合）
        if (!file.id) {
          file.id = fileId
        }

        // マークファイルをアップロード中として
        // setFiles((prev) =>
        //   prev.map((f) => (f === file || f.id === file.id ? { ...f, uploading: true, id: fileId } : f)),
        // )

        // ファイルをBase64に変換
        const base64Data = await fileToBase64(file)

        // APIを使用してファイルをアップロード
        const response = await fetch("/api/deal-files/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            base64Data,
            fileName: file.name,
            contentType: file.type,
            dealId,
          }),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "不明なエラー")
        }

        console.log("Upload successful, result:", result)

        // アップロードが完了したファイルのIDを記録
        uploadedFileIds.push(fileId)

        // ファイルメタデータがAPIから返された場合
        if (result.file) {
          newUploadedFiles.push(result.file)
        }
        // APIからファイルメタデータが返されなかった場合（dealIdがない場合など）
        else if (result.url) {
          // 仮のファイルメタデータを作成
          const tempFile: DealFile = {
            id: uuidv4(),
            deal_id: dealId || "",
            file_name: file.name,
            original_file_name: file.name,
            file_type: file.type,
            url: result.url,
            created_at: new Date().toISOString(),
          }
          newUploadedFiles.push(tempFile)
        }
      }

      // アップロード完了したファイルをリストから削除
      // IDベースで削除することで確実に削除する
      // setFiles((prev) => prev.filter((f) => !uploadedFileIds.includes(f.id || "")))

      // Update state with new uploaded files
      setUploadedFiles((prev) => [...prev, ...newUploadedFiles])

      // Notify parent component
      if (onFilesUploaded) {
        onFilesUploaded([...uploadedFiles, ...newUploadedFiles])
      }

      if (newUploadedFiles.length > 0) {
        toast({
          title: "アップロード完了",
          description: `${newUploadedFiles.length}個のPDFファイルがアップロードされました。`,
        })
      }
    } catch (error: any) {
      console.error("File upload error:", error)
      toast({
        title: "アップロードエラー",
        description: `PDFファイルのアップロードに失敗しました: ${error.message || "不明なエラー"}`,
        variant: "destructive",
      })

      // エラーが発生したファイルのアップロード中フラグをリセット
      // setFiles((prev) => prev.map((f) => (filesToUpload.includes(f) ? { ...f, uploading: false } : f)))
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // PDFファイルのみをフィルタリング
      const pdfFiles = acceptedFiles.filter((file) => file.type === "application/pdf")
      const nonPdfFiles = acceptedFiles.filter((file) => file.type !== "application/pdf")

      if (nonPdfFiles.length > 0) {
        toast({
          title: "ファイル形式エラー",
          description: `${nonPdfFiles.length}個のファイルがPDF形式ではありません。PDFファイルのみアップロードできます。`,
          variant: "destructive",
        })
      }

      // Filter files larger than 20MB
      const validFiles = pdfFiles.filter((file) => file.size <= 20 * 1024 * 1024)
      const oversizedFiles = pdfFiles.filter((file) => file.size > 20 * 1024 * 1024)

      if (oversizedFiles.length > 0) {
        toast({
          title: "ファイルサイズエラー",
          description: `${oversizedFiles.length}個のファイルが20MBを超えています。アップロードできませんでした。`,
          variant: "destructive",
        })
      }

      if (validFiles.length === 0) return

      // PDFファイルをアップロード用に準備
      const filesForUpload = validFiles.map((file) =>
        Object.assign(file, {
          uploading: false,
          id: uuidv4(), // 各ファイルに一意のIDを割り当て
        }),
      )

      setFiles((prev) => [...prev, ...filesForUpload])

      // 自動的にアップロードを開始
      uploadFiles(filesForUpload)
    },
    [dealId, isBucketChecked],
  )

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const deleteUploadedFile = async (file: DealFile) => {
    try {
      // APIを使用してファイルを削除
      const response = await fetch("/api/deal-files/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: file.id,
          filePath: file.file_name, // ファイル名をパスとして使用
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "不明なエラー")
      }

      // Update state
      setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id))

      // Notify parent component if callback exists
      if (onFilesUploaded) {
        onFilesUploaded(uploadedFiles.filter((f) => f.id !== file.id))
      }

      toast({
        title: "ファイル削除",
        description: "PDFファイルが正常に削除されました。",
      })
    } catch (error: any) {
      console.error("File deletion error:", error)
      toast({
        title: "削除エラー",
        description: `PDFファイルの削除に失敗しました: ${error.message || "不明なエラー"}`,
        variant: "destructive",
      })
    }
  }

  const renderFilePreview = (file: File & { uploading?: boolean; id?: string }, index: number) => {
    return (
      <div key={file.id || index} className="relative flex items-center p-2 w-full rounded border border-gray-200">
        <FileText className="h-6 w-6 mr-2 text-blue-500" />
        <span className="text-sm truncate max-w-[180px]">{file.name}</span>
        {file.uploading ? (
          <Loader2 className="ml-auto h-4 w-4 text-gray-500 animate-spin" />
        ) : (
          <button onClick={() => removeFile(index)} className="ml-auto text-gray-500 hover:text-gray-700" type="button">
            <X size={16} />
          </button>
        )}
      </div>
    )
  }

  const renderUploadedFile = (file: DealFile) => {
    return (
      <div key={file.id} className="relative flex items-center p-2 w-full rounded border border-gray-200">
        <FileText className="h-6 w-6 mr-2 text-blue-500" />
        <span className="text-sm truncate max-w-[180px]">{file.original_file_name || file.file_name}</span>
        <button
          onClick={() => deleteUploadedFile(file)}
          className="ml-auto text-gray-500 hover:text-gray-700"
          type="button"
        >
          <Trash2 size={16} />
        </button>
      </div>
    )
  }

  // ファイルアップロード処理
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files
      if (!fileList || fileList.length === 0) return

      setIsUploading(true)
      setUploadProgress(0)

      try {
        const file = fileList[0]
        const formData = new FormData()
        formData.append("file", file)
        formData.append("dealId", dealId)

        // アップロード進捗のシミュレーション
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 300)

        const response = await fetch("/api/deal-files/upload", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "ファイルのアップロードに失敗しました")
        }

        const data = await response.json()

        if (data.success) {
          toast({
            title: "アップロード成功",
            description: "ファイルが正常にアップロードされました",
          })

          // 新しいファイルを追加
          const newFile = data.file
          const updatedFiles = [...files, newFile]
          setFiles(updatedFiles)

          // 親コンポーネントに通知
          if (onFilesUploaded) {
            onFilesUploaded(updatedFiles)
          }
        } else {
          throw new Error(data.error || "ファイルのアップロードに失敗しました")
        }
      } catch (error: any) {
        console.error("アップロードエラー:", error)
        toast({
          title: "エラー",
          description: `アップロード失敗: ${error.message}`,
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
        // ファイル入力をリセット
        event.target.value = ""
      }
    },
    [dealId, files, onFilesUploaded],
  )

  // ファイル削除処理
  const deleteUploadedFile2 = useCallback(
    async (file: DealFile) => {
      if (!file || !file.file_name) return

      setIsDeleting((prev) => ({ ...prev, [file.id]: true }))

      try {
        const response = await fetch("/api/deal-files/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.file_name,
            fileId: file.id,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "ファイルの削除に失敗しました")
        }

        const data = await response.json()

        if (data.success) {
          toast({
            title: "削除成功",
            description: "ファイルが正常に削除されました",
          })

          // 削除したファイルを除外
          const updatedFiles = files.filter((f) => f.id !== file.id)
          setFiles(updatedFiles)

          // 親コンポーネントに通知
          if (onFilesUploaded) {
            onFilesUploaded(updatedFiles)
          }
        } else {
          throw new Error(data.error || "ファイルの削除に失敗しました")
        }
      } catch (error: any) {
        console.error("削除エラー:", error)
        toast({
          title: "エラー",
          description: `削除失敗: ${error.message}`,
          variant: "destructive",
        })
      } finally {
        setIsDeleting((prev) => ({ ...prev, [file.id]: false }))
      }
    },
    [files, onFilesUploaded],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          type="file"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="flex-1"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
        />
        {isUploading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{uploadProgress}%</span>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">アップロード済みファイル</h4>
          <div className="grid gap-2">
            {files.map((file) => (
              <div key={file.id} className="flex justify-between items-center bg-gray-50 rounded-md px-3 py-2 text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{file.original_file_name || file.file_name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteUploadedFile2(file)}
                  disabled={isDeleting[file.id]}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  {isDeleting[file.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

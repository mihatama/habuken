"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { v4 as uuidv4 } from "uuid"
import { getClientSupabase } from "@/lib/supabase-utils"
import { toast } from "@/components/ui/use-toast"
import { Loader2, X, FileText, FileIcon as FilePdf, Trash2 } from "lucide-react"
import type { DealFile } from "@/types/supabase"
import { STORAGE_BUCKET_NAME, ensureStorageBucketExists } from "@/lib/supabase-storage-utils"

interface DealFileUploadProps {
  dealId?: string
  onFilesUploaded?: (files: DealFile[]) => void
  existingFiles?: DealFile[]
}

export function DealFileUpload({ dealId, onFilesUploaded, existingFiles = [] }: DealFileUploadProps) {
  const [files, setFiles] = useState<(File & { uploading?: boolean })[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<DealFile[]>(existingFiles)
  const [isUploading, setIsUploading] = useState(false)
  const [isBucketChecked, setBucketChecked] = useState(false)

  // コンポーネントマウント時にバケットの存在確認
  useEffect(() => {
    async function checkBucket() {
      try {
        const { success, error } = await ensureStorageBucketExists()
        if (!success) {
          console.error("バケット確認/作成エラー:", error)
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

  const uploadFiles = async (filesToUpload: (File & { uploading?: boolean })[]) => {
    if (!dealId || filesToUpload.length === 0) return

    // バケットが確認されていない場合は再確認
    if (!isBucketChecked) {
      const { success } = await ensureStorageBucketExists()
      if (!success) {
        toast({
          title: "ストレージエラー",
          description: "ファイルストレージの準備に失敗しました。管理者にお問い合わせください。",
          variant: "destructive",
        })
        return
      }
      setBucketChecked(true)
    }

    setIsUploading(true)
    const supabase = getClientSupabase()
    const newUploadedFiles: DealFile[] = []

    try {
      // バケットの一覧を取得して確認
      const { data: buckets } = await supabase.storage.listBuckets()
      console.log(
        "Available buckets:",
        buckets?.map((b) => b.name),
      )

      for (const file of filesToUpload) {
        // マークファイルをアップロード中として
        setFiles((prev) => prev.map((f) => (f === file ? { ...f, uploading: true } : f)))

        const fileId = uuidv4()
        const filePath = `${dealId}/${fileId}-${file.name}`

        console.log(`Uploading PDF to ${STORAGE_BUCKET_NAME}/${filePath}`)

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage.from(STORAGE_BUCKET_NAME).upload(filePath, file, {
          contentType: "application/pdf",
          upsert: false,
        })

        if (error) {
          console.error("Storage upload error:", error)
          throw error
        }

        console.log("Upload successful, data:", data)

        // Get public URL
        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET_NAME).getPublicUrl(filePath)

        console.log("Public URL:", urlData?.publicUrl)

        if (!urlData?.publicUrl) {
          throw new Error("Failed to get public URL for uploaded file")
        }

        // Insert metadata into database
        const { data: fileData, error: dbError } = await supabase
          .from("deal_files")
          .insert({
            deal_id: dealId,
            file_name: file.name,
            file_type: file.type,
            url: urlData.publicUrl,
          })
          .select()
          .single()

        if (dbError) {
          console.error("Database insert error:", dbError)
          throw dbError
        }

        console.log("Database insert successful, fileData:", fileData)
        newUploadedFiles.push(fileData)

        // アップロード完了したファイルをリストから削除
        setFiles((prev) => prev.filter((f) => f !== file))
      }

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
      setFiles((prev) => prev.map((f) => (filesToUpload.includes(f) ? { ...f, uploading: false } : f)))
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
        }),
      )

      setFiles((prev) => [...prev, ...filesForUpload])

      // 自動的にアップロードを開始
      uploadFiles(filesForUpload)
    },
    [dealId, isBucketChecked],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
    disabled: !isBucketChecked, // バケットが確認されるまでドロップゾーンを無効化
  })

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const deleteUploadedFile = async (file: DealFile) => {
    if (!dealId) return

    try {
      const supabase = getClientSupabase()

      // Extract the path from the URL
      const urlParts = file.url.split("/")
      const filePath = urlParts.slice(urlParts.indexOf(STORAGE_BUCKET_NAME) + 1).join("/")

      console.log("Deleting file from path:", filePath)

      // Delete from storage
      const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET_NAME).remove([filePath])

      if (storageError) {
        console.error("Storage delete error:", storageError)
        throw storageError
      }

      // Delete from database
      const { error: dbError } = await supabase.from("deal_files").delete().eq("id", file.id)

      if (dbError) {
        console.error("Database delete error:", dbError)
        throw dbError
      }

      // Update state
      setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id))

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

  const renderFilePreview = (file: File & { uploading?: boolean }, index: number) => {
    return (
      <div key={index} className="relative flex items-center p-2 w-full rounded border border-gray-200">
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
        <span className="text-sm truncate max-w-[180px]">{file.file_name}</span>
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

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            !isBucketChecked
              ? "border-gray-300 bg-gray-100 cursor-not-allowed"
              : isDragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary/50"
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          {!isBucketChecked ? (
            <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          ) : isUploading ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <FilePdf className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">PDFファイルをドラッグ＆ドロップするか、クリックして選択</p>
              <p className="text-xs text-gray-500">PDFファイルのみ（最大20MB）</p>
            </>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">アップロード中のファイル</div>
          <div className="flex flex-col gap-2">{files.map((file, index) => renderFilePreview(file, index))}</div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">アップロード済みファイル</div>
          <div className="flex flex-col gap-2">{uploadedFiles.map((file) => renderUploadedFile(file))}</div>
        </div>
      )}
    </div>
  )
}

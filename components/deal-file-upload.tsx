"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { v4 as uuidv4 } from "uuid"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, X, FileText, ImageIcon, Trash2, Camera } from "lucide-react"
import type { DealFile } from "@/types/supabase"

// バケット名を定数として定義
const STORAGE_BUCKET_NAME = "genba"
const STORAGE_FOLDER_NAME = "public/genba_files"

interface DealFileUploadProps {
  dealId?: string
  onFilesUploaded?: (files: DealFile[]) => void
  existingFiles?: DealFile[]
}

export function DealFileUpload({ dealId, onFilesUploaded, existingFiles = [] }: DealFileUploadProps) {
  const [files, setFiles] = useState<(File & { preview?: string })[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<DealFile[]>(existingFiles)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [isCameraActive, setIsCameraActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter files larger than 20MB
    const validFiles = acceptedFiles.filter((file) => file.size <= 20 * 1024 * 1024)
    const oversizedFiles = acceptedFiles.filter((file) => file.size > 20 * 1024 * 1024)

    if (oversizedFiles.length > 0) {
      toast({
        title: "ファイルサイズエラー",
        description: `${oversizedFiles.length}個のファイルが20MBを超えています。アップロードできませんでした。`,
        variant: "destructive",
      })
    }

    // Create preview for image files
    const filesWithPreview = validFiles.map((file) =>
      Object.assign(file, {
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      }),
    )

    setFiles((prev) => [...prev, ...filesWithPreview])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    multiple: true,
  })

  // Clean up previews when component unmounts
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview)
      })
    }
  }, [files])

  const activateCamera = () => {
    setIsCameraActive(true)
  }

  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement("video")
      video.srcObject = stream

      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play()
          resolve(null)
        }
      })

      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Stop all video streams
      stream.getTracks().forEach((track) => track.stop())

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.8))

      // Create a File object from the blob
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" })

      // Add preview
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(blob),
      })

      setFiles((prev) => [...prev, fileWithPreview])
      setIsCameraActive(false)
    } catch (error) {
      console.error("Camera error:", error)
      toast({
        title: "カメラエラー",
        description: "カメラへのアクセスに失敗しました。",
        variant: "destructive",
      })
      setIsCameraActive(false)
    }
  }

  const cancelCamera = () => {
    setIsCameraActive(false)
  }

  const uploadFiles = async () => {
    if (!dealId || files.length === 0) return

    setIsUploading(true)
    const supabase = getClientSupabase()
    const newUploadedFiles: DealFile[] = []
    const newProgress = { ...uploadProgress }

    try {
      for (const file of files) {
        const fileId = uuidv4()
        const filePath = `${dealId}/${fileId}-${file.name}`
        newProgress[fileId] = 0
        setUploadProgress(newProgress)

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage.from(STORAGE_BUCKET_NAME).upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        })

        if (error) {
          throw error
        }

        // Get public URL
        const publicUrl = supabase.storage.from(STORAGE_BUCKET_NAME).getPublicUrl(data.path).data.publicUrl

        // Insert metadata into database
        const { data: fileData, error: dbError } = await supabase
          .from("deal_files")
          .insert({
            deal_id: dealId,
            file_name: file.name,
            file_type: file.type,
            url: publicUrl,
          })
          .select()
          .single()

        if (dbError) {
          throw dbError
        }

        newProgress[fileId] = 100
        setUploadProgress(newProgress)
        newUploadedFiles.push(fileData)
      }

      // Update state with new uploaded files
      setUploadedFiles((prev) => [...prev, ...newUploadedFiles])
      setFiles([])

      // Notify parent component
      if (onFilesUploaded) {
        onFilesUploaded([...uploadedFiles, ...newUploadedFiles])
      }

      toast({
        title: "アップロード完了",
        description: `${newUploadedFiles.length}個のファイルがアップロードされました。`,
      })
    } catch (error: any) {
      console.error("File upload error:", error)
      toast({
        title: "アップロードエラー",
        description: `ファイルのアップロードに失敗しました: ${error.message || "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      const file = newFiles[index]
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
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

      // Delete from storage
      const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET_NAME).remove([filePath])

      if (storageError) {
        throw storageError
      }

      // Delete from database
      const { error: dbError } = await supabase.from("deal_files").delete().eq("id", file.id)

      if (dbError) {
        throw dbError
      }

      // Update state
      setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id))

      toast({
        title: "ファイル削除",
        description: "ファイルが正常に削除されました。",
      })
    } catch (error: any) {
      console.error("File deletion error:", error)
      toast({
        title: "削除エラー",
        description: `ファイルの削除に失敗しました: ${error.message || "不明なエラー"}`,
        variant: "destructive",
      })
    }
  }

  const renderFilePreview = (file: File & { preview?: string }, index: number) => {
    if (file.type.startsWith("image/") && file.preview) {
      return (
        <div key={index} className="relative w-24 h-24 rounded overflow-hidden border border-gray-200">
          <Image src={file.preview || "/placeholder.svg"} alt={file.name} fill style={{ objectFit: "cover" }} />
          <button
            onClick={() => removeFile(index)}
            className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white"
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      )
    } else {
      return (
        <div key={index} className="relative flex items-center p-2 w-full rounded border border-gray-200">
          <FileText className="h-6 w-6 mr-2 text-blue-500" />
          <span className="text-sm truncate max-w-[180px]">{file.name}</span>
          <button onClick={() => removeFile(index)} className="ml-auto text-gray-500 hover:text-gray-700" type="button">
            <X size={16} />
          </button>
        </div>
      )
    }
  }

  const renderUploadedFile = (file: DealFile) => {
    if (file.file_type.startsWith("image/")) {
      return (
        <div key={file.id} className="relative w-24 h-24 rounded overflow-hidden border border-gray-200">
          <Image src={file.url || "/placeholder.svg"} alt={file.file_name} fill style={{ objectFit: "cover" }} />
          <button
            onClick={() => deleteUploadedFile(file)}
            className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white"
            type="button"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    } else {
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
  }

  if (isCameraActive) {
    return (
      <div className="space-y-4">
        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
          <video id="camera-preview" autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button type="button" variant="destructive" onClick={cancelCamera}>
              キャンセル
            </Button>
            <Button type="button" onClick={capturePhoto}>
              撮影
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        <Button type="button" variant="outline" onClick={activateCamera} className="flex items-center">
          <Camera className="mr-2 h-4 w-4" />
          カメラで撮影
        </Button>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">ファイルをドラッグ＆ドロップするか、クリックして選択</p>
              <p className="text-xs text-gray-500">PDFまたは画像ファイル（最大20MB）</p>
            </>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">選択されたファイル</div>
          <div className="flex flex-wrap gap-2">{files.map((file, index) => renderFilePreview(file, index))}</div>
          <Button type="button" onClick={uploadFiles} disabled={isUploading} className="mt-2">
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            アップロード
          </Button>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">アップロード済みファイル</div>
          <div className="flex flex-wrap gap-2">{uploadedFiles.map((file) => renderUploadedFile(file))}</div>
        </div>
      )}
    </div>
  )
}

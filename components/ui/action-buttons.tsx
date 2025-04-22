"use client"
import { Button } from "@/components/ui/button"
import { Save, Download, Camera } from "lucide-react"

type ActionButtonsProps = {
  onSave?: () => void
  onExport?: () => void
  onPhoto?: () => void
  isSubmitting?: boolean
  className?: string
}

export function ActionButtons({ onSave, onExport, onPhoto, isSubmitting, className }: ActionButtonsProps) {
  return (
    <div className={`flex justify-between mt-6 ${className || ""}`}>
      <div className="flex space-x-2">
        {onPhoto && (
          <Button variant="outline" onClick={onPhoto}>
            <Camera className="h-4 w-4 mr-2" />
            写真撮影
          </Button>
        )}
      </div>
      <div className="flex space-x-2">
        {onExport && (
          <Button variant="outline" onClick={onExport} disabled={isSubmitting}>
            <Download className="h-4 w-4 mr-2" />
            Excel出力
          </Button>
        )}
        {onSave && (
          <Button onClick={onSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                保存
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

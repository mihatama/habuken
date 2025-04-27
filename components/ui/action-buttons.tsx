"use client"
import { Button } from "@/components/ui/button"
import { Download, Camera, Save, Loader2 } from "lucide-react"

// ActionButtons props
interface ActionButtonsProps {
  onSave: () => void
  onExport: () => void
  onPhoto: () => void
  isSubmitting: boolean
  className?: string
}

// ActionButtons component
export function ActionButtons({ onSave, onExport, onPhoto, isSubmitting, className }: ActionButtonsProps) {
  return (
    <div className={`flex justify-center space-x-4 ${className}`}>
      <Button variant="outline" onClick={onExport} disabled={isSubmitting}>
        <Download className="mr-2 h-4 w-4" />
        Excel出力
      </Button>
      <Button variant="outline" onClick={onPhoto} disabled={isSubmitting}>
        <Camera className="mr-2 h-4 w-4" />
        写真撮影
      </Button>
      <Button onClick={onSave} disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        保存
      </Button>
    </div>
  )
}

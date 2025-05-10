"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"

interface ScrollableDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  maxWidth?: string
  maxHeight?: string
}

export function ScrollableDialog({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  maxWidth = "max-w-2xl",
  maxHeight = "max-h-[90vh]",
}: ScrollableDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`${maxWidth} p-0 overflow-hidden ${className}`}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {title && (
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle>{title}</DialogTitle>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>
        )}
        <div className={`${maxHeight} overflow-y-auto p-4`}>{children}</div>
      </DialogContent>
    </Dialog>
  )
}

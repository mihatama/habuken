"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ScrollableDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
  maxHeight?: string
  className?: string
}

export function ScrollableDialog({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-3xl",
  maxHeight = "max-h-[80vh]",
  className,
}: ScrollableDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(maxWidth, "overflow-hidden flex flex-col", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className={cn("overflow-y-auto pr-1", maxHeight)}>{children}</div>
      </DialogContent>
    </Dialog>
  )
}
